/**
 * UAT Profile & ICE Guardians Service
 *
 * Manages 5 In Case of Emergency (ICE) contacts, survivor personal profile details,
 * emergency alert emails, and social media accounts for verification.
 *
 * When UAT Mode is active, all distress calls and SOS beacons are safely simulated
 * and verified in-app without dialing live South African emergency authorities.
 */

export interface IceContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary?: boolean;
}

export interface PersonalProfile {
  fullName: string;
  nationalId: string;
  address: string;
  medicalNotes: string;
}

export interface EmergencySocials {
  alertEmail: string;
  twitterHandle: string;
  instagramHandle: string;
  facebookProfile: string;
}

export interface UatProfile {
  isUatMode: boolean;
  contacts: IceContact[];
  personal: PersonalProfile;
  socials: EmergencySocials;
}

const STORAGE_KEY = "umkhuseli_uat_ice_profile";

export const DEFAULT_UAT_PROFILE: UatProfile = {
  isUatMode: true, // Default to true for safe evaluative hackathon & mentor testing
  contacts: [
    {
      id: "ice-1",
      name: "Sindi Khumalo",
      relationship: "Sister",
      phone: "+27 82 555 0101",
      email: "sindi.khumalo@example.co.za",
      isPrimary: true,
    },
    {
      id: "ice-2",
      name: "Dr. Bongiwe Ndlovu",
      relationship: "Family Doctor / Medical ICE",
      phone: "+27 83 555 0102",
      email: "dr.bongiwe@example.co.za",
    },
    {
      id: "ice-3",
      name: "Adv. Sipho Mthembu",
      relationship: "Legal Counsel / Advocate",
      phone: "+27 71 555 0103",
      email: "sipho.legal@example.co.za",
    },
    {
      id: "ice-4",
      name: "Nomsa Dlamini",
      relationship: "Trusted Neighbor",
      phone: "+27 76 555 0104",
      email: "nomsa.d@example.co.za",
    },
    {
      id: "ice-5",
      name: "Lerato Modise",
      relationship: "Close Friend / Safe Haven Co-Holder",
      phone: "+27 84 555 0105",
      email: "lerato.m@example.co.za",
    },
  ],
  personal: {
    fullName: "Thandeka Nkosi",
    nationalId: "940815 0000 081",
    address: "Berea / Yeoville Safe Haven Corridor, Johannesburg",
    medicalNotes: "Type O+ Blood, Asthma Inhaler in Handbag, 2 Minor Dependents",
  },
  socials: {
    alertEmail: "thandeka.sos.backup@proton.me",
    twitterHandle: "@thandeka_sa",
    instagramHandle: "@thandeka_jhb",
    facebookProfile: "facebook.com/thandeka.nkosi.backup",
  },
};

export function getUatProfile(): UatProfile {
  if (typeof window === "undefined") return DEFAULT_UAT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    /* fallback */
  }
  return DEFAULT_UAT_PROFILE;
}

export function saveUatProfile(profile: UatProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent("umkhuseli_uat_profile_updated", { detail: profile }));
  } catch {
    /* fallback */
  }
}

export function setUatMode(enabled: boolean): void {
  const current = getUatProfile();
  current.isUatMode = enabled;
  saveUatProfile(current);
}
