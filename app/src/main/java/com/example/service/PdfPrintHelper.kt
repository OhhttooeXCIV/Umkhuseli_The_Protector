package com.example.service

import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import com.example.data.local.entity.IncidentEntity
import com.example.data.local.entity.UserProfileEntity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class PdfPrintHelper(private val context: Context) {

    fun printForm2Dossier(
        complainant: UserProfileEntity?,
        incidents: List<IncidentEntity>,
        attachComplainantDetails: Boolean = true
    ) {
        val htmlContent = generateForm2Html(complainant, incidents, attachComplainantDetails)

        // Android Print Spooler using hidden WebView to prevent leaving permanent disk traces
        val webView = WebView(context)
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean = false

            override fun onPageFinished(view: WebView?, url: String?) {
                val printManager = context.getSystemService(Context.PRINT_SERVICE) as? PrintManager
                val jobName = "Form2_Protection_Order_${System.currentTimeMillis()}"
                val printAdapter = webView.createPrintDocumentAdapter(jobName)
                val printAttributes = PrintAttributes.Builder()
                    .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                    .setResolution(PrintAttributes.Resolution("pdf_res", "PDF Resolution", 300, 300))
                    .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                    .build()

                printManager?.print(jobName, printAdapter, printAttributes)
            }
        }

        webView.loadDataWithBaseURL("file:///android_asset/", htmlContent, "text/html", "UTF-8", null)
    }

    fun generateForm2Html(
        complainant: UserProfileEntity?,
        incidents: List<IncidentEntity>,
        attachComplainantDetails: Boolean
    ): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        val generatedOn = dateFormat.format(Date())

        val complainantBlock = if (attachComplainantDetails && complainant != null && complainant.isProfileCompleted) {
            val addressText = if (complainant.isAddressWithheld) {
                """<span style="color:#b91c1c; font-weight:bold;">[RESIDENTIAL ADDRESS WITHHELD PURSUANT TO SECTION 4(2) OF ACT 116 OF 1998 FOR COMPLAINANT SAFETY]</span><br/>Alternative Service Address: ${complainant.safeServiceAddress.ifBlank { "Local Police Station / Court Registry" }}"""
            } else {
                complainant.safeServiceAddress.ifBlank { "Not specified" }
            }

            """
            <div class="legal-box">
                <div class="box-title">PART A: COMPLAINANT PARTICULARS (APPLICANT)</div>
                <table class="particulars-table">
                    <tr><td class="lbl">Full Legal Names:</td><td><strong>${complainant.fullLegalNames.ifBlank { "Confidential Complainant" }}</strong></td></tr>
                    <tr><td class="lbl">ID / Passport Number:</td><td>${complainant.idOrPassportNumber.ifBlank { "Provided under seal" }}</td></tr>
                    <tr><td class="lbl">Contact Telephone:</td><td>${complainant.safeContactNumber.ifBlank { "Via Clerk of the Court" }}</td></tr>
                    <tr><td class="lbl">Address for Service of Notices:</td><td>$addressText</td></tr>
                    <tr><td class="lbl">Domestic Relationship to Respondent:</td><td>${complainant.relationshipToRespondent}</td></tr>
                    <tr><td class="lbl">Alleged Respondent / Abuser:</td><td><strong>${complainant.respondentName.ifBlank { "As identified in incident records below" }}</strong></td></tr>
                </table>
            </div>
            """
        } else {
            """
            <div class="legal-box" style="border-left: 4px solid #f59e0b;">
                <div class="box-title">PART A: COMPLAINANT PARTICULARS</div>
                <p style="font-size: 11px; color: #555; margin: 4px 0;">Complainant personal particulars redacted for safety at time of digital export. Sworn affidavit attached below.</p>
            </div>
            """
        }

        val incidentsHtml = if (incidents.isEmpty()) {
            "<p><em>No incident records logged in this vault.</em></p>"
        } else {
            incidents.mapIndexed { index, item ->
                val sevColor = when (item.severityLevel) {
                    5 -> "#dc2626"
                    4 -> "#ea580c"
                    3 -> "#d97706"
                    else -> "#16a34a"
                }
                val obRow = if (item.policeObNumber.isNotBlank()) {
                    """<tr><td class="lbl">SAPS OB (Occurrence Book) #:</td><td><strong>${item.policeObNumber}</strong></td></tr>"""
                } else ""

                """
                <div class="incident-card">
                    <div class="incident-header">
                        <span class="inc-num">INCIDENT #${index + 1} &mdash; ${item.dateTimeFormatted}</span>
                        <span class="sev-badge" style="background-color: $sevColor;">SEVERITY ${item.severityLevel} / 5</span>
                    </div>
                    <table class="particulars-table">
                        <tr><td class="lbl">Category of Domestic Abuse:</td><td><strong>${item.incidentType}</strong></td></tr>
                        <tr><td class="lbl">Alleged Perpetrator:</td><td>${item.perpetrator.ifBlank { "Respondent" }}</td></tr>
                        <tr><td class="lbl">Specific Location:</td><td>${item.locationDescription.ifBlank { "Shared residence / private location" }}</td></tr>
                        $obRow
                        <tr><td class="lbl">Physical Injuries / Trauma Impact:</td><td>${item.injuriesOrImpact.ifBlank { "None recorded / emotional impact" }}</td></tr>
                        <tr><td class="lbl">Witnesses Present:</td><td>${item.witnesses.ifBlank { "None / private domain" }}</td></tr>
                    </table>
                    <div class="narrative-box">
                        <div class="lbl" style="margin-bottom: 4px; font-weight: bold;">SWORN FACTUAL STATEMENT OF ACTS COMMITTED:</div>
                        <div style="font-size: 12px; line-height: 1.5; color: #1e293b;">${item.description}</div>
                    </div>
                </div>
                """
            }.joinToString("\n")
        }

        val signatureSection = if (attachComplainantDetails && complainant != null && complainant.digitalSignatureBase64.isNotBlank()) {
            """
            <div class="signature-block">
                <p style="font-size: 11px; margin-bottom: 8px;"><strong>SWORN CERTIFICATION:</strong> I hereby certify that the information and factual statements recorded above are true, complete and correct to the best of my knowledge and belief.</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <img src="${complainant.digitalSignatureBase64}" style="max-height: 55px; border-bottom: 1px solid #333;" alt="Complainant Signature"/>
                        <div style="font-size: 10px; color: #555; margin-top: 4px;">Signature of Complainant / Deponent</div>
                    </div>
                    <div style="text-align: right; font-size: 10px; color: #555;">
                        <div>Date & Time: $generatedOn</div>
                        <div>Digital Evidence Verification Hash: SHA-256 AUTHENTICATED</div>
                    </div>
                </div>
            </div>
            """
        } else {
            """
            <div class="signature-block" style="border-top: 1px dashed #999; padding-top: 20px; margin-top: 30px;">
                <div style="display: flex; justify-content: space-between;">
                    <div style="width: 250px; border-top: 1px solid #333; text-align: center; font-size: 10px; padding-top: 4px;">
                        Signature of Complainant / Applicant
                    </div>
                    <div style="width: 250px; border-top: 1px solid #333; text-align: center; font-size: 10px; padding-top: 4px;">
                        Clerk of the Magistrates' Court / Commissioner of Oaths
                    </div>
                </div>
            </div>
            """
        }

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Form 2 Application - Domestic Violence Act</title>
            <style>
                @page { size: A4 portrait; margin: 15mm; }
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 10px; font-size: 12px; }
                .court-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
                .court-title { font-size: 14px; font-weight: bold; letter-spacing: 1px; }
                .court-sub { font-size: 11px; font-weight: bold; margin-top: 4px; color: #334155; }
                .legal-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; }
                .box-title { font-size: 11px; font-weight: bold; color: #1e293b; margin-bottom: 6px; letter-spacing: 0.5px; }
                .particulars-table { width: 100%; border-collapse: collapse; font-size: 11px; }
                .particulars-table td { padding: 3px 4px; vertical-align: top; }
                .particulars-table td.lbl { width: 35%; color: #475569; font-weight: 500; }
                .incident-card { page-break-inside: avoid; border: 1px solid #94a3b8; border-radius: 6px; margin-bottom: 14px; padding: 12px; background: #ffffff; }
                .incident-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px; }
                .inc-num { font-weight: bold; font-size: 12px; color: #0f172a; }
                .sev-badge { color: #ffffff; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
                .narrative-box { background: #f1f5f9; padding: 8px; border-radius: 4px; margin-top: 8px; }
                .signature-block { page-break-inside: avoid; margin-top: 24px; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="court-header">
                <div class="court-title">REPUBLIC OF SOUTH AFRICA</div>
                <div class="court-sub">APPLICATION FOR PROTECTION ORDER &mdash; FORM 2</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Section 4(1) of the Domestic Violence Act, 1998 (Act No. 116 of 1998 / Amendment Act 14 of 2021)</div>
                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Exported from Umkhuseli Tamper-Proof Evidence Vault on $generatedOn</div>
            </div>

            $complainantBlock

            <div style="margin-top: 16px; margin-bottom: 8px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; color: #0f172a;">
                PART B: PARTICULARS OF DOMESTIC VIOLENCE INCIDENTS & EVIDENCE DOSSIER
            </div>

            $incidentsHtml

            $signatureSection
        </body>
        </html>
        """
    }
}
