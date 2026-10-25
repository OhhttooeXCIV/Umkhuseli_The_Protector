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
    story.append(Paragraph("User Journeys, Personas & User Stories", styles['DocTitle']))
    story.append(Paragraph(
        "Human-Centred Safety UX & Adversary Evasion Workflows for South African GBV Survivors • Act 116/1998 & Act 14/2021 Compliant",
        styles['DocSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # Executive Overview
    story.append(Paragraph("1. Executive Context & Human-Centred Safety UX", styles['H1']))
    story.append(Paragraph(
        "In South Africa, the femicide rate is over five times the global average. Standard personal safety apps create severe "
        "dangers: abusers routinely inspect partners' phones, and discovering an emergency or SOS app frequently triggers retaliatory violence. "
        "Umkhuseli operates on the paradigm of <b>'Safety without suspicion; evidence without leakage'</b>. It provides an authentic everyday "
        "utility layer—<b>PowerCalc SA</b> (Municipal Prepaid Electricity & STS Token Calculator with Ekurhuleni/Boksburg, City Power, Tshwane, "
        "Cape Town, and Eskom tariffs) on Android and Web PWA, plus a native Store-Themed Launcher facade—that completely conceals "
        "a military-grade AES-256-GCM encrypted evidence vault and zero-latency emergency SOS beacon.",
        styles['Body']
    ))

    story.append(make_callout(
        "<b>Core Threat Reality:</b> The primary adversary is not a remote cybercriminal, but a hostile intimate partner in physical "
        "possession of the unlocked device. Every second of UI persistence, suspicious app icon, or notification artifact can be life-threatening. "
        "App branding as 'PowerCalc SA' with a power bolt and tariff arc icon ensures total plausibility for any South African household.",
        title="Physical Threat Model & Chameleon Camouflage",
        style_type="red",
        width=487
    ))
    story.append(Spacer(1, 10))

    # Personas
    story.append(Paragraph("2. Target Personas & Stakeholder Profiles", styles['H1']))
    
    personas_data = [
        [
            Paragraph("<b>Persona</b>", styles['TableHeader']),
            Paragraph("<b>Role & Demographics</b>", styles['TableHeader']),
            Paragraph("<b>Primary Needs & Constraints</b>", styles['TableHeader']),
            Paragraph("<b>Umkhuseli Solution Touchpoint</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>Annatjie / Naledi</b>", styles['TableTextBold']),
            Paragraph("31 yrs • IPV Survivor • Boksburg / Soweto, Gauteng", styles['TableText']),
            Paragraph("Partner routinely inspects device; requires zero visible safety traces, authentic local utility facade, and court-admissible diary.", styles['TableText']),
            Paragraph("PowerCalc SA (Ekurhuleni/City Power prepaid utility facade); 0ms panic exit; AES-256-GCM vault; Form 2 export.", styles['TableText'])
        ],
        [
            Paragraph("<b>Zanele K.</b>", styles['TableTextBold']),
            Paragraph("21 yrs • University Student • Durban commuter corridor, KZN", styles['TableText']),
            Paragraph("Travels high-risk public transit late at night; frequently has 0 data and 0 airtime balance.", styles['TableText']),
            Paragraph("Zero-airtime USSD distress pings (*120*7867#); offline 9-province Thuthuzela directory; 72-hr GPS beacon.", styles['TableText'])
        ],
        [
            Paragraph("<b>Lerato Khubeka</b>", styles['TableTextBold']),
            Paragraph("34 yrs • Primary ICE Contact (Sister / Guardian) • Johannesburg", styles['TableText']),
            Paragraph("Needs immediate, actionable SOS location alerts with handset telemetry to mobilize SAPS flying squad.", styles['TableText']),
            Paragraph("Receives automated SMS/WhatsApp alerts with Google Find My Device tracker and exact battery percentage.", styles['TableText'])
        ],
        [
            Paragraph("<b>Sister Dlamini</b>", styles['TableTextBold']),
            Paragraph("48 yrs • Forensic Nurse & Social Worker • Chris Hani Baragwanath TCC", styles['TableText']),
            Paragraph("Requires chronological, timestamped incident affidavits with SAPS OB references to assist court protection orders.", styles['TableText']),
            Paragraph("Receives standardized Form 2 Protection Order dossiers with Section 4(2) safe address withholding.", styles['TableText'])
        ],
        [
            Paragraph("<b>UAT Evaluator</b>", styles['TableTextBold']),
            Paragraph("26 yrs • Community Safety Field Tester • East Rand, Gauteng", styles['TableText']),
            Paragraph("Needs to live-test emergency panic triggers without dispatching real police or alarming personal contacts.", styles['TableText']),
            Paragraph("In-app UAT Mode with simulated dispatch intercept (+27 82 000 0001/2) and POPIA-compliant feedback routing.", styles['TableText'])
        ]
    ]

    t_personas = Table(personas_data, colWidths=[80, 115, 145, 147])
    t_personas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_personas)
    story.append(Spacer(1, 14))

    # User Story 1: Survivor's Shield
    story.append(Paragraph("3. End-to-End User Story: 'The Survivor's Shield'", styles['H1']))
    story.append(Paragraph("A representative multi-stage operational journey demonstrating covert daily usage, evidence capture, distress escalation, and emergency evasion:", styles['Body']))

    story_steps = [
        ("Phase 1: Normal Everyday Use (PowerCalc SA Facade)",
         "The survivor uses her phone normally throughout the day. Umkhuseli displays as 'PowerCalc SA' with an electric bolt icon, computing Ekurhuleni / Eskom prepaid electricity units and STS recharge tokens. If an inquisitive partner inspects the device, it appears to be an indispensable household utility."),
        ("Phase 2: Secret Entry & Biometric Evidence Logging",
         "When safe and in private, the survivor unlocks the Safe Haven via a covert mathematical sequence (entering PIN 1234=, 8426=, or 0000= on the calculator keypad, or long-pressing the STS Token generator). Hardware BiometricPrompt verifies her fingerprint. Inside the Evidence Vault, she logs a physical altercation, attaches medical notes, and logs SAPS Occurrence Book OB 842/10/2026. Data is encrypted on-device via AES-256-GCM."),
        ("Phase 3: Immediate Threat Escalation & Tactile SOS Trigger",
         "A violent altercation begins in the household. The survivor triggers the Quick-Access SOS button. A 3-second tactile vibration countdown engages, allowing silent cancellation if triggered accidentally. Upon countdown completion, high-priority emergency SMS alerts with 72-hour live GPS tracks, battery telemetry, and Google Find My Device tracker URLs dispatch to her 5 ICE contacts."),
        ("Phase 4: Instant Panic Camouflage Wipe (0 ms)",
         "The perpetrator charges into the room demanding to see what she is doing. The survivor hits the hardware Back button or Escape key. Safe Haven terminates instantly in <b>0 milliseconds</b>, scrubbing decrypted data from RAM and restoring the functional PowerCalc SA prepaid utility. No screenshot or recents card remains in Android task overview."),
        ("Phase 5: Magistrates Court Protection Order Submission",
         "Accompanied by a TCC social worker, the survivor generates an official Form 2 Protection Order PDF directly from her vault. Her residential address is statutorily withheld under Section 4(2) of the Domestic Violence Act, protecting her from location leakage while presenting chronological, tamper-evident testimony.")
    ]

    for title, desc in story_steps:
        story.append(Paragraph(f"<b>• {title}</b>", styles['BodyBold']))
        story.append(Paragraph(desc, styles['Bullet']))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 8))

    # User Story 2 & 3
    story.append(Paragraph("4. Specialized Safety Scenarios", styles['H1']))
    
    story.append(Paragraph("Scenario A: Coerced Unlock & Duress PIN (Code 9999=)", styles['H2']))
    story.append(Paragraph(
        "If an abuser physically forces the survivor to unlock the application, inputting the <b>Duress PIN (9999=)</b> triggers a dual-action: "
        "1) The app suppresses all Safe Haven UI and renders a convincing, fully functional utility decoy (generating an authentic Eskom/Ekurhuleni STS token receipt); "
        "2) A silent high-priority distress beacon is dispatched in the background to the primary ICE guardian with live GPS telemetry.",
        styles['Body']
    ))

    story.append(Paragraph("Scenario B: Zero-Install Desktop & iOS PWA via Vercel", styles['H2']))
    story.append(Paragraph(
        "Survivors who cannot install native Android APKs without detection can access the web application on desktop PC/Mac or iPhone Safari via a hosted Vercel deployment. "
        "The web portal operates as a fully functional municipal electricity calculator with a consumer portal, changelog, and safety manual, enabling direct APK downloads "
        "for trusted devices while keeping the host browser history clean via 1-click Google Quick-Exit.",
        styles['Body']
    ))

    story.append(Paragraph("Scenario C: Commuter Transit with Zero Airtime & Data", styles['H2']))
    story.append(Paragraph(
        "University student Zanele is stalked while walking to a taxi rank in Durban. She has 0 MB of mobile data and R0.00 airtime. "
        "Umkhuseli connects directly to South Africa's statutory zero-rated infrastructure: one-touch dialing for SAPS Flying Squad (10111), "
        "toll-free GBV Command Centre (0800 428 428), and zero-data USSD callback pings (*120*7867#) that request an emergency callback to her handset.",
        styles['Body']
    ))

    story.append(Spacer(1, 10))
    story.append(make_callout(
        "<b>Evidentiary Integrity Guarantee:</b> Under the Domestic Violence Amendment Act 14 of 2021 and ECTA Section 15, electronic messages and digital records "
        "are fully recognized as admissible evidence in South African courts. Umkhuseli's immutable timestamps, SHA-256 cryptographic hashes, and OB linking prevent claims of fabrication.",
        title="South African Legal Admissibility",
        style_type="green",
        width=487
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    out = r"C:\Users\thoso\Sankofa_mvp\Umkhuseli_The_Protector\public\user_journeys_and_stories\Umkhuseli_User_Journeys_and_Stories.pdf"
    build_pdf(out)
