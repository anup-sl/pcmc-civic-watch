import { createClient } from '@supabase/supabase-js';
import type { Hotspot, Report, Category } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxkpvqobtfstysszezwk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6RSg1BUPhGGm0L4_VOXp-A_LJaNzh4o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Calculate Haversine distance between two coordinates in meters.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Upload an image file (File or Blob) to the 'civic-photos' Supabase storage bucket.
 * Returns public URL. If bucket is not accessible, falls back gracefully.
 */
export async function uploadCivicPhoto(
  file: File | Blob,
  fileNamePrefix: string = 'issue'
): Promise<{ url: string; uploadedToStorage: boolean; note?: string }> {
  const fileExt = file instanceof File && file.name.includes('.') 
    ? file.name.split('.').pop() 
    : 'jpg';
  const filePath = `${fileNamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    const { error } = await supabase.storage
      .from('civic-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.warn('Storage upload warning:', error.message);
      const dataUrl = await blobToDataUrl(file);
      return { 
        url: dataUrl, 
        uploadedToStorage: false, 
        note: `Storage bucket note: ${error.message}. Local preview saved.` 
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('civic-photos')
      .getPublicUrl(filePath);

    return { 
      url: publicUrlData.publicUrl, 
      uploadedToStorage: true 
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Storage exception, using fallback data URL:', message);
    const dataUrl = await blobToDataUrl(file);
    return { 
      url: dataUrl, 
      uploadedToStorage: false, 
      note: 'Stored as embedded data URI' 
    };
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface SubmitReportParams {
  category: Category;
  subTag: string;
  latitude: number;
  longitude: number;
  areaName?: string;
  slaHours: number;
  photoBlob: Blob | File;
  notes?: string;
}

export interface SubmitReportResult {
  hotspot: Hotspot;
  report: Report;
  actionTaken: 'NEW_HOTSPOT' | 'CORROBORATED' | 'CHRONIC_REOPENED';
  distanceToExisting?: number;
}

/**
 * Core submission logic:
 * 1. Upload photo to civic-photos bucket.
 * 2. Check existing hotspots of the same category within 20 meters (Haversine formula).
 * 3. If an OPEN hotspot exists: increment corroboration_count; insert CORROBORATION report.
 * 4. If a RESOLVED hotspot exists closed within 14 days: reopen it as 'CHRONIC_REOPENED' and increment recurrence_count; insert REOPEN report.
 * 5. Otherwise: create new hotspot and insert INITIAL report.
 */
export async function submitCivicReport(params: SubmitReportParams): Promise<SubmitReportResult> {
  const { url: photoUrl } = await uploadCivicPhoto(params.photoBlob, params.category.toLowerCase());

  const { data: hotspots, error: fetchError } = await supabase
    .from('hotspots')
    .select('*')
    .eq('category', params.category);

  if (fetchError) {
    console.error('Error querying hotspots:', fetchError);
    throw new Error(`Failed to check existing hotspots: ${fetchError.message}`);
  }

  const nearbyHotspots = (hotspots as Hotspot[] || [])
    .map(h => ({
      hotspot: h,
      distance: haversineDistanceMeters(params.latitude, params.longitude, h.latitude, h.longitude)
    }))
    .filter(item => item.distance <= 20)
    .sort((a, b) => a.distance - b.distance);

  const openMatch = nearbyHotspots.find(
    item => item.hotspot.status === 'OPEN' || item.hotspot.status === 'CHRONIC_REOPENED'
  );

  if (openMatch) {
    const currentCount = openMatch.hotspot.corroboration_count || 1;
    const { data: updatedHotspot, error: updateError } = await supabase
      .from('hotspots')
      .update({
        corroboration_count: currentCount + 1
      })
      .eq('id', openMatch.hotspot.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update hotspot: ${updateError.message}`);
    }

    const { data: newReport, error: reportError } = await supabase
      .from('reports')
      .insert({
        hotspot_id: openMatch.hotspot.id,
        report_type: 'CORROBORATION',
        photo_url: photoUrl,
        notes: params.notes || 'Citizen corroboration nearby (within 20m)'
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Failed to insert report: ${reportError.message}`);
    }

    return {
      hotspot: updatedHotspot as Hotspot,
      report: newReport as Report,
      actionTaken: 'CORROBORATED',
      distanceToExisting: Math.round(openMatch.distance)
    };
  }

  const now = new Date();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const resolvedMatch = nearbyHotspots.find(item => {
    if (item.hotspot.status !== 'RESOLVED') return false;
    if (!item.hotspot.resolved_at) return false;
    const resolvedTime = new Date(item.hotspot.resolved_at).getTime();
    return (now.getTime() - resolvedTime) <= fourteenDaysMs;
  });

  if (resolvedMatch) {
    const currentRecurrence = resolvedMatch.hotspot.recurrence_count || 0;
    const { data: updatedHotspot, error: updateError } = await supabase
      .from('hotspots')
      .update({
        status: 'CHRONIC_REOPENED',
        recurrence_count: currentRecurrence + 1,
        resolved_at: null
      })
      .eq('id', resolvedMatch.hotspot.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to reopen hotspot: ${updateError.message}`);
    }

    const { data: newReport, error: reportError } = await supabase
      .from('reports')
      .insert({
        hotspot_id: resolvedMatch.hotspot.id,
        report_type: 'REOPEN',
        photo_url: photoUrl,
        notes: params.notes || 'Reopened: Chronic issue recurred within 14 days'
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Failed to insert report: ${reportError.message}`);
    }

    return {
      hotspot: updatedHotspot as Hotspot,
      report: newReport as Report,
      actionTaken: 'CHRONIC_REOPENED',
      distanceToExisting: Math.round(resolvedMatch.distance)
    };
  }

  const { data: newHotspot, error: hotspotError } = await supabase
    .from('hotspots')
    .insert({
      category: params.category,
      sub_tag: params.subTag,
      latitude: params.latitude,
      longitude: params.longitude,
      area_name: params.areaName || 'Pimpri Chinchwad',
      status: 'OPEN',
      corroboration_count: 1,
      recurrence_count: 0,
      sla_hours: params.slaHours
    })
    .select()
    .single();

  if (hotspotError) {
    throw new Error(`Failed to create new hotspot: ${hotspotError.message}`);
  }

  const { data: newReport, error: reportError } = await supabase
    .from('reports')
    .insert({
      hotspot_id: newHotspot.id,
      report_type: 'INITIAL',
      photo_url: photoUrl,
      notes: params.notes || null
    })
    .select()
    .single();

  if (reportError) {
    throw new Error(`Failed to insert initial report: ${reportError.message}`);
  }

  return {
    hotspot: newHotspot as Hotspot,
    report: newReport as Report,
    actionTaken: 'NEW_HOTSPOT'
  };
}

/**
 * Mark a hotspot as RESOLVED with live After photo (Clearance action)
 */
export async function submitClearanceReport(
  hotspotId: string,
  afterPhotoBlob: Blob | File,
  notes?: string
) {
  const { url: photoUrl } = await uploadCivicPhoto(afterPhotoBlob, 'clearance');

  const { data: newReport, error: reportError } = await supabase
    .from('reports')
    .insert({
      hotspot_id: hotspotId,
      report_type: 'CLEARANCE',
      photo_url: photoUrl,
      notes: notes || 'Citizen verified clearance with live After photo'
    })
    .select()
    .single();

  if (reportError) throw reportError;

  const { data: updatedHotspot, error: updateError } = await supabase
    .from('hotspots')
    .update({
      status: 'RESOLVED',
      resolved_at: new Date().toISOString()
    })
    .eq('id', hotspotId)
    .select()
    .single();

  if (updateError) throw updateError;

  return {
    hotspot: updatedHotspot as Hotspot,
    report: newReport as Report
  };
}

/**
 * Corroborate an existing hotspot (+1)
 */
export async function corroborateHotspot(hotspotId: string, notes?: string) {
  const { data: current, error: getError } = await supabase
    .from('hotspots')
    .select('corroboration_count')
    .eq('id', hotspotId)
    .single();

  if (getError) throw getError;

  const newCount = (current.corroboration_count || 1) + 1;

  const { data: updated, error: updateError } = await supabase
    .from('hotspots')
    .update({ corroboration_count: newCount })
    .eq('id', hotspotId)
    .select()
    .single();

  if (updateError) throw updateError;

  await supabase.from('reports').insert({
    hotspot_id: hotspotId,
    report_type: 'CORROBORATION',
    photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop',
    notes: notes || 'Citizen corroborated this issue (+1)'
  });

  return updated as Hotspot;
}

export interface FlagReportParams {
  reportId?: string;
  hotspotId?: string;
  reason: 'private_property' | 'personal_dispute' | 'abusive_vulgar' | 'harassment_spam' | string;
  reasonLabel: string;
  notes?: string;
}

export interface ModerationQueueItem {
  id: string;
  hotspot_id: string;
  created_at: string;
  reason: string;
  reason_label: string;
  notes?: string;
  target_report_id?: string;
  hotspot?: Hotspot | null;
  target_report?: Report | null;
}

/**
 * Submit community content flag/report for abusive, private, or prohibited content.
 * Stores directly in Supabase reports table with report_type = 'FLAG' for instant cross-device moderator review.
 */
export async function submitFlagReport(params: FlagReportParams): Promise<{ success: boolean }> {
  try {
    const payload = JSON.stringify({
      reason: params.reason,
      reasonLabel: params.reasonLabel,
      notes: params.notes || '',
      targetReportId: params.reportId || ''
    });

    if (params.hotspotId) {
      await supabase.from('reports').insert({
        hotspot_id: params.hotspotId,
        report_type: 'FLAG',
        photo_url: '',
        notes: payload
      });
    }
  } catch (err) {
    console.warn('Flag logging notice:', err);
  }

  try {
    const key = 'pcmc_flagged_items';
    const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (params.reportId) existing.push(`report:${params.reportId}`);
    if (params.hotspotId) existing.push(`hotspot:${params.hotspotId}`);
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(existing))));
  } catch {
    // ignore
  }

  return { success: true };
}

/**
 * Fetch all items in the moderation queue for the Moderator Portal
 */
export async function fetchModerationQueue(): Promise<ModerationQueueItem[]> {
  try {
    const { data: flagRows, error } = await supabase
      .from('reports')
      .select('*')
      .eq('report_type', 'FLAG')
      .order('created_at', { ascending: false });

    if (error || !flagRows) return [];

    const queue: ModerationQueueItem[] = [];

    for (const row of flagRows) {
      let parsedPayload: { reason?: string; reasonLabel?: string; notes?: string; targetReportId?: string } = {};
      try {
        if (row.notes && row.notes.startsWith('{')) {
          parsedPayload = JSON.parse(row.notes);
        } else {
          parsedPayload = { reason: 'reported', reasonLabel: row.notes || 'Community Flag' };
        }
      } catch {
        parsedPayload = { reason: 'reported', reasonLabel: row.notes || 'Community Flag' };
      }

      // Fetch hotspot details
      let hotspot: Hotspot | null = null;
      if (row.hotspot_id) {
        const { data: hData } = await supabase
          .from('hotspots')
          .select('*')
          .eq('id', row.hotspot_id)
          .single();
        if (hData) hotspot = hData as Hotspot;
      }

      // Fetch target report if available, else pick first photo report for this hotspot
      let targetReport: Report | null = null;
      if (parsedPayload.targetReportId) {
        const { data: rData } = await supabase
          .from('reports')
          .select('*')
          .eq('id', parsedPayload.targetReportId)
          .single();
        if (rData) targetReport = rData as Report;
      } else if (row.hotspot_id) {
        const { data: rData } = await supabase
          .from('reports')
          .select('*')
          .eq('hotspot_id', row.hotspot_id)
          .neq('report_type', 'FLAG')
          .order('created_at', { ascending: true })
          .limit(1);
        if (rData && rData.length > 0) targetReport = rData[0] as Report;
      }

      queue.push({
        id: row.id,
        hotspot_id: row.hotspot_id,
        created_at: row.created_at,
        reason: parsedPayload.reason || 'abusive_vulgar',
        reason_label: parsedPayload.reasonLabel || 'Community Content Violation',
        notes: parsedPayload.notes || undefined,
        target_report_id: parsedPayload.targetReportId || targetReport?.id,
        hotspot,
        target_report: targetReport
      });
    }

    return queue;
  } catch (e) {
    console.warn('Error fetching moderation queue:', e);
    return [];
  }
}

/**
 * Permanently delete violating content: deletes target report, purges hotspot if empty, and removes flag
 */
export async function deleteModeratedContent(
  flagId: string,
  targetReportId?: string,
  hotspotId?: string
): Promise<{ success: boolean }> {
  try {
    // 1. Delete target violating report if present
    if (targetReportId) {
      await supabase.from('reports').delete().eq('id', targetReportId);
    }

    // 2. Delete the flag record
    await supabase.from('reports').delete().eq('id', flagId);

    // 3. Check remaining reports for this hotspot
    if (hotspotId) {
      const { data: remaining } = await supabase
        .from('reports')
        .select('id')
        .eq('hotspot_id', hotspotId)
        .neq('report_type', 'FLAG');

      if (!remaining || remaining.length === 0) {
        // No remaining reports; purge the entire hotspot
        await supabase.from('hotspots').delete().eq('id', hotspotId);
      } else {
        // Decrement count
        await supabase
          .from('hotspots')
          .update({ corroboration_count: remaining.length })
          .eq('id', hotspotId);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting moderated content:', err);
    throw err;
  }
}

/**
 * Dismiss a flag (e.g. false alarm), keeping the civic issue intact
 */
export async function dismissModerationFlag(flagId: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('reports').delete().eq('id', flagId);
    return { success: true };
  } catch (err) {
    console.error('Error dismissing flag:', err);
    throw err;
  }
}

/**
 * Directly delete any hotspot and its associated reports
 */
export async function deleteHotspotDirect(hotspotId: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('reports').delete().eq('hotspot_id', hotspotId);
    await supabase.from('hotspots').delete().eq('id', hotspotId);
    return { success: true };
  } catch (err) {
    console.error('Error deleting hotspot direct:', err);
    throw err;
  }
}
