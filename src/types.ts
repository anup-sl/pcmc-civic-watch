export type Category = 'Garbage' | 'Drainage' | 'Pothole' | 'Streetlight' | 'Encroachment' | 'Other';

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
      'Overflowing Bin',
      'Illegal Roadside Dumping',
      'Construction Debris',
      'Open Waste Burning',
      'Dead Animal / Carcass',
      'Uncleaned Public Urinal',
      'Garden / Tree Waste'
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
      'Clogged Stormwater Drain',
      'Sewage Chamber Overflow',
      'Missing / Broken Manhole Lid',
      'Stagnant Water / Mosquitoes',
      'Drinking Water Pipeline Leak',
      'Open Drainage Pit Hazard'
    ],
    description: 'Blocked gutter or wastewater backup'
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
      'Road Surface Subsidence'
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
      'Completely Dark Stretch',
      'Single Lamp Not Working',
      'Flickering / Dim Streetlight',
      'Exposed / Hanging Live Wires',
      'Damaged / Tilted Electric Pole',
      'High Mast Light Failure',
      'Daytime Burning Light'
    ],
    description: 'Non-functional street light or hazard'
  },
  Encroachment: {
    name: 'Encroachment',
    slaHours: 72,
    iconName: 'ShieldAlert',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/40',
    subTags: [
      'Footpath Blocked by Hawkers',
      'Illegal Permanent / Tin Shed',
      'Commercial Board / Banner on Road',
      'Vehicles Occupying Walkway',
      'Construction Material on Road',
      'Nullah / Open Space Encroachment',
      'Unauthorised Parking / Stand'
    ],
    description: 'Footpath blocked or illegal public land occupation'
  },
  Other: {
    name: 'Other',
    slaHours: 48,
    iconName: 'HelpCircle',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 hover:bg-teal-500/20',
    borderColor: 'border-teal-500/40',
    subTags: [
      'PCMC Sarathi Portal Not Working',
      'Property Tax Online Portal Error',
      'Water Bill Payment Issue',
      'Setu / Citizen Facility Center Issue',
      'Noise / Loudspeaker Nuisance',
      'Stray Animals / Cattle Hazard',
      'Public Garden / Park Maintenance',
      'General Civic Grievance / Other'
    ],
    description: 'Sarathi portal, e-governance, parks, or unlisted issue'
  }
};
