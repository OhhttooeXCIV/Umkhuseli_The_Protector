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
    story.append(Paragraph("UML Diagrams & System Architecture", styles['DocTitle']))
    story.append(Paragraph(
        "Enterprise Clean Architecture, State Machine Specifications, Sequence Flows & Entity Data Models • Android Jetpack & Hardware Keystore",
        styles['DocSubtitle']
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # 1. Architectural Philosophy
    story.append(Paragraph("1. Architectural Overview & Clean Architecture", styles['H1']))
    story.append(Paragraph(
        "Umkhuseli follows the official Android Enterprise Clean Architecture standard, structured into strictly decoupled layers: "
        "<b>UI (Presentation)</b>, <b>Domain / ViewModel</b>, <b>Dependency Injection (AppContainer)</b>, and <b>Data / Hardware Services</b>. "
        "To ensure zero overhead, deterministic initialization, and instant 0ms memory scrubbing, the application uses a <b>Manual DI Container</b> "
        "(<code>AppContainer</code>) instead of heavyweight reflection-based injection frameworks.",
        styles['Body']
    ))

    # Architecture Layers Table
    arch_layers = [
        [
            Paragraph("<b>Architecture Layer</b>", styles['TableHeader']),
            Paragraph("<b>Primary Components</b>", styles['TableHeader']),
            Paragraph("<b>Key Responsibilities & Technologies</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<b>Presentation / UI Layer</b>", styles['TableTextBold']),
            Paragraph("<code>MainActivity</code><br/><code>LauncherFacadeScreen</code><br/><code>SafeHavenScreen</code><br/><code>SafetyTriggerOverlay</code>", styles['TableText']),
            Paragraph("Declarative Jetpack Compose UI; renders African proverbs facade, biometric Safe Haven, and panic overlay state machine. Zero XML.", styles['TableText'])
        ],
        [
            Paragraph("<b>Domain & ViewModel Layer</b>", styles['TableTextBold']),
            Paragraph("<code>SafetyTriggerViewModel</code><br/><code>SankofaViewModel</code><br/><code>ViewModelFactory</code>", styles['TableText']),
            Paragraph("Manages UI StateFlow streams; orchestrates 3-second SOS grace period countdown, duress PIN flows, and incident sorting/filtering.", styles['TableText'])
        ],
        [
            Paragraph("<b>Dependency Injection</b>", styles['TableTextBold']),
            Paragraph("<code>AppContainer</code><br/><code>SankofaApplication</code>", styles['TableText']),
            Paragraph("Singleton manual DI container; provides thread-safe access to Room DB, AndroidKeyStore crypto helpers, and dispatch services.", styles['TableText'])
        ],
        [
            Paragraph("<b>Data & Persistence Layer</b>", styles['TableTextBold']),
            Paragraph("<code>AppDatabase</code><br/><code>IncidentDao</code><br/><code>GuardianDao</code><br/><code>UserProfileDao</code>", styles['TableText']),
            Paragraph("Room SQLite persistence; stores encrypted incident narratives, trusted ICE guardians, and statutory Section 4 complainant profile.", styles['TableText'])
        ],
        [
            Paragraph("<b>Hardware & Security Layer</b>", styles['TableTextBold']),
            Paragraph("<code>VaultEncryptionHelper</code><br/><code>EmergencyService</code><br/><code>EmergencyDispatchHelper</code>", styles['TableText']),
            Paragraph("AndroidKeyStore 256-bit AES-GCM StrongBox keys, BiometricPrompt, LocationManager GPS queries, SmsManager broadcasts, and Vibrator.", styles['TableText'])
        ]
    ]

    t_arch = Table(arch_layers, colWidths=[120, 140, 227])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 14))

    # 2. State Machine: SOS Lifecycle
    story.append(Paragraph("2. UML State Machine: Emergency SOS Signal Lifecycle", styles['H1']))
    story.append(Paragraph(
        "The emergency dispatch system operates as a finite state machine implemented via <code>SafetySignalState</code> sealed interface. "
        "State transitions guarantee tactile feedback on countdown ticks and atomic persistence to Room DB on dispatch:",
        styles['Body']
    ))

    state_transitions = [
        [
            Paragraph("<b>Source State</b>", styles['TableHeader']),
            Paragraph("<b>Transition Event</b>", styles['TableHeader']),
            Paragraph("<b>Target State</b>", styles['TableHeader']),
            Paragraph("<b>System Actions & Side Effects</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<code>[Idle]</code>", styles['TableTextBold']),
            Paragraph("<code>armQuickAccessSos(3)</code>", styles['TableText']),
            Paragraph("<code>[Armed(sec=3)]</code>", styles['TableTextBold']),
            Paragraph("Launches countdown coroutine; triggers initial haptic vibration pulse.", styles['TableText'])
        ],
        [
            Paragraph("<code>[Armed(sec>0)]</code>", styles['TableTextBold']),
            Paragraph("1-second tick (sec &ge; 1)", styles['TableText']),
            Paragraph("<code>[Armed(sec=sec-1)]</code>", styles['TableTextBold']),
            Paragraph("Updates countdown state; pulses vibrator for tactile confirmation.", styles['TableText'])
        ],
        [
            Paragraph("<code>[Armed]</code>", styles['TableTextBold']),
            Paragraph("<code>cancelArmedSos()</code>", styles['TableText']),
            Paragraph("<code>[Cancelled]</code>", styles['TableTextBold']),
            Paragraph("Cancels coroutine; prevents SMS dispatch; returns to idle upon user acknowledgement.", styles['TableText'])
        ],
        [
            Paragraph("<code>[Armed]</code>", styles['TableTextBold']),
            Paragraph("Countdown reaches 0", styles['TableText']),
            Paragraph("<code>[Dispatched]</code>", styles['TableTextBold']),
            Paragraph("Fetches GPS coordinates; persists IncidentEntity; broadcasts 72-hr beacon SMS to 5 guardians.", styles['TableText'])
        ],
        [
            Paragraph("<code>[Idle / Armed]</code>", styles['TableTextBold']),
            Paragraph("<code>triggerInstantSos()</code>", styles['TableText']),
            Paragraph("<code>[Dispatched]</code>", styles['TableTextBold']),
            Paragraph("Bypasses countdown; immediately persists emergency incident and fires guardian SMS broadcast.", styles['TableText'])
        ]
    ]

    t_states = Table(state_transitions, colWidths=[90, 115, 105, 177])
    t_states.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_states)
    story.append(Spacer(1, 14))

    # 3. Sequence Flows
    story.append(Paragraph("3. UML Sequence Flows", styles['H1']))

    story.append(Paragraph("Sequence 1: Safe Haven Entry & Biometric Decryption", styles['H2']))
    story.append(Paragraph(
        "<b>Actor:</b> Survivor &bull; <b>Components:</b> <code>LauncherFacade</code> &rarr; <code>SankofaViewModel</code> &rarr; <code>BiometricPrompt</code> &rarr; <code>VaultEncryptionHelper</code> &rarr; <code>Room DB</code><br/>"
        "1. Survivor inputs PIN <code>1234</code> or triple-taps Sankofa emblem on home launcher.<br/>"
        "2. <code>LauncherFacade</code> notifies <code>SankofaViewModel</code> without rendering audio/visual alert.<br/>"
        "3. <code>BiometricPrompt</code> prompts biometric challenge; user provides verified fingerprint.<br/>"
        "4. <code>VaultEncryptionHelper</code> accesses <code>sankofa_vault_master_key</code> from AndroidKeyStore.<br/>"
        "5. <code>IncidentDao.getAllIncidents()</code> queries encrypted ciphertexts from Room SQLite.<br/>"
        "6. <code>VaultEncryptionHelper.decrypt()</code> initializes AES-256-GCM cipher with record's 12-byte IV.<br/>"
        "7. Decrypted victim narratives and J88 clinical notes are rendered inside <code>SafeHavenScreen</code>.",
        styles['Bullet']
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Sequence 2: 0-Millisecond Panic Camouflage Scrub", styles['H2']))
    story.append(Paragraph(
        "<b>Actor:</b> Survivor / Approaching Intruder &bull; <b>Components:</b> <code>Hardware Back Key</code> &rarr; <code>BackHandler</code> &rarr; <code>SankofaViewModel</code> &rarr; <code>RAM</code> &rarr; <code>UI</code><br/>"
        "1. Intruder approaches; survivor presses hardware Back button or Top Shield Bar.<br/>"
        "2. Android <code>BackHandler</code> intercepts event synchronously (0 ms latency).<br/>"
        "3. <code>SankofaViewModel.resetToCamouflage()</code> zeroes plaintext memory references and resets UI StateFlow to Idle.<br/>"
        "4. Compose recomposes directly to <code>LauncherFacadeScreen</code> (African proverbs display).<br/>"
        "5. Android task thumbnail is sanitized, leaving zero visual traces in the Recent Apps switcher.",
        styles['Bullet']
    ))
    story.append(Spacer(1, 14))

    # 4. Class Diagram & Data Entities
    story.append(Paragraph("4. UML Class Diagram: Data Entities & DAO Relationships", styles['H1']))

    entities_data = [
        [
            Paragraph("<b>Entity / Class</b>", styles['TableHeader']),
            Paragraph("<b>Key Fields & Types</b>", styles['TableHeader']),
            Paragraph("<b>Statutory / Legal Purpose & Methods</b>", styles['TableHeader'])
        ],
        [
            Paragraph("<code>IncidentEntity</code><br/>(Room Table: <i>incidents</i>)", styles['TableTextBold']),
            Paragraph("<code>id: Long</code><br/><code>timestamp: Long</code><br/><code>incidentType: String</code><br/><code>severityLevel: Int (1-5)</code><br/><code>perpetrator: String</code><br/><code>policeObNumber: String</code><br/><code>description: String (ENC)</code><br/><code>injuriesOrImpact: String (ENC)</code>", styles['TableText']),
            Paragraph("Court-admissible incident log compliant with Domestic Violence Act Form 2 affidavit requirements. Sensitive narrative fields encrypted via AES-256-GCM.", styles['TableText'])
        ],
        [
            Paragraph("<code>GuardianEntity</code><br/>(Room Table: <i>guardians</i>)", styles['TableTextBold']),
            Paragraph("<code>id: Long</code><br/><code>name: String</code><br/><code>surname: String</code><br/><code>mobileNumber1: String</code><br/><code>hasWhatsAppAccess: Boolean</code><br/><code>isPrimary: Boolean</code><br/><code>instagramHandle: String</code><br/><code>tiktokHandle: String</code>", styles['TableText']),
            Paragraph("Trusted Emergency ICE Guardian registry. Stores primary/secondary contacts and social handles for multi-channel live beacon alerts.", styles['TableText'])
        ],
        [
            Paragraph("<code>UserProfileEntity</code><br/>(Room Table: <i>user_profile</i>)", styles['TableTextBold']),
            Paragraph("<code>id: Long = 1L</code><br/><code>fullLegalNames: String</code><br/><code>idOrPassportNumber: String</code><br/><code>safeContactNumber: String</code><br/><code>safeServiceAddress: String</code><br/><code>isAddressWithheld: Boolean</code><br/><code>digitalSignatureBase64: String</code><br/><code>duressPin: String = '9999'</code>", styles['TableText']),
            Paragraph("Section 4 Domestic Violence Act Complainant Profile. Stores statutory legal particulars and Section 4(2) residential address withholding toggle for court protection.", styles['TableText'])
        ]
    ]

    t_entities = Table(entities_data, colWidths=[120, 160, 207])
    t_entities.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SURFACE_ELEVATED),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, LIGHT_BG])
    ]))
    story.append(t_entities)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    out = r"C:\Users\thoso\Sankofa_mvp\Umkhuseli_The_Protector\public\uml_and_architecture\Umkhuseli_UML_and_System_Architecture.pdf"
    build_pdf(out)
