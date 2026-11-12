import { supabase } from '../supabase';

interface SampleItem {
  category: string;
  sub_tag: string;
  latitude: number;
  longitude: number;
  area_name: string;
  status: string;
  corroboration_count: number;
  recurrence_count: number;
  sla_hours: number;
  photo_url: string;
  resolved_at?: string;
}

export async function seedSampleDataIfEmpty() {
  try {
    const { count, error } = await supabase
      .from('hotspots')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Could not check hotspots count:', error.message);
      return;
    }

    if (count === 0) {
      console.log('Database has no hotspots. Seeding sample PCMC civic issues...');

      const samples: SampleItem[] = [
        {
          category: 'Garbage',
          sub_tag: 'Overflowing Bin',
          latitude: 18.6278,
          longitude: 73.8015,
          area_name: 'Pimpri Market Chowk',
          status: 'OPEN',
          corroboration_count: 4,
          recurrence_count: 0,
          sla_hours: 48,
          photo_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop'
        },
        {
          category: 'Pothole',
          sub_tag: 'Deep Crater',
          latitude: 18.6355,
          longitude: 73.7884,
          area_name: 'Chinchwad Railway Station Road',
          status: 'CHRONIC_REOPENED',
          corroboration_count: 9,
          recurrence_count: 2,
          sla_hours: 168,
          photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop'
        },
        {
          category: 'Drainage',
          sub_tag: 'Sewage Overflow',
          latitude: 18.5987,
          longitude: 73.7661,
          area_name: 'Wakad Bridge Chowk',
          status: 'OPEN',
          corroboration_count: 3,
          recurrence_count: 0,
          sla_hours: 36,
          photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop'
        },
        {
          category: 'Streetlight',
          sub_tag: 'Light Out / Dark',
          latitude: 18.6534,
          longitude: 73.7745,
          area_name: 'Nigdi Bhakti Shakti Chowk',
          status: 'OPEN',
          corroboration_count: 2,
          recurrence_count: 0,
          sla_hours: 72,
          photo_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop'
        },
        {
          category: 'Pothole',
          sub_tag: 'Multiple Potholes',
          latitude: 18.6392,
          longitude: 73.8427,
          area_name: 'Bhosari MIDC Spine Road',
          status: 'RESOLVED',
          corroboration_count: 5,
          recurrence_count: 1,
          sla_hours: 168,
          resolved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          photo_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop'
        }
      ];

      for (const item of samples) {
        const { photo_url, ...hotspotData } = item;
        const { data: newH } = await supabase
          .from('hotspots')
          .insert(hotspotData as Record<string, unknown>)
          .select()
          .single();

        if (newH) {
          await supabase.from('reports').insert({
            hotspot_id: newH.id,
            report_type: 'INITIAL',
            photo_url: photo_url,
            notes: `Initial citizen report at ${item.area_name}`
          });
        }
      }
      console.log('Seeded sample PCMC hotspots successfully.');
    }
  } catch (err) {
    console.warn('Seed data skip:', err);
  }
}
