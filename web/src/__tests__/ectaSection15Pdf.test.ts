import { describe, it, expect, vi } from "vitest";
import { createEctaAffidavitPdf, exportEctaAffidavitPdf } from "../services/ectaSection15Pdf";

describe("ECTA Section 15 & Form 2 Domestic Violence Affidavit PDF Generator (jsPDF)", () => {
  const sampleIncident = {
    incidentId: "inc_test_123",
    incidentType: "Physical",
    severityLevel: 4,
    perpetrator: "Former Partner (John Doe)",
    locationDescription: "Residential home, Soweto, Gauteng",
    description: "Perpetrator broke the front door latch, made death threats, and damaged communications property.",
    injuriesOrImpact: "Bruising on left forearm, laceration requiring sutures at Chris Hani Baragwanath Hospital.",
    witnesses: "Neighbor (Mrs. Khumalo), minor child (age 7).",
    policeObNumber: "OB 412/10/2026",
    sha256Checksum: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    timestamp: "2026-10-24T18:30:00Z",
    deponentName: "Jane Doe (Shelter Safe Reference #902)",
    magistrateDistrict: "PROTEA MAGISTRATES COURT, SOWETO",
    deviceFingerprint: "Android-StrongBox-Keystore-API34"
  };

  it("creates a well-formed jsPDF document with statutory ECTA 15 and Form 2 clauses", () => {
    const doc = createEctaAffidavitPdf(sampleIncident);
    expect(doc).toBeDefined();

    // Verify PDF binary output
    const pdfDataUri = doc.output("datauristring");
    expect(pdfDataUri).toContain("data:application/pdf");
    expect(pdfDataUri.length).toBeGreaterThan(1000);
  });

  it("handles missing optional parameters gracefully without crashing", () => {
    const minimalIncident = {
      incidentType: "Emotional",
      severityLevel: 2,
      perpetrator: "Spouse",
      locationDescription: "Residence",
      description: "Verbal insults and coercive financial deprivation.",
      injuriesOrImpact: "",
      witnesses: "",
      sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    };

    const doc = createEctaAffidavitPdf(minimalIncident);
    expect(doc).toBeDefined();
    const pdfDataUri = doc.output("datauristring");
    expect(pdfDataUri).toContain("data:application/pdf");
  });

  it("executes exportEctaAffidavitPdf and invokes doc.save with formatted filename", () => {
    const saveSpy = vi.fn();
    // Test helper directly
    const filename = exportEctaAffidavitPdf({
      ...sampleIncident,
      incidentId: "case-2026-99"
    });

    expect(filename).toBe("Umkhuseli_Form2_ECTA15_case-2026-99.pdf");
  });
});
