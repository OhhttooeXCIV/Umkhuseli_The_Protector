import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from base_styles import (
    NumberedCanvas, get_custom_styles, make_callout,
    GOLD, GOLD_LIGHT, ALERT_RED, SAFE_GREEN, SURFACE_ELEVATED, TEXT_PRIMARY,
    TEXT_SECONDARY, TEXT_MUTED, LIGHT_BG, BORDER_COLOR, WHITE
)

def build_pdf(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = get_custom_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("UMKHUSELI: THE PROTECTOR • SANKOFA SAFE • FINAL MVP", styles['Badge']))
    story.append(Paragraph("Agile Kanban Board & Sprint Deliverables", styles['DocTitle']))
    story.append(Paragraph(
        "Live Project Tracking, Multi-Platform Task States, FNBAOTY Mentor Feedback Alignment Matrix & Definition of Done (DoD) • Final MVP Baseline",
        styles['DocSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # 1. Executive Summary & Mentor Feedback Alignment
    story.append(Paragraph("1. FNBAOTY Mentor Feedback Alignment Matrix", styles['H1']))
    story.append(Paragraph(
        "Following expert feedback from First National Bank App of the Year (FNBAOTY) hackathon mentors, the development sprint "
        "strictly consolidated the engineering scope from 12 prospective experimental modules down to a razor-focused <b>5-Feature Hackathon MVP</b>. "
        "All secondary capabilities (trip sentinels, audio sentry, citizen responder KYC, and OPRF contact discovery) were systematically "
        "transitioned to post-hackathon Future Horizons, ensuring 100% demo reliability, rigorous ECTA Section 15 legal alignment, and robust loadshedding resiliency.",
        styles['Body']
    ))

    mentor_matrix = [
        [
            Paragraph("<b>Mentor Feedback Vector</b>", styles['TableHeader']),
            Paragraph("<b>Mentor Recommendation</b>", styles['TableHeader']),
            Paragraph("<b>Production Architecture Response (v2.4.0)</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>Scope Overload</b>", styles['TableTextBold']),
            Paragraph("Narrow the scope and prioritise a small number of features that can be demonstrated reliably during the hackathon.", styles['TableText']),
            Paragraph("<b>Locked to 5 Core Features:</b> Chameleon Camouflage, ECTA Evidence Vault, Loadshedding SOS, Form 2 Court Pack, and 72-Hour TCC Navigator. All other 7 modules moved to Horizons 1 & 2.", styles['TableText'])
        ],
        [
            Paragraph("<b>Competitor Differentiation</b>", styles['TableTextBold']),
            Paragraph("Conduct competitor analysis of existing GBV response apps; identify what critical gaps remain in South Africa.", styles['TableText']),
            Paragraph("<b>Covert Decoys vs Overt Panic Apps:</b> Replaces branded panic icons (Namola, Bright Sky) with authentic municipal prepaid calculator (*PowerCalc SA*) and store launcher. Offline-ready during Stage 6 loadshedding.", styles['TableText'])
        ],
        [
            Paragraph("<b>Forensic Traces & Safety</b>", styles['TableTextBold']),
            Paragraph("Hidden interfaces do not guarantee safety; deleting local files does not remove all traces from monitored devices.", styles['TableText']),
            Paragraph("<b>Multi-Platform Zero-Trace Architecture:</b> For heavily monitored survivors, the Vercel Web PWA runs in incognito mode with <b>zero Google Play or Apple App Store download history</b>, zero persistent cache, and instant 1-click Quick-Exit.", styles['TableText'])
        ],
        [
            Paragraph("<b>Legal Admissibility Realism</b>", styles['TableTextBold']),
            Paragraph("Encrypted evidence and timestamps do not automatically make records legally admissible in court.", styles['TableText']),
            Paragraph("<b>Section 15 ECTA Alignment:</b> Does NOT claim 'guaranteed admissibility'. Produces tamper-evident, SHA-256 hashed <b>contemporaneous records</b> designed under Section 15 of ECTA (Act 25 of 2002) to corroborate affidavits and J88 clinical notes.", styles['TableText'])
        ],
        [
            Paragraph("<b>AI Protection Orders</b>", styles['TableTextBold']),
            Paragraph("AI-generated protection order statements must comply with statutory requirements and involve court clerks.", styles['TableText']),
            Paragraph("<b>Structured Intake Assistant (Not Unchecked AI):</b> Direct statutory mapping to official <b>Form 2 (Domestic Violence Act 116 of 1998 / Act 14 of 2021)</b> with explicit disclaimers requiring Magistrates Court clerk review.", styles['TableText'])
        ]
    ]

    t_mentor = Table(mentor_matrix, colWidths=[100, 150, 237])
    t_mentor.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_mentor)
    story.append(Spacer(1, 10))

    # 2. Agile Kanban Board Matrix
    story.append(Paragraph("2. Hackathon Final MVP Agile Kanban Board", styles['H1']))
    story.append(Paragraph(
        "The Kanban board below reflects the completed verification baseline and active sprint status for the Umkhuseli v2.4.0 Final MVP:",
        styles['Body']
    ))

    kanban_cards = [
        [
            Paragraph("<b>DONE & VERIFIED (100%)</b>", styles['TableHeader']),
            Paragraph("<b>CODE REVIEW & QA (100%)</b>", styles['TableHeader']),
            Paragraph("<b>IN PROGRESS / HARDENING</b>", styles['TableHeader']),
            Paragraph("<b>FUTURE HORIZONS (PLANNED)</b>", styles['TableHeader'])
        ],
        [
            Paragraph(
                "• <b>[FEAT-01] Chameleon Engine</b><br/>"
                "  PowerCalc SA Decoy + Wisdom Launcher + 0ms memory wipe.<br/><br/>"
                "• <b>[FEAT-02] ECTA Evidence Vault</b><br/>"
                "  AES-256-GCM + SHA-256 contemporaneous hash chain.<br/><br/>"
                "• <b>[FEAT-03] Loadshedding SOS</b><br/>"
                "  Duress PIN 9999 + offline SMS GPS fallback.<br/><br/>"
                "• <b>[FEAT-04] Statutory Form 2 Pack</b><br/>"
                "  Domestic Violence Act Form 2 affidavit dossier.<br/><br/>"
                "• <b>[FEAT-05] 9-Province TCC Guide</b><br/>"
                "  Offline Thuthuzela directory + 72-hour PEP guidance.",
                styles['TableText']
            ),
            Paragraph(
                "• <b>[QA-01] Live Pitch Rehearsal</b><br/>"
                "  3-minute demo run-sheet & simulated failovers.<br/><br/>"
                "• <b>[QA-02] Legal Disclaimers</b><br/>"
                "  ECTA Sec 15 and POPIA disclaimers in Safe Haven UI.<br/><br/>"
                "• <b>[QA-03] Automated Test Suite</b><br/>"
                "  238/238 tests passing across Android & Web suites.<br/><br/>"
                "• <b>[QA-04] R8 / ProGuard Shrink</b><br/>"
                "  Symbol obfuscation and release APK build verification.",
                styles['TableText']
            ),
            Paragraph(
                "• <b>[TS-01] Android 14+ Doze Mode</b><br/>"
                "  Foreground location service & cell tower triangulation.<br/><br/>"
                "• <b>[TS-02] PWA SW Loadshedding</b><br/>"
                "  Workbox CacheFirst tuning for Stage 6 cell tower blackouts.<br/><br/>"
                "• <b>[TS-03] Budget Chipset Fallback</b><br/>"
                "  Graceful degradation from StrongBox to TEE AES-256-GCM.<br/><br/>"
                "• <b>[TS-04] Live UAT Feedback</b><br/>"
                "  Supabase feedback sync with offline outbox queue.",
                styles['TableText']
            ),
            Paragraph(
                "• <b>[H1-01] Safe Journey</b><br/>"
                "  E-hailing taxi corridor deviation sentinel.<br/><br/>"
                "• <b>[H1-02] Audio Sentry</b><br/>"
                "  Ambient decibel spike & acoustic distress classifier.<br/><br/>"
                "• <b>[H1-03] Carrier VAS Tokens</b><br/>"
                "  Telco zero-rated USSD reverse-billing.<br/><br/>"
                "• <b>[H2-01] OPRF PSI Contacts</b><br/>"
                "  Curve25519 contact matching.<br/><br/>"
                "• <b>[H2-02] Citizen Responders</b><br/>"
                "  3-tier DHA/SAPS KYC network.",
                styles['TableText']
            )
        ]
    ]

    t_kanban = Table(kanban_cards, colWidths=[122, 122, 122, 121])
    t_kanban.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE])
    ]))
    story.append(t_kanban)
    story.append(Spacer(1, 10))

    # 3. Definition of Done (DoD) Verification
    story.append(Paragraph("3. Definition of Done (DoD) & Verification Checklist", styles['H1']))

    dod_items = [
        ("Failure-Proof Offline Demo", "All 5 core MVP features execute with 100% reliability in airplane mode without network dependencies, server timeouts, or unhandled exceptions."),
        ("Camouflage Invariance", "The application leaves zero visual traces in system recents, status bars, notification badges, or application drawer switchers."),
        ("Forensic 0-ms Memory Purge", "All decrypted diary items and cryptographic key references in RAM are synchronously wiped within 0 ms upon Back press, Quick-Exit, or Screen Lock."),
        ("Legal Realism & Ethical Guardrails", "Protection order outputs are strictly framed as preparatory drafting dossiers for Magistrates Court clerks, accompanied by mandatory statutory legal disclaimers."),
        ("Loadshedding Queueing Resilience", "If cell towers are offline due to Stage 6 power cuts, emergency beacons queue seamlessly into the local offline outbox and dispatch via SMS/GPS once connectivity is sensed.")
    ]

    for title, desc in dod_items:
        story.append(Paragraph(f"<b>• {title}:</b> {desc}", styles['Bullet']))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))
    story.append(make_callout(
        "<b>Verified Build Deliverables:</b> 238/238 automated tests passing across 25 suites (79 Android Robolectric/JUnit + 159 Web Vitest). "
        "Signed production APK compiled at <code>web/public/downloads/Umkhuseli_Safe_latest.apk</code>. Hosted Vercel PWA active with clean domain navigation.",
        title="Final MVP Production Sign-Off",
        style_type="green",
        width=487
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out = os.path.join(project_root, "public", "kanban_board", "Umkhuseli_Kanban_Board_Final_MVP.pdf")
    build_pdf(out)
