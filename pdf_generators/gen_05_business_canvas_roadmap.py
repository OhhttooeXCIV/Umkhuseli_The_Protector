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
    story.append(Paragraph("UMKHUSELI: THE PROTECTOR • SANKOFA SAFE", styles['Badge']))
    story.append(Paragraph("Lean Business Canvas & Milestone Roadmap", styles['DocTitle']))
    story.append(Paragraph(
        "Commercial Strategy, Sustainability Model, Lean Canvas & Comprehensive Engineering Roadmap (2026 - 2027)",
        styles['DocSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # 1. Executive Summary & Canvas Overview
    story.append(Paragraph("1. Commercial Model & Strategic Mission", styles['H1']))
    story.append(Paragraph(
        "Umkhuseli operates as a <b>public-benefit social enterprise technology</b> designed specifically to dismantle "
        "the systemic barriers preventing South African domestic violence survivors from securing physical safety and legal justice. "
        "By eliminating expensive centralized server infrastructures through a local-first Room SQLite and Dexter IndexedDB architecture, "
        "the platform achieves near-zero marginal operational costs while maximizing survivor privacy and court evidentiary rigor.",
        styles['Body']
    ))

    # 2. Lean Business Canvas Table
    story.append(Paragraph("2. Umkhuseli 9-Box Lean Business Canvas", styles['H1']))

    canvas_rows = [
        [
            Paragraph("<b>1. Problem</b>", styles['TableHeader']),
            Paragraph("<b>2. Solution</b>", styles['TableHeader']),
            Paragraph("<b>3. Unique Value Proposition</b>", styles['TableHeader'])
        ],
        [
            Paragraph(
                "• South African femicide rate 5x global average.<br/>"
                "• Abusive partners inspect phones; safety apps trigger retaliatory violence.<br/>"
                "• Handwritten evidence lacks timestamps and is dismissed in court.<br/>"
                "• High data costs in townships prevent cloud-only app usage.",
                styles['TableText']
            ),
            Paragraph(
                "• PowerCalc SA prepaid electricity utility & store-themed launcher facade.<br/>"
                "• Hardware-encrypted AES-256-GCM diary with J88 clinical notes & ECTA hashes.<br/>"
                "• One-touch 72-hour SOS beacon with live GPS & battery telemetry.<br/>"
                "• Automated Form 2 Protection Order affidavit generator.<br/>"
                "• Cross-platform Vercel PWA and clean-domain direct APK downloads.",
                styles['TableText']
            ),
            Paragraph(
                "<i>'Safety without suspicion; evidence without leakage.'</i><br/><br/>"
                "A dual-persona covert safety shield engineered specifically for the legal and socio-economic realities of South Africa.",
                styles['TableTextBold']
            )
        ],
        [
            Paragraph("<b>4. Unfair Advantage</b>", styles['TableHeader']),
            Paragraph("<b>5. Customer Segments</b>", styles['TableHeader']),
            Paragraph("<b>6. Key Metrics</b>", styles['TableHeader'])
        ],
        [
            Paragraph(
                "• Deep contextual integration with South African zero-rated networks (*120*7867#).<br/>"
                "• Proprietary 0-millisecond camouflage wipe with zero recents traces.<br/>"
                "• Direct alignment with Magistrates Court Form 2 statutory standards.<br/>"
                "• Offline 9-province Thuthuzela directory.<br/>"
                "• Live UAT field testing framework with simulated guardian intercepts.",
                styles['TableText']
            ),
            Paragraph(
                "• <b>Primary:</b> Women and vulnerable individuals experiencing domestic abuse across diverse SA communities.<br/>"
                "• <b>Secondary:</b> University students and night-shift healthcare workers in high-risk transit corridors.<br/>"
                "• <b>Institutional Partners:</b> Thuthuzela Care Centres (TCC), SAPS FCS units, and legal aid NGOs.",
                styles['TableText']
            ),
            Paragraph(
                "• Camouflage trigger reliability: 100% (0 ms).<br/>"
                "• SOS dispatch delivery rate: >99.5%.<br/>"
                "• Protection orders granted using vault logs.<br/>"
                "• ICE network readiness: ≥ 3 active guardians per user.<br/>"
                "• 238/238 automated unit/integration tests passing.",
                styles['TableText']
            )
        ],
        [
            Paragraph("<b>7. Channels & Distribution</b>", styles['TableHeader']),
            Paragraph("<b>8. Cost Structure</b>", styles['TableHeader']),
            Paragraph("<b>9. Revenue Streams</b>", styles['TableHeader'])
        ],
        [
            Paragraph(
                "• Discreet referrals by TCC social workers and forensic nurses.<br/>"
                "• University campus gender equity and student welfare offices.<br/>"
                "• Community policing forums (CPFs) and health workers.<br/>"
                "• Clean-domain web downloads via hosted Vercel portal.",
                styles['TableText']
            ),
            Paragraph(
                "• <b>Hosting / Cloud:</b> Near $0 operational cost due to local-first architecture and Vercel edge.<br/>"
                "• <b>Telecom:</b> Zero-rated government lifelines and standard SMS.<br/>"
                "• <b>Maintenance:</b> Open-source Kotlin Jetpack Compose and React 19.",
                styles['TableText']
            ),
            Paragraph(
                "• <b>Public Sector Grants:</b> Department of Social Development (DSD), Solidarity Fund.<br/>"
                "• <b>Corporate CSI:</b> Telecom and financial sector safety grants (FNB, Old Mutual).<br/>"
                "• <b>Enterprise Licensing:</b> White-label student safety builds for universities.",
                styles['TableText']
            )
        ]
    ]

    t_canvas = Table(canvas_rows, colWidths=[162, 162, 163])
    t_canvas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('BACKGROUND', (0,2), (-1,2), SURFACE_ELEVATED),
        ('BACKGROUND', (0,4), (-1,4), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,1), [WHITE]),
        ('ROWBACKGROUNDS', (0,3), (-1,3), [LIGHT_BG]),
        ('ROWBACKGROUNDS', (0,5), (-1,5), [WHITE]),
    ]))
    story.append(t_canvas)
    story.append(Spacer(1, 10))

    # 3. Engineering Roadmap & Milestones
    story.append(Paragraph("3. Multi-Year Engineering Roadmap (2026 - 2027)", styles['H1']))

    milestones_data = [
        [
            Paragraph("<b>Milestone</b>", styles['TableHeader']),
            Paragraph("<b>Target Period & Status</b>", styles['TableHeader']),
            Paragraph("<b>Core Deliverables & Quality Gates</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>Milestone 1</b><br/>PowerCalc SA Camouflage Facade", styles['TableTextBold']),
            Paragraph("2026 Q1 - Q2<br/><font color='#059669'><b>COMPLETED (100%)</b></font>", styles['TableText']),
            Paragraph("PowerCalc SA prepaid utility with municipal tariffs (Ekurhuleni/Boksburg, City Power, Tshwane, Cape Town, Eskom) and store-themed launcher; mathematical unlock triggers (PIN 1234=, 8426=); 0ms panic exit.", styles['TableText'])
        ],
        [
            Paragraph("<b>Milestone 2</b><br/>Hardware Cryptography Vault", styles['TableTextBold']),
            Paragraph("2026 Q2<br/><font color='#059669'><b>COMPLETED (100%)</b></font>", styles['TableText']),
            Paragraph("AndroidKeyStore 256-bit AES-GCM master keys; 12-byte random IVs per record; ECTA Section 15 SHA-256 tamper-evident hashing; BiometricPrompt integration; encrypted Room SQLite DAO persistence.", styles['TableText'])
        ],
        [
            Paragraph("<b>Milestone 3</b><br/>Zero-Data Emergency Lifelines", styles['TableTextBold']),
            Paragraph("2026 Q3<br/><font color='#059669'><b>COMPLETED (100%)</b></font>", styles['TableText']),
            Paragraph("State-driven 3-second tactile SOS countdown; 72-hour live GPS SMS beacon; zero-rated USSD *120*7867# ping; 9-province offline Thuthuzela directory.", styles['TableText'])
        ],
        [
            Paragraph("<b>Milestone 4</b><br/>Form 2 Generator & Vercel PWA", styles['TableTextBold']),
            Paragraph("2026 Q3 - Q4<br/><font color='#059669'><b>COMPLETED (100%)</b></font>", styles['TableText']),
            Paragraph("Form 2 Protection Order Dossier Viewer with Section 4(2) address withholding; Vercel deployment with direct APK downloads; 159 Vitest + 79 Android unit tests passing.", styles['TableText'])
        ],
        [
            Paragraph("<b>Milestone 5</b><br/>UAT Live Testing & Feedback Loop", styles['TableTextBold']),
            Paragraph("2026 Q4<br/><font color='#059669'><b>COMPLETED (100%)</b></font>", styles['TableText']),
            Paragraph("In-app UAT mode with simulated guardian intercepts (+27 82 000 0001/2); Supabase `uat_feedback_submissions` syncing with local offline outbox; POPIA-compliant field feedback form.", styles['TableText'])
        ],
        [
            Paragraph("<b>Milestone 6</b><br/>National TCC & SAPS Pilot", styles['TableTextBold']),
            Paragraph("2027 Q1+<br/><font color='#64748B'><b>PLANNED</b></font>", styles['TableText']),
            Paragraph("Pilot deployment across 5 high-volume Gauteng and KZN Thuthuzela Care Centres; direct carrier USSD gateway partnerships; 11-language localization.", styles['TableText'])
        ]
    ]

    t_milestones = Table(milestones_data, colWidths=[120, 110, 257])
    t_milestones.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_milestones)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    out = r"C:\Users\thoso\Sankofa_mvp\Umkhuseli_The_Protector\public\business_plan_and_roadmap\Umkhuseli_Lean_Business_Canvas_and_Roadmap.pdf"
    build_pdf(out)
