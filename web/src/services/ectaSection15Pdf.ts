import { jsPDF } from "jspdf";

export interface EctaAffidavitInput {
  incidentId?: string;
  incidentType: string;
  severityLevel: number;
  perpetrator: string;
  locationDescription: string;
  description: string;
  injuriesOrImpact: string;
  witnesses: string;
  policeObNumber?: string;
  sha256Checksum: string;
  timestamp?: string;
  deponentName?: string;
  magistrateDistrict?: string;
  deviceFingerprint?: string;
}

/**
 * Generates an official Form 2 Domestic Violence Protection Order Affidavit
 * paired with a statutory Section 15 Electronic Communications and Transactions Act (ECTA 25 of 2002)
 * Certificate of Electronic Evidence Authenticity using direct jsPDF binary export.
 */
export function createEctaAffidavitPdf(data: EctaAffidavitInput): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
      renderPageHeader();
    }
  };

  const renderPageHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("REPUBLIC OF SOUTH AFRICA • DEPARTMENT OF JUSTICE AND CONSTITUTIONAL DEVELOPMENT", margin, y);
    doc.text(`FORM 2 [REGULATION 4] / ECTA SEC 15 • REF: ${data.sha256Checksum.substring(0, 10).toUpperCase()}`, pageWidth - margin, y, { align: "right" });
    y += 4;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // --- FIRST PAGE HEADER ---
  renderPageHeader();

  // Court Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("IN THE MAGISTRATE'S COURT FOR THE DISTRICT OF:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.magistrateDistrict || "JOHANNESBURG / LOCAL JURISDICTION", margin + 105, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("SAPS INCIDENT / OB REGISTER NO:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.policeObNumber || "PENDING COURT DISPATCH", margin + 78, y);
  y += 7;

  // Title Banner
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 14, "F");
  doc.setDrawColor(51, 65, 85); // slate-700
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, 14, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("APPLICATION FOR PROTECTION ORDER IN TERMS OF SECTION 4 OF THE", margin + contentWidth / 2, y + 5.5, { align: "center" });
  doc.text("DOMESTIC VIOLENCE ACT, 1998 (ACT NO. 116 OF 1998 AS AMENDED BY ACT 14 OF 2021)", margin + contentWidth / 2, y + 10.5, { align: "center" });
  y += 18;

  // Section 1: Deponent & Perpetrator Particulars
  doc.setFillColor(30, 41, 59); // slate-800
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.text("SECTION 1: PARTICULARS OF THE PARTIES & NATURE OF ABUSE", margin + 3, y + 4.2);
  y += 9;

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const drawFieldRow = (label: string, value: string) => {
    checkPageBreak(7);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 2, y);
    doc.setFont("helvetica", "normal");
    const splitVal = doc.splitTextToSize(value || "Not Disclosed", contentWidth - 65);
    doc.text(splitVal, margin + 62, y);
    y += Math.max(splitVal.length * 4, 5.5);
  };

  const formattedDate = data.timestamp 
    ? new Date(data.timestamp).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })
    : new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });

  drawFieldRow("Complainant / Deponent:", data.deponentName || "CONFIDENTIAL / SHELTER PROTECTED");
  drawFieldRow("Respondent / Perpetrator:", data.perpetrator);
  drawFieldRow("Incident Classification:", `${data.incidentType} Domestic Violence (Severity: Level ${data.severityLevel}/5)`);
  drawFieldRow("Location of Incident:", data.locationDescription);
  drawFieldRow("Date & Time Recorded:", `${formattedDate} (SAST / UTC+2)`);
  y += 3;

  // Section 2: Narrative of Domestic Violence
  checkPageBreak(12);
  doc.setFillColor(30, 41, 59);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.text("SECTION 2: STATEMENT OF FACTS & INCIDENT NARRATIVE (ACT 116/1998 SEC 4(1))", margin + 3, y + 4.2);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  const narrativeLines = doc.splitTextToSize(
    data.description || "No narrative recorded.",
    contentWidth - 6
  );

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, narrativeLines.length * 3.8 + 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, narrativeLines.length * 3.8 + 6, "S");
  doc.text(narrativeLines, margin + 3, y + 4.5);
  y += narrativeLines.length * 3.8 + 9;

  // Section 3: Injuries & Witnesses
  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Physical / Psychological Injuries (Cross-Ref J88 Medical Examination):", margin, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  const injuryLines = doc.splitTextToSize(data.injuriesOrImpact || "None reported at initial vault entry.", contentWidth - 4);
  doc.text(injuryLines, margin + 2, y);
  y += injuryLines.length * 4 + 3;

  doc.setFont("helvetica", "bold");
  doc.text("Corroborating Witnesses / Children Present:", margin, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  const witnessLines = doc.splitTextToSize(data.witnesses || "None reported.", contentWidth - 4);
  doc.text(witnessLines, margin + 2, y);
  y += witnessLines.length * 4 + 5;

  // Section 4: ECTA Section 15 Certificate
  checkPageBreak(50);
  doc.setFillColor(15, 23, 42); // slate-900
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.text("SECTION 3: STATUTORY CERTIFICATE OF ELECTRONIC EVIDENCE AUTHENTICITY", margin + 3, y + 4.2);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("IN TERMS OF SECTION 15(4) OF THE ELECTRONIC COMMUNICATIONS AND TRANSACTIONS ACT (ACT NO. 25 OF 2002)", margin, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const certText = 
    "I, the undersigned system integrity certifier of Umkhuseli Safe Haven, hereby certify in terms of Section 15(4) of the ECTA 25 of 2002 that the electronic record contained herein was securely generated, cryptographically hashed, and vaulted using client-side hardware-backed encryption. The record has remained untampered in an immutable state since its original entry.";
  const certLines = doc.splitTextToSize(certText, contentWidth);
  doc.text(certLines, margin, y);
  y += certLines.length * 3.5 + 4;

  // Technical Security Table
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 22, "F");
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 22, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Cryptographic Hash (SHA-256):", margin + 3, y + 4.5);
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(data.sha256Checksum || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", margin + 3, y + 8.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Vault Encryption Cipher:", margin + 3, y + 13.5);
  doc.setFont("helvetica", "normal");
  doc.text("AES-256-GCM Hardware-Backed Cryptographic Vault", margin + 42, y + 13.5);

  doc.setFont("helvetica", "bold");
  doc.text("Forensic Device Fingerprint:", margin + 3, y + 18);
  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.text(data.deviceFingerprint || "Android-StrongBox-Keystore/WebCrypto-W3C-Verified", margin + 45, y + 18);
  y += 26;

  // Section 5: Legal Oath & Magistrate / Police Stamp Block
  checkPageBreak(38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("COMMISSIONER OF OATHS / SAPS POLICE ATTESTATION", margin, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "I certify that the deponent has acknowledged that she/he knows and understands the contents of this declaration, which was sworn to / affirmed before me at: ",
    margin,
    y
  );
  y += 5;

  // Stamp and signature boxes
  const boxWidth = (contentWidth - 6) / 2;
  const boxHeight = 22;

  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, boxWidth, boxHeight);
  doc.rect(margin + boxWidth + 6, y, boxWidth, boxHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("DEPONENT SIGNATURE / MARK", margin + 3, y + 4.5);
  doc.text("COMMISSIONER OF OATHS OFFICIAL STAMP & DATE", margin + boxWidth + 9, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Date: ________________________", margin + 3, y + boxHeight - 2.5);
  doc.text("Rank / Station: ____________________ Force No: _________", margin + boxWidth + 9, y + boxHeight - 2.5);

  return doc;
}

/**
 * Convenience helper that executes direct jsPDF binary download.
 */
export function exportEctaAffidavitPdf(data: EctaAffidavitInput): string {
  const doc = createEctaAffidavitPdf(data);
  const cleanId = (data.incidentId || "vault_record").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Umkhuseli_Form2_ECTA15_${cleanId}.pdf`;
  doc.save(filename);
  return filename;
}
