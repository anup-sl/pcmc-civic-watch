import type { Hotspot } from '../types';

/**
 * Exports all civic issues as an official CSV evidence dossier for RTI / ward sabha.
 */
export function exportHotspotsToCSV(hotspots: Hotspot[], filename: string = 'PCMC_Civic_Grievances_Dossier.csv') {
  const headers = [
    'Hotspot_ID',
    'Category',
    'Sub_Tag',
    'Area_Name',
    'Latitude',
    'Longitude',
    'Status',
    'SLA_Hours',
    'Corroboration_Count',
    'Recurrence_Count',
    'Created_At',
    'Resolved_At',
    'Google_Maps_Link'
  ];

  const rows = hotspots.map(h => [
    h.id,
    h.category,
    `"${(h.sub_tag || '').replace(/"/g, '""')}"`,
    `"${(h.area_name || '').replace(/"/g, '""')}"`,
    h.latitude,
    h.longitude,
    h.status,
    h.sla_hours,
    h.corroboration_count,
    h.recurrence_count,
    h.created_at,
    h.resolved_at || '',
    `"https://www.google.com/maps/search/?api=1&query=${h.latitude},${h.longitude}"`
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
