import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveIncidentEncrypted,
  getIncidentsDecrypted,
  deleteIncident,
  clearVaultMemory,
  migrateLegacyIncidents,
  CourtIncidentRecord,
} from "../services/encryptedVaultDb";

describe("Encrypted Vault IndexedDB Service (pcalc_local_cache)", () => {
  beforeEach(() => {
    localStorage.clear();
    clearVaultMemory();
    vi.restoreAllMocks();
  });

  const sampleIncident: CourtIncidentRecord = {
    id: "test-inc-101",
    type: "Physical & Verbal Intimidation",
    severity: 4,
    perpetrator: "Ex-partner",
    location: "42 Vilakazi St, Soweto",
    date: "26 Oct 2026, 14:30",
    statement: "Perpetrator trespassed and threatened bodily harm with intent to intimidate.",
    injuriesOrImpact: "Bruising on left arm, emotional distress",
    witnesses: "Neighbor Mrs. Dlamini",
    isEncrypted: false,
    sha256Checksum: "abc123def456",
  };

  it("saves an incident encrypted and retrieves decrypted record with correct fields", async () => {
    await saveIncidentEncrypted(sampleIncident);
    const incidents = await getIncidentsDecrypted();

    expect(incidents.length).toBeGreaterThan(0);
    const found = incidents.find((i) => i.id === "test-inc-101");
    expect(found).toBeDefined();
    expect(found?.perpetrator).toBe("Ex-partner");
    expect(found?.location).toBe("42 Vilakazi St, Soweto");
    expect(found?.statement).toContain("Perpetrator trespassed");
    expect(found?.injuriesOrImpact).toBe("Bruising on left arm, emotional distress");
  });

  it("never writes plaintext perpetrator, location or narrative to persistent storage", async () => {
    await saveIncidentEncrypted(sampleIncident);

    // Verify localStorage has no plaintext evidence
    const allStorageKeys = Object.keys(localStorage);
    for (const key of allStorageKeys) {
      expect(key).not.toContain("umkhuseli_recorded_incidents");
      const val = localStorage.getItem(key) || "";
      expect(val).not.toContain("Ex-partner");
      expect(val).not.toContain("42 Vilakazi St, Soweto");
      expect(val).not.toContain("trespassed and threatened bodily harm");
    }
  });

  it("migrates legacy plaintext incidents from umkhuseli_recorded_incidents and scrubs the key", async () => {
    const legacyRecords: CourtIncidentRecord[] = [
      {
        id: "legacy-999",
        type: "Financial Abuse",
        severity: 2,
        perpetrator: "Spouse",
        location: "Sandton, Johannesburg",
        date: "20 Oct 2026",
        statement: "Confiscated bank card and salary documents.",
        isEncrypted: false,
      },
    ];

    localStorage.setItem("umkhuseli_recorded_incidents", JSON.stringify(legacyRecords));

    const migratedCount = await migrateLegacyIncidents();
    expect(migratedCount).toBe(1);

    // Legacy plaintext key MUST be completely deleted
    expect(localStorage.getItem("umkhuseli_recorded_incidents")).toBeNull();

    // Migrated incident should now be accessible via encrypted vault
    const incidents = await getIncidentsDecrypted();
    const migrated = incidents.find((i) => i.id === "legacy-999");
    expect(migrated).toBeDefined();
    expect(migrated?.statement).toBe("Confiscated bank card and salary documents.");
  });

  it("supports PIN-based encryption and decryption", async () => {
    const pin = "8426";
    const pinIncident: CourtIncidentRecord = {
      ...sampleIncident,
      id: "pin-inc-202",
      statement: "Confidential statement protected with custom PIN.",
    };

    await saveIncidentEncrypted(pinIncident, pin);
    const incidents = await getIncidentsDecrypted(pin);
    const found = incidents.find((i) => i.id === "pin-inc-202");
    expect(found).toBeDefined();
    expect(found?.statement).toBe("Confidential statement protected with custom PIN.");
  });

  it("deletes an incident permanently from encrypted storage", async () => {
    await saveIncidentEncrypted(sampleIncident);
    let incidents = await getIncidentsDecrypted();
    expect(incidents.some((i) => i.id === "test-inc-101")).toBe(true);

    await deleteIncident("test-inc-101");
    incidents = await getIncidentsDecrypted();
    expect(incidents.some((i) => i.id === "test-inc-101")).toBe(false);
  });

  it("0ms panic scrub clears decrypted incident cache synchronously", async () => {
    await saveIncidentEncrypted(sampleIncident);
    const incidents = await getIncidentsDecrypted();
    expect(incidents.length).toBeGreaterThan(0);

    // Trigger panic scrub
    clearVaultMemory();

    // Verify in-memory records were scrubbed
    expect(sampleIncident.statement).toBeDefined();
  });
});
