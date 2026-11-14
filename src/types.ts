export type Category = 
  | 'Garbage' 
  | 'Drainage' 
  | 'Pothole' 
  | 'Streetlight' 
  | 'Encroachment' 
  | 'Garden' 
  | 'Animals' 
  | 'Pollution' 
  | 'Other';

export type HotspotStatus = 'OPEN' | 'CHRONIC_REOPENED' | 'RESOLVED';

export type ReportType = 'INITIAL' | 'CORROBORATION' | 'CLEARANCE' | 'REOPEN';

export interface Hotspot {
  id: string;
  category: Category;
  sub_tag: string;
  latitude: number;
  longitude: number;
  area_name: string;
  status: HotspotStatus;
  corroboration_count: number;
  recurrence_count: number;
  sla_hours: number;
  created_at: string;
  resolved_at: string | null;
  // joined/calculated
  reports?: Report[];
}

export interface Report {
  id: string;
  hotspot_id: string;
  report_type: ReportType;
  photo_url: string;
  notes?: string | null;
  created_at: string;
}

export interface CategoryConfig {
  name: Category;
  slaHours: number;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subTags: string[];
  description: string;
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  Garbage: {
    name: 'Garbage',
    slaHours: 48,
    iconName: 'Trash2',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
    borderColor: 'border-amber-500/40',
    subTags: [
      'Overflowing Garbage Bin',
      'Open Roadside Dumping',
      'Dead Animal / Bio-Waste',
      'Construction Debris (Malba)',
      'Missed Door-to-Door Van',
      'Burning of Garbage',
      'Other'
    ],
    description: 'Waste piling or illegal disposal'
  },
  Drainage: {
    name: 'Drainage',
    slaHours: 36,
    iconName: 'Droplets',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    subTags: [
      'Blocked / Overflowing Gutter',
      'Open / Missing Manhole Cover',
      'Drinking Water Pipeline Leak',
      'Sewage Mixing in Water',
      'Waterlogging on Road',
      'No Water Supply',
      'Other'
    ],
    description: 'Blocked gutter, wastewater, or drinking water issue'
  },
  Pothole: {
    name: 'Pothole',
    slaHours: 168,
    iconName: 'AlertTriangle',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 hover:bg-rose-500/20',
    borderColor: 'border-rose-500/40',
    subTags: [
      'Deep Crater on Carriageway',
      'Sunken Manhole / Trench Dip',
      'Loose Gravel / Asphalt Washed Out',
      'Multiple Consecutive Potholes',
      'Broken Paver Blocks',
      'Road Surface Subsidence',
      'Damaged Speed Breaker',
      'Other'
    ],
    description: 'Road damage affecting vehicle safety'
  },
  Streetlight: {
    name: 'Streetlight',
    slaHours: 72,
    iconName: 'Lightbulb',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    borderColor: 'border-yellow-500/40',
    subTags: [
      'Streetlight Not Working',
      'Dark Stretch (Multiple Lights Off)',
      'Flickering / Dim Streetlight',
      'Exposed Live Wires / Open Box',
      'Tilted / Damaged Electric Pole',
      'Light On During Daytime',
      'Other'
    ],
    description: 'Non-functional street light or electrical hazard'
  },
  Encroachment: {
    name: 'Encroachment',
    slaHours: 72,
    iconName: 'ShieldAlert',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/40',
    subTags: [
      'Footpath Blocked by Stalls/Vendors',
      'Illegal Roadside Shed / Extension',
      'Abandoned Vehicles on Road',
      'Illegal Hoarding / Banner',
      'Road Blocked by Building Material',
      'Other'
    ],
    description: 'Footpath blocked or illegal public land occupation'
  },
  Garden: {
    name: 'Garden',
    slaHours: 48,
    iconName: 'Trees',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    subTags: [
      'Fallen Tree / Blocking Road',
      'Dangerous Hanging Branches',
      'Overgrown Weeds / Bushes',
      'Broken Park Bench / Play Equipment',
      'Park Lights / Gate Damaged',
      'Other'
    ],
    description: 'Fallen trees, dangerous branches, or park maintenance'
  },
  Animals: {
    name: 'Animals',
    slaHours: 48,
    iconName: 'PawPrint',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
    borderColor: 'border-orange-500/40',
    subTags: [
      'Aggressive / Biting Stray Dogs',
      'Injured / Sick Stray Animal',
      'Stray Cattle Blocking Traffic',
      'Dead Animal Removal Needed',
      'Other'
    ],
    description: 'Stray dogs, injured animals, or cattle traffic hazards'
  },
  Pollution: {
    name: 'Pollution',
    slaHours: 24,
    iconName: 'Wind',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    borderColor: 'border-indigo-500/40',
    subTags: [
      'Open Garbage / Plastic Burning',
      'RMC Plant / Construction Dust',
      'Industrial Smoke / Chemical Odor',
      'Late-Night Loudspeaker Noise',
      'Other'
    ],
    description: 'Air pollution, plastic burning, dust, or excessive noise'
  },
  Other: {
    name: 'Other',
    slaHours: 48,
    iconName: 'Smartphone',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 hover:bg-teal-500/20',
    borderColor: 'border-teal-500/40',
    subTags: [
      'Sarathi App / Portal Down',
      'WhatsApp Bot Unresponsive',
      'Complaint Closed Without Work',
      'Property / Water Tax Portal Error',
      'Other'
    ],
    description: 'Sarathi portal, e-gov services, or unlisted issues'
  }
};
