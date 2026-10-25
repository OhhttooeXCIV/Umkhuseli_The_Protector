import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  queueOfflineSosBeacon,
  queueOfflineIncident,
  getQueuedOutboxItems,
  removeOutboxItem,
  drainOutbox,
  getOfflineEmergencyActions,
  OUTBOX_STORAGE_KEY
} from "../services/offlineOutbox";

describe("Encrypted Offline Outbox & Load-Shedding Resilience", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("queues SOS telemetry with client-side AES-256-GCM encryption", async () => {
    const telemetry = {
      latitude: -26.2041,
      longitude: 28.0473,
      isDuress: true,
      batteryPercentage: 42
    };

    const item = await queueOfflineSosBeacon(telemetry);

    expect(item).toBeDefined();
    expect(item.type).toBe("SOS_BEACON");
    expect(item.encryptedPayload.startsWith("ENC:")).toBe(true);

    const rawInStorage = localStorage.getItem(OUTBOX_STORAGE_KEY);
    expect(rawInStorage).not.toContain("-26.2041"); // Never plain coordinates in storage
    expect(rawInStorage).toContain("ENC:");
  });

  it("queues incident vault evidence with encryption and no plaintext leak", async () => {
    const incident = {
      perpetrator: "John Doe",
      description: "Severe domestic abuse incident in Soweto",
      policeObNumber: "OB 456/10/2026"
    };

    const item = await queueOfflineIncident(incident);

    expect(item.type).toBe("INCIDENT_VAULT");
    expect(item.encryptedPayload.startsWith("ENC:")).toBe(true);

    const items = getQueuedOutboxItems();
    expect(items.length).toBe(1);

    const rawInStorage = localStorage.getItem(OUTBOX_STORAGE_KEY);
    expect(rawInStorage).not.toContain("John Doe");
    expect(rawInStorage).not.toContain("OB 456/10/2026");
  });

  it("drains outbox when connection is restored", async () => {
    const item1 = await queueOfflineSosBeacon({ alert: "SOS 1" });
    const item2 = await queueOfflineIncident({ title: "Incident 2" });

    expect(getQueuedOutboxItems().length).toBe(2);

    const processedPayloads: any[] = [];
    const mockDispatcher = vi.fn().mockImplementation(async (type, payload) => {
      processedPayloads.push({ type, payload });
      return true;
    });

    const processedCount = await drainOutbox(mockDispatcher);

    expect(processedCount).toBe(2);
    expect(mockDispatcher).toHaveBeenCalledTimes(2);
    expect(getQueuedOutboxItems().length).toBe(0);
    expect(processedPayloads[0].payload).toEqual({ alert: "SOS 1" });
  });

  it("provides statutory zero-airtime USSD and direct SMS fallback lifelines", () => {
    const actions = getOfflineEmergencyActions();

    expect(actions.ussdGbvCommandCentre.displayCode).toBe("*120*7867#");
    expect(actions.ussdGbvCommandCentre.dialUrl).toBe("tel:*120*7867%23");
    expect(actions.ussdGbvCommandCentre.zeroRated).toBe(true);

    const smsText = actions.smsEmergencyTemplate({ lat: -26.2, lng: 28.0 });
    expect(smsText).toContain("EMERGENCY SOS");
    expect(smsText).toContain("https://maps.google.com/?q=-26.2,28");
  });
});
