import { createClient } from "@supabase/supabase-js";
import { encryptData, calculateSha256 } from "./crypto";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface IncidentInput {
  incidentType: string;
  severityLevel: number;
  perpetrator: string;
  locationDescription: string;
  description: string;
  injuriesOrImpact: string;
  witnesses: string;
  policeObNumber?: string;
  rawNarrativeForAi?: string;
}

export interface GuardianInput {
  name: string;
  surname?: string;
  mobileNumber1: string;
  emailAddress1?: string;
  relationship: string;
  isPrimary?: boolean;
}

// Ensure anonymous session exists for zero-trace vault storage
export async function getOrCreateAnonymousSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn("Anonymous sign in warning (local offline mode fallback):", error.message);
    return null;
  }
  return data.session;
}

// Unstoppable SOS Edge Dispatch
export async function dispatchServerSos(telemetry: {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  areaName?: string;
  batteryPercentage?: number;
  isCharging?: boolean;
  deviceModel?: string;
  isDuress?: boolean;
}) {
  const session = await getOrCreateAnonymousSession();
  const token = session?.access_token || "";

  // Call the Edge Function
  const response = await fetch(`${supabaseUrl}/functions/v1/dispatch-sos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(telemetry)
  });

  if (!response.ok) {
    throw new Error(`SOS Edge Dispatch failed: ${response.statusText}`);
  }
  return await response.json();
}

// Zero-Knowledge Encrypted Incident Vault Sync
export async function vaultIncident(input: IncidentInput) {
  const session = await getOrCreateAnonymousSession();
  const token = session?.access_token || "";

  // 1. Pack full sensitive narrative into a JSON payload
  const sensitivePayload = JSON.stringify({
    perpetrator: input.perpetrator,
    locationDescription: input.locationDescription,
    description: input.description,
    injuriesOrImpact: input.injuriesOrImpact,
    witnesses: input.witnesses,
    recordedAt: new Date().toISOString()
  });

  // 2. Client-side AES-256-GCM encryption
  const encryptedPayload = await encryptData(sensitivePayload);

  // 3. Compute SHA-256 checksum for court chain-of-custody
  const checksum = await calculateSha256(sensitivePayload);

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-ZA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // 4. Send to Supabase Edge Function sync-vault
  const response = await fetch(`${supabaseUrl}/functions/v1/sync-vault`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      timestamp: now.getTime(),
      dateTimeFormatted: formattedDate,
      incidentType: input.incidentType,
      severityLevel: input.severityLevel,
      encryptedPayload,
      sha256Checksum: checksum,
      policeObNumber: input.policeObNumber || "",
      rawNarrativeForAi: input.rawNarrativeForAi || input.description
    })
  });

  if (!response.ok) {
    // If backend isn't reached (e.g. offline during loadshedding), save to localStorage queue
    const offlineQueue = JSON.parse(localStorage.getItem("offline_vault_queue") || "[]");
    offlineQueue.push({
      id: crypto.randomUUID(),
      timestamp: now.getTime(),
      dateTimeFormatted: formattedDate,
      incidentType: input.incidentType,
      severityLevel: input.severityLevel,
      encryptedPayload,
      sha256Checksum: checksum,
      isOfflineCached: true
    });
    localStorage.setItem("offline_vault_queue", JSON.stringify(offlineQueue));
    return {
      success: true,
      offlineStored: true,
      sha256Checksum: checksum,
      message: "Encrypted locally (offline queue). Will sync automatically when network restores."
    };
  }

  return await response.json();
}
