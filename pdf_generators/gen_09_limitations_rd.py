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
    story.append(Paragraph("System Limitations, Threat Boundaries & R&D", styles['DocTitle']))
    story.append(Paragraph(
        "Honest Engineering Boundary Analyses, Coercion Threat Models, Platform Sandbox Constraints & Active Research Register • Final MVP",
        styles['DocSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # 1. Threat Boundary: The Adversary in Physical Possession
    story.append(Paragraph("1. Physical Coercion & Adversary Threat Boundaries", styles['H1']))
    story.append(Paragraph(
        "Standard mobile security threat models assume a remote adversary attempting to breach a device across a network. "
        "In Gender-Based Violence (GBV) and intimate partner violence contexts, the threat reality is fundamentally inverted: "
        "the adversary has <b>physical possession, continuous proximity, and the power of coercion</b> over the survivor. "
        "Honest engineering requires recognizing the absolute boundary of what client software can and cannot defend against:",
        styles['Body']
    ))

    story.append(make_callout(
        "<b>Engineering Boundary Principle:</b> No mobile application can completely prevent detection if an abusive partner installs "
        "commercial stalkerware/keyloggers at the OS kernel level, or uses physical violence to force a survivor to unlock their device. "
        "Umkhuseli designs around this boundary through <b>plausible deniability, multi-platform zero-trace PWAs, and authentic decoy utilities</b>.",
        title="Physical Threat Boundary Reality",
        style_type="red",
        width=487
    ))
    story.append(Spacer(1, 10))

    # Boundary Matrix Table
    boundary_matrix = [
        [
            Paragraph("<b>Threat Vector & Boundary</b>", styles['TableHeader']),
            Paragraph("<b>Inherent Technical Limitation</b>", styles['TableHeader']),
            Paragraph("<b>Umkhuseli Architectural Countermeasure</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>Intense Device Inspection</b>", styles['TableTextBold']),
            Paragraph("App stores (Google Play, Apple App Store) maintain unalterable download histories and purchase records.", styles['TableText']),
            Paragraph("<b>Zero-Install Vercel Web PWA:</b> Survivors facing high scrutiny access the portal in incognito mode. Bypasses app stores entirely, leaving 0 install records and 0 battery footprint.", styles['TableText'])
        ],
        [
            Paragraph("<b>Forced / Duress Unlocking</b>", styles['TableTextBold']),
            Paragraph("Under physical duress, survivors cannot refuse to unlock their smartphone without risking violence.", styles['TableText']),
            Paragraph("<b>Duress PIN 9999:</b> Entering 9999 generates a realistic municipal voucher error receipt ('STS Error: Communication Fault') while silently dispatching the background SOS beacon.", styles['TableText'])
        ],
        [
            Paragraph("<b>Surprise Over-the-Shoulder Discovery</b>", styles['TableTextBold']),
            Paragraph("Adversary enters the room while survivor has the evidence vault or TCC navigator open.", styles['TableText']),
            Paragraph("<b>0-ms Camouflage Scrub:</b> Back button or panic tap instantly wipes decrypted RAM memory in <10ms and renders the innocent PowerCalc SA municipal calculator.", styles['TableText'])
        ]
    ]

    t_boundary = Table(boundary_matrix, colWidths=[110, 167, 210])
    t_boundary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_boundary)
    story.append(Spacer(1, 10))

    # 2. Operating System & Hardware Sandbox Constraints
    story.append(Paragraph("2. OS Sandboxing & Hardware Constraints", styles['H1']))
    story.append(Paragraph(
        "Mobile operating systems impose stringent sandboxing and battery constraints that directly impact emergency reliability:",
        styles['Body']
    ))

    os_constraints = [
        ("Android 14+ Doze Mode & Aggressive OEM Battery Killers",
         "Samsung OneUI, Xiaomi HyperOS, and Huawei aggressively throttle background GPS and network threads after 15 minutes of screen-off time. "
         "<b>Mitigation:</b> Umkhuseli configures an Android 14 <code>foregroundServiceType='location'</code> with an innocuous sticky notification ('PowerCalc SA Tariff Monitor'), "
         "requests battery optimization exemptions, and falls back to coarse cell tower network triangulation if GPS hardware sleeps."),
        ("Budget Hardware Cryptography Degradation",
         "Many vulnerable users in low-income South African communities rely on entry-level Android devices (MediaTek Helio A22, Unisoc SC9863A) lacking discrete Secure Elements. "
         "Enabling <code>setIsStrongBoxBacked(true)</code> causes <code>StrongBoxUnavailableException</code>. "
         "<b>Mitigation:</b> Wrapped in a robust try-catch handler that gracefully degrades to the device's hardware-backed Trusted Execution Environment (TEE) AES-256-GCM."),
        ("Samsung USSD '#' Stripping Bug",
         "Samsung Android 14 dialers treat the trailing '#' in <code>*120*7867#</code> as a URI fragment and strip it. "
         "<b>Mitigation:</b> Explicitly wrapped in <code>Uri.encode(ussdString)</code> to ensure reliable zero-airtime USSD callback execution.")
    ]

    for title, desc in os_constraints:
        story.append(Paragraph(f"<b>• {title}:</b> {desc}", styles['Bullet']))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))

    # 3. South African Infrastructure Constraints
    story.append(Paragraph("3. South African Infrastructure Realities & Mitigations", styles['H1']))
    story.append(Paragraph(
        "• <b>Stage 6 Loadshedding Base Station Blackouts:</b> During 4-6 hour rotational power cuts, cellular base station backup batteries become exhausted, causing complete LTE data drops. "
        "<b>Mitigation:</b> Local-first Room SQLite and Dexter IndexedDB architecture allows complete offline logging. Beacons queue in an offline outbox and switch to SMS/GPS binary packets.<br/>"
        "• <b>Data Poverty & Airtime Depletion:</b> Prepaid airtime balances are frequently R0.00. "
        "<b>Mitigation:</b> Direct integration with South Africa's statutory zero-rated infrastructure: SAPS 10111, GBV Command Centre 0800 428 428, and USSD *120*7867# callback pings.",
        styles['Bullet']
    ))
    story.append(Spacer(1, 8))

    # 4. Legal Realism & Ethical Guardrails
    story.append(Paragraph("4. Legal Admissibility Realism & Ethical Guardrails", styles['H1']))
    story.append(Paragraph(
        "Umkhuseli maintains rigorous intellectual honesty regarding legal outcomes:<br/>"
        "• <b>ECTA Section 15 Alignment vs 'Guaranteed Admissibility':</b> No cryptographic system can guarantee court admissibility in South Africa. Magistrates and High Court judges evaluate evidence based on relevance and probative value. Umkhuseli creates <b>tamper-evident contemporaneous records</b> with SHA-256 hash chains that satisfy Section 15 of ECTA (Act 25 of 2002) to corroborate sworn affidavits and J88 clinical notes.<br/>"
        "• <b>Ethical AI Guardrails:</b> The Form 2 drafting assistant does NOT generate binding legal decrees. It functions as a structured intake assistant aiding court clerks and social workers, with mandatory disclaimers advising review by Legal Aid SA.",
        styles['Bullet']
    ))
    story.append(Spacer(1, 8))

    # 5. Active R&D Register
    story.append(Paragraph("5. Active Research & Development (R&D) Register", styles['H1']))

    rd_projects = [
        [
            Paragraph("<b>R&D Project Track</b>", styles['TableHeader']),
            Paragraph("<b>Research Objective & Technology</b>", styles['TableHeader']),
            Paragraph("<b>Target Horizon</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>Curve25519 OPRF PSI</b>", styles['TableTextBold']),
            Paragraph("Oblivious Pseudorandom Function Private Set Intersection for contact matching immune to South African MSISDN rainbow tables.", styles['TableText']),
            Paragraph("Phase 3 (Horizon 2)", styles['TableText'])
        ],
        [
            Paragraph("<b>TinyML Acoustic Classifier</b>", styles['TableTextBold']),
            Paragraph("8-bit quantized on-device audio model recognizing acoustic distress and glass breaks within 15-second RAM buffers.", styles['TableText']),
            Paragraph("Phase 2 (Horizon 1)", styles['TableText'])
        ],
        [
            Paragraph("<b>PostGIS Ward Safety Mesh</b>", styles['TableTextBold']),
            Paragraph("Zero-knowledge municipal ward polygon geofencing for pseudonymous peer safety alerts.", styles['TableText']),
            Paragraph("Phase 3 (Horizon 2)", styles['TableText'])
        ]
    ]

    t_rd = Table(rd_projects, colWidths=[120, 267, 100])
    t_rd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_rd)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out = os.path.join(project_root, "public", "limitations_and_rd", "Umkhuseli_Limitations_and_RD_Final_MVP.pdf")
    build_pdf(out)
