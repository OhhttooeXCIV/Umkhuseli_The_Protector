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
    story.append(Paragraph("Future Epics & Post-Hackathon Rollout", styles['DocTitle']))
    story.append(Paragraph(
        "Engineering Specifications for Horizon 1 (Field Expansion), Horizon 2 (Community Scaling) & Milestone 6 National TCC Pilot (2026 - 2027)",
        styles['DocSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # 1. Post-Hackathon Strategy & Architecture Isolation
    story.append(Paragraph("1. Post-Hackathon Strategic Roadmap Architecture", styles['H1']))
    story.append(Paragraph(
        "To satisfy the FNBAOTY mentor mandate of <b>avoiding scope overload while building for scalable national impact</b>, "
        "Umkhuseli isolates advanced engineering capabilities into two phased horizons. Foundational components for these epics already "
        "exist within the repository (e.g. <code>SafeJourneyManager.kt</code>, <code>audioSentryService.ts</code>, <code>CarrierDetectionManager.kt</code>, "
        "and <code>WifiDirectShareManager.kt</code>). By maintaining clean architectural boundaries, the 5 MVP Core features remain lightweight, "
        "ultra-reliable, and strictly offline-first, while providing a clear blueprint for institutional expansion.",
        styles['Body']
    ))

    story.append(make_callout(
        "<b>Architectural Decoupling Principle:</b> Future Epics operate as modular extensions plugged into the existing <code>AppContainer</code>. "
        "They are gated behind user consent and strictly adhere to the POPIA principle of minimal data collection. No future epic compromises "
        "the 0-ms instant camouflage scrub or local-first evidence vault.",
        title="Privacy & Reliability Guardrails",
        style_type="gold",
        width=487
    ))
    story.append(Spacer(1, 10))

    # 2. Horizon 1: Immediate Field Expansion (Phase 2)
    story.append(Paragraph("2. Horizon 1: Immediate Field Expansion (Phase 2 — Q1 2027)", styles['H1']))
    story.append(Paragraph(
        "Horizon 1 focuses on high-risk transit environments and automated distress recognition:",
        styles['Body']
    ))

    h1_epics = [
        [
            Paragraph("<b>Epic ID & Name</b>", styles['TableHeader']),
            Paragraph("<b>Technical Architecture & Implementation</b>", styles['TableHeader']),
            Paragraph("<b>South African Context & Survivor Value</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>[EPIC-01]<br/>Safe Journey E-Hailing Corridor Sentinel</b>", styles['TableTextBold']),
            Paragraph("Implemented via <code>SafeJourneyManager.kt</code>. Leverages fused location provider to track transit corridors for Bolt, Uber, and minibus taxi rides. Triggers dead-man's periodic check-in; escalates to silent ICE dispatch if off-route by >250m.", styles['TableText']),
            Paragraph("Protects commuters and students traveling late through high-risk urban routes (e.g. Johannesburg CBD, Durban Warwick Triangle) against route diversion or abduction.", styles['TableText'])
        ],
        [
            Paragraph("<b>[EPIC-02]<br/>Audio Sentry Ambient Acoustic Classifier</b>", styles['TableTextBold']),
            Paragraph("Implemented via <code>audioSentryService.ts</code>. On-device lightweight acoustic classifier analyzing 15-second circular RAM buffer for decibel spikes and human screaming frequencies (1 kHz - 4 kHz). Never streams audio to cloud.", styles['TableText']),
            Paragraph("Automates emergency dispatch when a survivor is physically restrained or cannot reach their handset to enter unlock codes or trigger panic gestures.", styles['TableText'])
        ],
        [
            Paragraph("<b>[EPIC-03]<br/>Direct Carrier VAS & Reverse-Billing</b>", styles['TableTextBold']),
            Paragraph("Implemented via <code>CarrierDetectionManager.kt</code>. Integrates telco VAS APIs with Vodacom, MTN, Telkom, and Cell C to facilitate zero-rated USSD reverse-billing (*120*7867#) and automatic data token replenishment.", styles['TableText']),
            Paragraph("Guarantees emergency connectivity for township residents with R0.00 airtime balance, eliminating poverty-induced communication blackouts.", styles['TableText'])
        ]
    ]

    t_h1 = Table(h1_epics, colWidths=[120, 187, 180])
    t_h1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_h1)
    story.append(Spacer(1, 10))

    # 3. Horizon 2: Community & Ecosystem Scaling (Phase 3)
    story.append(Paragraph("3. Horizon 2: Community & Ecosystem Scaling (Phase 3 — Q2/Q3 2027)", styles['H1']))
    story.append(Paragraph(
        "Horizon 2 introduces decentralized cryptographic trust and community-level rapid response networks:",
        styles['Body']
    ))

    h2_epics = [
        [
            Paragraph("<b>Epic ID & Name</b>", styles['TableHeader']),
            Paragraph("<b>Technical Architecture & Implementation</b>", styles['TableHeader']),
            Paragraph("<b>South African Context & Survivor Value</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>[EPIC-04]<br/>OPRF PSI Private Contact Discovery</b>", styles['TableTextBold']),
            Paragraph("2-Hash Elliptic Curve Diffie-Hellman Oblivious PRF over Curve25519. Allows survivors to verify if trusted contacts or advocates use Umkhuseli without uploading address books or exposing phone numbers to rainbow table attacks.", styles['TableText']),
            Paragraph("Prevents abusive partners, stalkers, or corrupt telecommunication operators from scanning subscriber databases to identify who has installed safety applications.", styles['TableText'])
        ],
        [
            Paragraph("<b>[EPIC-05]<br/>'Touched by an Angel' Citizen First-Responders</b>", styles['TableTextBold']),
            Paragraph("Implemented via <code>GuardianResponderSection.kt</code>. Radial dispatch algorithm (500m - 2km). Requires 3-tier KYC: DHA National ID verification, biometric liveness check, and SAPS Police Clearance Certificate.", styles['TableText']),
            Paragraph("Overcomes SAPS 45+ minute rural response delays by mobilizing vetted local community aunties, church leaders, and CPF members within walking distance.", styles['TableText'])
        ],
        [
            Paragraph("<b>[EPIC-06]<br/>P2P Wi-Fi Direct Covert Mesh Share</b>", styles['TableTextBold']),
            Paragraph("Implemented via <code>WifiDirectShareManager.kt</code> and <code>CovertNearbyShareSection.kt</code>. Localized peer-to-peer APK and offline TCC database replication via Wi-Fi Direct / BLE without cellular or internet connectivity.", styles['TableText']),
            Paragraph("Enables Community Health Workers (CHWs) to safely distribute the application to women in deep rural areas or informal settlements lacking mobile network coverage.", styles['TableText'])
        ],
        [
            Paragraph("<b>[EPIC-07]<br/>Ward-Level Pseudonymous Safety Circles</b>", styles['TableTextBold']),
            Paragraph("PostGIS ward-level polygon geofencing coupled with monthly rotating cryptographic pseudonyms and zero-knowledge location proofs.", styles['TableText']),
            Paragraph("Provides localized alert boards where survivors can share anonymous safety warnings (e.g. violent perpetrators, dark taxi corridors) without being identified.", styles['TableText'])
        ]
    ]

    t_h2 = Table(h2_epics, colWidths=[120, 187, 180])
    t_h2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_h2)
    story.append(Spacer(1, 10))

    # 4. Milestone 6: National Rollout & Operational Partnerships
    story.append(Paragraph("4. Milestone 6: National Rollout & Operational Partnerships (2027)", styles['H1']))
    story.append(Paragraph(
        "The national rollout will scale Umkhuseli across institutional public health, policing, and justice frameworks:<br/>"
        "• <b>5-Facility TCC Pilot:</b> Live field trials embedded in high-volume Thuthuzela Care Centres: Chris Hani Baragwanath (Soweto), Helen Joseph (JHB), Kalafong (Atteridgeville), Karl Bremer (Cape Town), and Prince Mshiyeni (Umlazi).<br/>"
        "• <b>11-Language Localization:</b> Native localization across all 11 official South African languages (isiZulu, isiXhosa, Afrikaans, Sepedi, Setswana, Sesotho, Xitsonga, siSwati, Tshivenda, isiNdebele, English).<br/>"
        "• <b>Department of Justice e-Filing Integration:</b> Secure digital submission of Form 2 Protection Order dossiers directly into Magistrates Court ICMS portals.",
        styles['Bullet']
    ))

    story.append(Spacer(1, 8))
    story.append(make_callout(
        "<b>Strategic Horizon Outcome:</b> The combination of immediate hackathon delivery (5 Core Features) and rigorous future epic architecture "
        "positions Umkhuseli as South Africa's most comprehensive, legally sound, and survivor-centric digital protection infrastructure.",
        title="Scalable Public Benefit Vision",
        style_type="green",
        width=487
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out = os.path.join(project_root, "public", "future_epics_and_rollouts", "Umkhuseli_Future_Epics_and_Rollouts_Final_MVP.pdf")
    build_pdf(out)
