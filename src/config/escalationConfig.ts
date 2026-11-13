import type { Category } from '../types';
import { getZoneForArea } from '../utils/pcmcDirectory';

export const PCMC_ESCALATION_CONFIG = {
  municipality: "Pimpri-Chinchwad Municipal Corporation (PCMC)",
  central_grievance: {
    sarathi_email: "sarathi@pcmcindia.gov.in",
    egov_email: "egov@pcmcindia.gov.in",
    sarathi_whatsapp: "9922501450",
    helpline: "8888006666"
  },
  escalation_leadership: {
    commissioner: {
      role: "Municipal Commissioner",
      name: "Dr. Vijay Suryawanshi (IAS)",
      emails: [
        "commissioner@pcmcindia.gov.in",
        "v.suryawanshi@pcmcindia.gov.in"
      ]
    },
    vigilance: {
      role: "Joint Commissioner (Vigilance & Quality Control)",
      name: "Mr. Manoj Lonkar",
      emails: [
        "m.lonkar@pcmcindia.gov.in"
      ]
    },
    additional_commissioners: [
      "k.jangam@pcmcindia.gov.in",
      "t.sandbhor@pcmcindia.gov.in",
      "v.bagade@pcmcindia.gov.in"
    ]
  },
  categories: {
    GARBAGE: {
      display_name: "Garbage & Illegal Dumping",
      department: "Health & Solid Waste Management",
      sla_hours: 48,
      merge_radius_meters: 20,
      recurrence_window_days: 14,
      primary_official: {
        name: "Mr. Pradip Thengal",
        role: "Deputy Commissioner (Health & Sanitation)",
        to_emails: [
          "p.thengal@pcmcindia.gov.in",
          "medical@pcmcindia.gov.in"
        ],
        phone: "7385770501"
      },
      cc_initial: [
        "sarathi@pcmcindia.gov.in",
        "egov@pcmcindia.gov.in"
      ],
      cc_overdue_escalation: [
        "commissioner@pcmcindia.gov.in",
        "v.suryawanshi@pcmcindia.gov.in",
        "m.lonkar@pcmcindia.gov.in"
      ]
    },
    DRAINAGE: {
      display_name: "Sewage & Blocked Drain",
      department: "Water Supply, Drainage & Environment",
      sla_hours: 36,
      merge_radius_meters: 15,
      recurrence_window_days: 21,
      primary_official: {
        name: "Mr. Pramod Ombhase",
        role: "Chief Engineer-2 (Water & Drainage)",
        to_emails: [
          "p.ombhase@pcmcindia.gov.in"
        ],
        phone: "020-67333333"
      },
      cc_initial: [
        "sarathi@pcmcindia.gov.in",
        "egov@pcmcindia.gov.in"
      ],
      cc_overdue_escalation: [
        "commissioner@pcmcindia.gov.in",
        "v.suryawanshi@pcmcindia.gov.in",
        "m.lonkar@pcmcindia.gov.in"
      ]
    },
    POTHOLE: {
      display_name: "Pothole & Broken Road",
      department: "Civil Engineering & Roads",
      sla_hours: 168,
      merge_radius_meters: 10,
      recurrence_window_days: 60,
      primary_official: {
        name: "Mr. Manoj Sethiya",
        role: "City Engineer (Civil & Roads)",
        to_emails: [
          "m.sethia@pcmcindia.gov.in"
        ],
        phone: "9922501736"
      },
      cc_initial: [
        "sarathi@pcmcindia.gov.in",
        "egov@pcmcindia.gov.in"
      ],
      cc_overdue_escalation: [
        "commissioner@pcmcindia.gov.in",
        "v.suryawanshi@pcmcindia.gov.in",
        "m.lonkar@pcmcindia.gov.in"
      ]
    },
    STREETLIGHT: {
      display_name: "Dark Streetlight / Open Wire",
      department: "Electrical & Streetlight Maintenance",
      sla_hours: 72,
      merge_radius_meters: 15,
      recurrence_window_days: 30,
      primary_official: {
        name: "Executive Engineer (Electrical) / Sarathi Desk",
        role: "Electrical Department",
        to_emails: [
          "sarathi@pcmcindia.gov.in",
          "egov@pcmcindia.gov.in"
        ],
        phone: "020-67333333"
      },
      cc_initial: [
        "sd.khot@pcmcindia.gov.in"
      ],
      cc_overdue_escalation: [
        "commissioner@pcmcindia.gov.in",
        "v.suryawanshi@pcmcindia.gov.in",
        "m.lonkar@pcmcindia.gov.in"
      ]
    },
    ENCROACHMENT: {
      display_name: "Illegal Encroachment & Footpath Blocking",
      department: "Anti-Encroachment & Building Permission",
      sla_hours: 72,
      merge_radius_meters: 15,
      recurrence_window_days: 14,
      primary_official: {
        name: "Mr. Manoj Lonkar / Nodal Officer (Encroachment)",
        role: "Deputy Commissioner (Anti-Encroachment & Land Modernization)",
        to_emails: [
          "encroachment@pcmcindia.gov.in",
          "m.lonkar@pcmcindia.gov.in"
        ],
        phone: "020-67333333"
      },
      cc_initial: [
        "sarathi@pcmcindia.gov.in",
        "egov@pcmcindia.gov.in"
      ],
      cc_overdue_escalation: [
        "commissioner@pcmcindia.gov.in",
        "v.suryawanshi@pcmcindia.gov.in",
        "m.lonkar@pcmcindia.gov.in"
      ]
    },
    OTHER: {
      display_name: "PCMC Sarathi, E-Gov & Other Civic Issues",
      department: "E-Governance & Central Grievance Cell",
      sla_hours: 48,
      merge_radius_meters: 10,
      recurrence_window_days: 14,
      primary_official: {
        name: "Sarathi Grievance & E-Gov Nodal Desk",
        role: "Central Grievance & Information Technology",
        to_emails: [
          "sarathi@pcmcindia.gov.in",
          "egov@pcmcindia.gov.in"
        ],
        phone: "8888006666"
      },
      cc_initial: [
        "sarathi@pcmcindia.gov.in",
        "egov@pcmcindia.gov.in"
      ],
      cc_overdue_escalation: [
        "commissioner@pcmcindia.gov.in",
        "v.suryawanshi@pcmcindia.gov.in",
        "m.lonkar@pcmcindia.gov.in"
      ]
    }
  },
  zonal_offices: {
    C_ZONE: "cward@pcmcindia.gov.in",
    D_ZONE: "a.yele@pcmcindia.gov.in",
    E_AND_J_ZONE: "ah.gaikwad@pcmcindia.gov.in",
    GENERAL_WARD_OFFICER: "s.korad@pcmcindia.gov.in"
  }
} as const;

export type EscalationCategoryKey = keyof typeof PCMC_ESCALATION_CONFIG.categories;

export function getCategoryEscalationConfig(category: Category | string) {
  const norm = (category || 'Pothole').toUpperCase();
  if (norm.includes('GARBAGE')) return PCMC_ESCALATION_CONFIG.categories.GARBAGE;
  if (norm.includes('DRAINAGE') || norm.includes('WATER')) return PCMC_ESCALATION_CONFIG.categories.DRAINAGE;
  if (norm.includes('STREETLIGHT') || norm.includes('LIGHT') || norm.includes('ELECTRIC')) return PCMC_ESCALATION_CONFIG.categories.STREETLIGHT;
  if (norm.includes('ENCROACH') || norm.includes('HAWKER') || norm.includes('FOOTPATH')) return PCMC_ESCALATION_CONFIG.categories.ENCROACHMENT;
  if (norm.includes('OTHER') || norm.includes('SARATHI') || norm.includes('EGOV') || norm.includes('PORTAL')) return PCMC_ESCALATION_CONFIG.categories.OTHER;
  return PCMC_ESCALATION_CONFIG.categories.POTHOLE;
}

export interface EscalationRouting {
  toEmails: string[];
  ccEmails: string[];
  catConfig: typeof PCMC_ESCALATION_CONFIG.categories[EscalationCategoryKey];
  zone: ReturnType<typeof getZoneForArea>;
  isOverdue: boolean;
  isHighTier: boolean;
  commissionerEmails: string[];
  vigilanceEmails: string[];
}

export function buildEscalationRouting(params: {
  category: Category | string;
  areaName: string;
  isOverdue: boolean;
  forceCommissionerTier?: boolean;
  latitude?: number;
  longitude?: number;
}): EscalationRouting {
  const catConfig = getCategoryEscalationConfig(params.category);
  const zone = getZoneForArea(params.areaName, params.latitude, params.longitude);

  // TO: Primary departmental official + Zonal office
  const toEmails: string[] = [...catConfig.primary_official.to_emails];
  if (zone.email && !toEmails.includes(zone.email)) {
    toEmails.push(zone.email);
  }

  // CC: Base CC (Sarathi + eGov + Dept CC)
  const ccEmails: string[] = [...catConfig.cc_initial];

  const isHighTier = params.isOverdue || Boolean(params.forceCommissionerTier);

  // If Overdue or citizen escalated to Level 2: CC Municipal Commissioner & Vigilance Joint Commissioner
  if (isHighTier) {
    catConfig.cc_overdue_escalation.forEach(email => {
      const emailStr: string = email;
      if (!ccEmails.includes(emailStr) && !toEmails.includes(emailStr)) {
        ccEmails.push(emailStr);
      }
    });
  }

  const commissionerEmails = [...PCMC_ESCALATION_CONFIG.escalation_leadership.commissioner.emails];
  const vigilanceEmails = [...PCMC_ESCALATION_CONFIG.escalation_leadership.vigilance.emails];

  return {
    toEmails,
    ccEmails,
    catConfig,
    zone,
    isOverdue: params.isOverdue,
    isHighTier,
    commissionerEmails,
    vigilanceEmails
  };
}
