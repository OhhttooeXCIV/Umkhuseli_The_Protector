/**
 * Umkhuseli: The Protector
 * Zero-Knowledge Encrypted Offline Outbox & Load-Shedding Resilience Matrix
 *
 * During Stage 6 load-shedding and power blackouts, cellular towers in South Africa
 * frequently lose power and internet drops to zero.
 *
 * CRITICAL ADVERSARY & LEGAL SAFETY:
 * 1. Plaintext evidence is NEVER written to unencrypted browser storage (IndexedDB/LocalStorage).
 *    All incident drafts and SOS payloads are client-side encrypted with AES-256-GCM before queueing.
 * 2. An automatic 'online' listener drains the encrypted queue immediately when network restores.
 * 3. Provides instant zero-data offline emergency actions (zero-airtime USSD *120*7867# and SMS).
 */

import { encryptData, decryptData } from "./crypto";

export interface OutboxItem {
  id: string;
  type: "SOS_BEACON" | "INCIDENT_VAULT";
  encryptedPayload: string;
  createdAt: string;
  status: "QUEUED" | "SYNCING" | "DELIVERED";
}

export const OUTBOX_STORAGE_KEY = "pcalc_offline_outbox_v1";
export const LEGACY_OUTBOX_STORAGE_KEY = "umkhuseli_offline_outbox_v1";

/**
 * Checks if the device currently has active network connectivity
 */
export function isNetworkOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Retrieves all encrypted items from the offline outbox
 */
export function getQueuedOutboxItems(): OutboxItem[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw =
      window.localStorage.getItem(OUTBOX_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Enqueues an offline SOS beacon payload with client-side AES-256-GCM encryption
 */
export async function queueOfflineSosBeacon(telemetry: Record<string, unknown>): Promise<OutboxItem> {
  const jsonPayload = JSON.stringify(telemetry);
  const encryptedPayload = await encryptData(jsonPayload);

  const item: OutboxItem = {
    id: `sos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: "SOS_BEACON",
    encryptedPayload,
    createdAt: new Date().toISOString(),
    status: "QUEUED"
  };

  saveOutboxItem(item);
  return item;
}

/**
 * Enqueues an offline incident evidence report with client-side AES-256-GCM encryption
 */
export async function queueOfflineIncident(incident: Record<string, unknown>): Promise<OutboxItem> {
  const jsonPayload = JSON.stringify(incident);
  const encryptedPayload = await encryptData(jsonPayload);

  const item: OutboxItem = {
    id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: "INCIDENT_VAULT",
    encryptedPayload,
    createdAt: new Date().toISOString(),
    status: "QUEUED"
  };

  saveOutboxItem(item);
  return item;
}

function saveOutboxItem(item: OutboxItem): void {
  const items = getQueuedOutboxItems();
  items.push(item);
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
    window.localStorage.removeItem(LEGACY_OUTBOX_STORAGE_KEY);
  }
}

/**
 * Clears or removes delivered items from outbox
 */
export function removeOutboxItem(id: string): void {
  const items = getQueuedOutboxItems().filter(i => i.id !== id);
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
    window.localStorage.removeItem(LEGACY_OUTBOX_STORAGE_KEY);
  }
}

/**
 * Drains the encrypted outbox when connectivity is restored
 */
export async function drainOutbox(
  dispatcher?: (type: "SOS_BEACON" | "INCIDENT_VAULT", payload: any) => Promise<boolean>
): Promise<number> {
  if (!isNetworkOnline()) return 0;

  const items = getQueuedOutboxItems();
  if (items.length === 0) return 0;

  let processedCount = 0;

  for (const item of items) {
    try {
      const decryptedJson = await decryptData(item.encryptedPayload);
      const parsedPayload = JSON.parse(decryptedJson);

      let success = true;
      if (dispatcher) {
        success = await dispatcher(item.type, parsedPayload);
      }

      if (success) {
        removeOutboxItem(item.id);
        processedCount++;
      }
    } catch (e) {
      console.error(`Failed to process outbox item ${item.id}:`, e);
    }
  }

  return processedCount;
}

/**
 * Statutory zero-airtime offline lifelines available during Stage 6 grid collapse
 */
export function getOfflineEmergencyActions() {
  return {
    ussdGbvCommandCentre: {
      label: "Zero-Airtime GBV Command Centre USSD",
      displayCode: "*120*7867#",
      dialUrl: "tel:*120*7867%23",
      zeroRated: true
    },
    police10111: {
      label: "SAPS Flying Squad Emergency",
      displayCode: "10111",
      dialUrl: "tel:10111",
      zeroRated: false
    },
    smsEmergencyTemplate: (coordinates?: { lat: number; lng: number }) => {
      const locText = coordinates
        ? ` Location: https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`
        : "";
      return `EMERGENCY SOS: I need urgent safety assistance.${locText}`;
    }
  };
}
