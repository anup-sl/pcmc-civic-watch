export type Category = 'Garbage' | 'Drainage' | 'Pothole' | 'Streetlight';

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
    subTags: ['Overflowing Bin', 'Illegal Dumping', 'Construction Debris'],
    description: 'Waste piling or illegal disposal'
  },
  Drainage: {
    name: 'Drainage',
    slaHours: 36,
    iconName: 'Droplets',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    subTags: ['Clogged Drain', 'Sewage Overflow', 'Missing Manhole Lid'],
    description: 'Blocked gutter or wastewater backup'
  },
  Pothole: {
    name: 'Pothole',
    slaHours: 168,
    iconName: 'AlertTriangle',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 hover:bg-rose-500/20',
    borderColor: 'border-rose-500/40',
    subTags: ['Deep Crater', 'Road Cavity', 'Multiple Potholes'],
    description: 'Road damage affecting vehicle safety'
  },
  Streetlight: {
    name: 'Streetlight',
    slaHours: 72,
    iconName: 'Lightbulb',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    borderColor: 'border-yellow-500/40',
    subTags: ['Light Out / Dark', 'Broken Pole', 'Exposed Wires'],
    description: 'Non-functional street light or hazard'
  }
};
