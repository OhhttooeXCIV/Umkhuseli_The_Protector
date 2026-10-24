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
    story.append(Paragraph("Requirements Specification & Use Cases", styles['DocTitle']))
    story.append(Paragraph(
        "Product Requirements Document (PRD), Functional & Non-Functional Specifications, and Formal Use Cases • IEEE Std 830-1998 Aligned",
        styles['DocSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # 1. System Scope & Objectives
    story.append(Paragraph("1. System Scope & Objectives", styles['H1']))
    story.append(Paragraph(
        "Umkhuseli is a dual-persona Android and Web application designed to mitigate the acute physical risks faced by South African "
        "survivors of Gender-Based Violence (GBV). The software provides three core services: <b>1) Covert Disguise & Panic Camouflage</b>, "
        "<b>2) Hardware-Encrypted Legal Evidence Vault</b>, and <b>3) Zero-Latency / Zero-Airtime Emergency SOS Beaconing</b>. "
        "All requirements conform to the statutory standards of the <b>South African Domestic Violence Act (Act 116 of 1998, amended by Act 14 of 2021)</b> "
        "and the <b>Protection of Personal Information Act (POPIA Act 4 of 2013)</b>.",
        styles['Body']
    ))

    # 2. Functional Requirements
    story.append(Paragraph("2. Functional Requirements Matrix (FR)", styles['H1']))
    
    fr_data = [
        [
            Paragraph("<b>Req ID</b>", styles['TableHeader']),
            Paragraph("<b>Feature Module</b>", styles['TableHeader']),
            Paragraph("<b>Functional Specification & Acceptance Criteria</b>", styles['TableHeader']),
            Paragraph("<b>Priority</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>FR-01</b>", styles['TableTextBold']),
            Paragraph("Innocent Facade Launcher", styles['TableText']),
            Paragraph("System acts as a functional Android home launcher displaying daily African proverbs and launching installed apps without displaying any safety labels.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-02</b>", styles['TableTextBold']),
            Paragraph("Covert Safe Haven Triggers", styles['TableText']),
            Paragraph("System unlocks the Safe Haven via PIN (1234/0000) or triple-tap on the sacred Sankofa adinkra emblem, bypassing discovery.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-03</b>", styles['TableTextBold']),
            Paragraph("Biometric Hardware Gate", styles['TableText']),
            Paragraph("Integrates with Android BiometricPrompt (BIOMETRIC_STRONG) verifying Face, Fingerprint, or secure device PIN before vault entry.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-04</b>", styles['TableTextBold']),
            Paragraph("AES-256-GCM Evidence Diary", styles['TableText']),
            Paragraph("Encrypts descriptions, injuries, and witness statements at-rest in Room SQLite with AndroidKeyStore keys and unique 12-byte IVs.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-05</b>", styles['TableTextBold']),
            Paragraph("0ms Camouflage Panic Wipe", styles['TableText']),
            Paragraph("Pressing hardware Back or Top Shield instantly scrubs decrypted in-memory variables and returns to the proverbs launcher in 0 ms.", styles['TableText']),
            Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-06</b>", styles['TableTextBold']),
            Paragraph("Tactile SOS Grace Dispatcher", styles['TableText']),
            Paragraph("State machine executes 3-second tactile vibration countdown; user can cancel before dispatch to prevent false alarms.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-07</b>", styles['TableTextBold']),
            Paragraph("72-Hour GPS Beacon", styles['TableText']),
            Paragraph("Broadcasts live coordinates, battery percentage, charging state, handset model, and Find My Device tracker URL via SMS to 5 ICE contacts.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-08</b>", styles['TableTextBold']),
            Paragraph("Zero-Airtime Lifelines", styles['TableText']),
            Paragraph("One-touch links to SAPS 10111, toll-free GBVCC 0800 428 428, and zero-rated USSD callback pings (*120*7867# / *134*7355#).", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-09</b>", styles['TableTextBold']),
            Paragraph("Thuthuzela Care Directory", styles['TableText']),
            Paragraph("Offline-cached directory of accredited TCC forensic centers covering all 9 SA provinces with calling and navigation coordinates.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-10</b>", styles['TableTextBold']),
            Paragraph("Form 2 Protection Dossier", styles['TableText']),
            Paragraph("Compiles timestamped incidents into South African Form 2 affidavits with Section 4(2) safe address withholding right.", styles['TableText']),
            Paragraph("<font color='#059669'><b>MANDATORY</b></font>", styles['TableText'])
        ],
        [
            Paragraph("<b>FR-11</b>", styles['TableTextBold']),
            Paragraph("Duress PIN Deception (9999)", styles['TableText']),
            Paragraph("When coerced, entering PIN 9999 displays an authentic municipal electricity recharge voucher while silently dispatching SOS telemetry.", styles['TableText']),
            Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", styles['TableText'])
        ]
    ]

    t_fr = Table(fr_data, colWidths=[45, 110, 262, 70])
    t_fr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_fr)
    story.append(Spacer(1, 14))

    # 3. Non-Functional Requirements
    story.append(Paragraph("3. Non-Functional Requirements Matrix (NFR)", styles['H1']))

    nfr_data = [
        [
            Paragraph("<b>NFR ID</b>", styles['TableHeader']),
            Paragraph("<b>Dimension</b>", styles['TableHeader']),
            Paragraph("<b>Standard / Metric</b>", styles['TableHeader']),
            Paragraph("<b>Implementation Architecture</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>NFR-01</b>", styles['TableTextBold']),
            Paragraph("Camouflage Latency", styles['TableText']),
            Paragraph("&le; 0 ms perceptual delay on panic exit; 0 traces in task manager.", styles['TableText']),
            Paragraph("Synchronous ViewModel state wipe; no window transitions.", styles['TableText'])
        ],
        [
            Paragraph("<b>NFR-02</b>", styles['TableTextBold']),
            Paragraph("Cryptographic Strength", styles['TableText']),
            Paragraph("256-bit AES-GCM; authenticated encryption with 128-bit MAC.", styles['TableText']),
            Paragraph("Hardware StrongBox / TEE via AndroidKeyStore.", styles['TableText'])
        ],
        [
            Paragraph("<b>NFR-03</b>", styles['TableTextBold']),
            Paragraph("Data Privacy (POPIA)", styles['TableText']),
            Paragraph("Zero third-party trackers; local-first storage; zero cloud leakage.", styles['TableText']),
            Paragraph("Pure local Room SQLite with offline-first client architecture.", styles['TableText'])
        ],
        [
            Paragraph("<b>NFR-04</b>", styles['TableTextBold']),
            Paragraph("Zero-Data Availability", styles['TableText']),
            Paragraph("100% core life-safety features operational with R0.00 data / airtime.", styles['TableText']),
            Paragraph("SAPS 10111, GBVCC toll-free line, and zero-rated USSD *120*7867#.", styles['TableText'])
        ],
        [
            Paragraph("<b>NFR-05</b>", styles['TableTextBold']),
            Paragraph("Platform Support", styles['TableText']),
            Paragraph("Android 7.0 (API 24) through Android 16 (API 36); responsive Web PWA.", styles['TableText']),
            Paragraph("Jetpack Compose BOM + TypeScript React 19.", styles['TableText'])
        ]
    ]

    t_nfr = Table(nfr_data, colWidths=[50, 95, 172, 170])
    t_nfr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_nfr)
    story.append(Spacer(1, 14))

    # 4. Formal Use Cases
    story.append(Paragraph("4. Core Formal Use Cases", styles['H1']))

    use_cases = [
        ("UC-01: Covert Safe Haven Unlock & Biometric Challenge",
         "<b>Actors:</b> Survivor (Primary)<br>"
         "<b>Preconditions:</b> App running in proverbs facade launcher mode.<br>"
         "<b>Trigger:</b> User enters secret PIN 1234 or triple-taps the sacred Sankofa adinkra emblem.<br>"
         "<b>Main Flow:</b> 1. Launcher captures trigger sequence without audio/visual feedback. 2. Prompts BiometricPrompt challenge. 3. User authenticates via Fingerprint or Face. 4. Master key retrieved from AndroidKeyStore. 5. Safe Haven screen rendered with encrypted vault diary.<br>"
         "<b>Alternative Flow:</b> If duress PIN 9999 entered, execute UC-07 (Duress Deception & Silent Dispatch).<br>"
         "<b>Postconditions:</b> Vault unlocked; memory session active."),

        ("UC-02: Armed SOS Emergency Distress Broadcast",
         "<b>Actors:</b> Survivor, ICE Guardians (5 contacts), SAPS Emergency Flying Squad<br>"
         "<b>Preconditions:</b> At least one active ICE guardian configured with mobile number.<br>"
         "<b>Trigger:</b> User presses Emergency SOS button.<br>"
         "<b>Main Flow:</b> 1. SafetyTriggerViewModel transitions to Armed state. 2. 3-second tactile countdown begins with distinct haptic pulses. 3. Grace timer expires. 4. Device queries last known GPS coordinates and battery telemetry. 5. Persists distress incident to Room DB. 6. Transmits 72-hour beacon SMS to all active guardians.<br>"
         "<b>Alternative Flow:</b> User taps Cancel during 3-second countdown; state resets to Cancelled; no SMS sent.<br>"
         "<b>Postconditions:</b> SOS dispatched; incident logged to legal vault."),

        ("UC-03: 0-Millisecond Panic Camouflage Scrub",
         "<b>Actors:</b> Survivor, Threat Actor (Physical Inspector)<br>"
         "<b>Preconditions:</b> Safe Haven vault is actively open.<br>"
         "<b>Trigger:</b> User presses hardware Back button, recents key, or top panic bar.<br>"
         "<b>Main Flow:</b> 1. Back handler intercepts event synchronously. 2. In-memory decrypted strings and cryptographic pointers zeroed immediately. 3. Facade proverbs launcher instantly displayed in 0 ms. 4. Recents task thumbnail blanked.<br>"
         "<b>Postconditions:</b> No safety traces present; device displays innocent cultural proverbs launcher.")
    ]

    for title, body in use_cases:
        story.append(Paragraph(f"<b>{title}</b>", styles['BodyBold']))
        story.append(Paragraph(body, styles['Bullet']))
        story.append(Spacer(1, 6))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    out = r"C:\Users\thoso\Sankofa_mvp\Umkhuseli_The_Protector\public\requirements_and_use_cases\Umkhuseli_Requirements_and_Use_Cases.pdf"
    build_pdf(out)
