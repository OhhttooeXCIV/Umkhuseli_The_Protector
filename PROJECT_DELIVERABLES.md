# Umkhuseli: The Protector (Sankofa Safe)
## Comprehensive Project Documentation & Team Submission

This document compiles the project deliverables:
1. **Executive Presentation Deck** (User Journey, Architecture, Demo Credentials)
2. **Lean Business Canvas**
3. **SSDL (Security Software Development Lifecycle) & POPIA Compliance**
4. **App Build & APK Generation Guide**

---

## 1. Executive Presentation Deck Summary

An interactive visual presentation deck is available directly in the project repository at:
**[`public/presentation_deck.html`](./public/presentation_deck.html)**

### Slide Deck Breakdown

#### Slide 1: Executive Overview
- **Project Name:** Umkhuseli: The Protector (*Sankofa Safe*)
- **Mission:** A dual-persona covert GBV emergency shield and legal evidence vault for South Africa, disguised as an innocent cultural proverbs launcher.
- **Core Pillars:** Stealth Camouflage (0ms panic exit), Life-Safety 72-hour Beacon (works with 0 airtime via SMS & USSD), and Court-Admissible Form 2 Legal Vault.

#### Slide 2: User Journey Story ("Naledi's Shield")
1. **Daily Normalcy:** Naledi uses her phone as normal. The phone runs "Sankofa Wisdom Launcher", showing Akan, Zulu, and Sotho proverbs. If an abusive partner inspects the device, no safety app is visible.
2. **Secret Entry & Logging:** In privacy, Naledi enters PIN `1234` or triple-taps the sacred Sankofa adinkra emblem. Biometric authentication (Fingerprint/Face) unlocks the Evidence Vault to log incidents with AES-256-GCM encryption.
3. **Emergency Escalation:** In imminent danger, Naledi taps the Quick-Access SOS trigger. A 3-second tactile countdown begins. If not cancelled, an emergency beacon with GPS coordinates, battery level, and Find My Device tracker link is sent via SMS and WhatsApp to her 5 ICE guardians.
4. **Instant Camouflage:** When someone approaches, pressing the hardware Back button or Top Shield Bar triggers a **0-millisecond camouflage wipe**, clearing decrypted text from memory and returning immediately to the launcher facade.

#### Slide 3: Technical Architecture
- **UI Layer:** Modern Jetpack Compose with edge-to-edge system styling, state-driven `SafetyTriggerOverlay` state machine (`Idle` → `Armed` → `Dispatched` / `Cancelled`).
- **Architecture Pattern:** MVVM with Clean Architecture.
- **Dependency Injection:** Centralized `AppContainer` providing injectable singletons across `ViewModelFactory`, Room DAOs, and Android hardware services.
- **Cryptographic Security:** AES-256-GCM backed by `AndroidKeyStore` master keys, preventing plaintext disk leakage.

#### Slide 4: Demo Credentials & Evaluation Details
- **Default In-App PIN:** `1234` or `0000`
- **Secret Gesture:** Triple-tap on the Sankofa Emblem on the Facade Launcher
- **Panic Exit Trigger:** Hardware back button or top red shield indicator
- **Pre-seeded ICE Contact:** Lerato Khubeka (`082 000 0001`)
- **Emergency Helpline Directory:**
  - GBV Command Centre: `0800 428 428` (Toll-free, 24/7)
  - SAPS Police Emergency: `10111`
  - Zero-Airtime USSD Callback: `*120*7867#`
  - TEARS Crisis USSD: `*134*7355#`
- **Academic Demo / CMS Student Logins:**
  - Ntula Otto Thoso (Lecturer/Student): `N5THOSO1` / `N5-N5THOSO1`
  - Tokelo Mokotjo (Lecturer/Student): `N5MOKOTJO1` / `N5-N5MOKOTJO1`
  - Refilwe Hlelisi (Student): `N5HLELISI1` / `N5-N5HLELISI1`

---

## 2. Lean Business Canvas (Team Page)

| Canvas Section | Strategy & Implementation Details |
|---|---|
| **1. Problem** | • Severe Gender-Based Violence (GBV) and femicide crisis in South Africa (femicide rate 5x global average).<br>• Abusive partners monitor survivor phones; standard safety apps provoke severe retaliatory violence.<br>• Victims struggle to obtain Magistrates Court Protection Orders due to lack of admissible, timestamped evidence.<br>• High data costs and poor connectivity in townships and rural areas render cloud-only apps useless. |
| **2. Customer Segments** | • **Primary:** Women and vulnerable individuals experiencing domestic abuse or intimate partner violence in South Africa.<br>• **Secondary:** University students, community activists, and healthcare workers traveling through high-risk corridors.<br>• **Partners:** Social workers at Thuthuzela Care Centres (TCC), SAPS Family Violence, Child Protection and Sexual Offences (FCS) units, and GBV NGOs (TEARS Foundation). |
| **3. Unique Value Proposition** | *"Safety without suspicion; evidence without leakage."*<br>A zero-trace, dual-persona Android platform combining everyday cultural utility (African proverbs launcher) with covert life-saving SOS dispatch and court-ready legal documentation compliant with the Domestic Violence Act. |
| **4. Solution** | • **Facade Disguise:** Fully functional Android launcher displaying daily proverbs.<br>• **Hardware Encrypted Vault:** On-device AES-256-GCM diary behind BiometricPrompt.<br>• **Zero-Airtime Emergency Lifelines:** USSD `*120*7867#` pings and automated SMS beacons with 72-hour live GPS location tracking.<br>• **Legal Statement Generator:** Auto-exports Form 2 Protection Order affidavits. |
| **5. Unfair Advantage** | • Deep contextual engineering for South Africa (zero-data policies, USSD integration, offline TCC directory for all 9 provinces).<br>• Proprietary 0ms camouflage transition that leaves no UI artifacts or recents trace.<br>• End-to-end alignment with South African legal standards (Form 2 & J88 medical exam prep). |
| **6. Channels** | • Discreet community referrals by TCC medical officers and court clerks.<br>• University campus safety programs and student union welfare offices.<br>• Integration with community health workers (CHWs) and local policing forums (CPFs).<br>• Offline APK sharing (Nearby Share / Bluetooth) in low-connectivity areas. |
| **7. Cost Structure** | • **Hosting / Backend:** Near $0 operational cost due to local-first Room database architecture.<br>• **Telecom:** Standard SMS/USSD zero-rated government lifelines.<br>• **Engineering & Maintenance:** Open-source Kotlin Jetpack Compose standard libraries. |
| **8. Revenue Streams** | • **Public Sector / Grant Funding:** Department of Social Development (DSD), Solidarity Fund, and corporate CSI safety grants.<br>• **Institutional Enterprise Licensing:** Custom enterprise safety white-label builds for universities, mining houses, and hospital networks. |
| **9. Key Metrics** | • **Camouflage Reliability:** 100% zero-trace instant exit success rate.<br>• **Emergency Dispatch Delivery:** &gt;99.5% delivery success of SOS SMS with location.<br>• **Protection Orders Granted:** Number of successful court applications supported by vault exports.<br>• **Network Readiness:** Percentage of users with &ge; 3 active ICE guardians configured. |

---

## 3. SSDL (Security Software Development Lifecycle) & Threat Model

The security model for Umkhuseli addresses an extreme adversary threat model: **Adversary in Physical Possession of the Device**.

### SSDL Phases & Implementation

```
[Requirements] ──> [Threat Modeling] ──> [Secure Design] ──> [Implementation] ──> [Verification] ──> [Deployment]
  POPIA & DV Act     Adversary-in-Hand    AES-GCM + StrongBox   No-Leak Memory      Static Analysis    R8 Obfuscation
```

#### Phase 1: Security Requirements & Compliance
- **POPIA (Protection of Personal Information Act):** All sensitive survivor data is stored strictly on-device (local-first). No external telemetry, advertising trackers, or unencrypted cloud backups.
- **Domestic Violence Act (Act 116 of 1998 / Act 14 of 2021):** Incident records adhere to court-mandated evidentiary standards (precise timestamps, perpetrator identification, damage assessment, SAPS OB numbers).

#### Phase 2: Threat Modeling (STRIDE & Physical Attack Vector)
- **Threat:** Abuser forces survivor to unlock phone or inspects recent apps.
- **Countermeasure:** The app identifies itself as `com.aistudio.sankofa.safe` with launcher category intents. The process name and recents screen appear identical to an innocent launcher. Decrypted state in `SankofaViewModel` is wiped in 0ms on back press.
- **Threat:** Memory dump or physical extraction of sqlite databases via ADB or root access.
- **Countermeasure:** Room database fields (`description`, `injuriesOrImpact`, `witnesses`) are encrypted with AES-256-GCM before database insertion. The raw database contains only base64 ciphertexts prefixed with `ENC:`.

#### Phase 3: Cryptographic Specifications
- **Master Key Generation:** Generated using `KeyGenerator` with `AndroidKeyStore` provider.
- **Key Parameters:** AES-256 algorithm, GCM block mode, NoPadding, 128-bit authentication tag.
- **Initialization Vectors (IV):** Cryptographically random 12-byte IV generated uniquely per encryption operation and prepended to the ciphertext payload.
- **Biometric Layer:** Integrated via `androidx.biometric.BiometricPrompt` requiring `BIOMETRIC_STRONG` or secure device credential.

#### Phase 4: Secure Implementation Rules
1. **Docstring & Comment Integrity:** All existing documentation and comments preserved.
2. **Network Policy Gating:** `NetworkPolicyHelper` disables unnecessary background data traffic on cellular/metered connections, honoring South African data constraints.
3. **Grace Period Verification:** 3-second tactile vibration countdown prevents accidental SOS transmission while maintaining rapid accessibility.

#### Phase 5: Verification & Hardening
- **ProGuard / R8 Rules:** Configured in `app/proguard-rules.pro` to obfuscate internal class and method names while safeguarding Room runtime entities and Biometric callers.
- **Resource Shrinking:** `isShrinkResources = true` strips unused drawables, assets, and layouts to minimize the binary footprint.

---

## 4. App Build & APK Generation

### Building the Debug APK
To compile the standalone APK package locally:

```bash
# 1. Clean previous build caches
./gradlew clean

# 2. Compile debug APK with optimizations
./gradlew assembleDebug
```

The compiled package will be generated at:
```
app/build/outputs/apk/debug/app-debug.apk
```

### Building the Release APK (R8 Minified)
```bash
./gradlew assembleRelease
```
The optimized and shrunk release APK will be located at:
```
app/build/outputs/apk/release/app-release.apk
```

---

## 5. Repository & Links
- **GitHub Repository:** [https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector](https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector)
- **Interactive Presentation Deck:** Available in repository root at `public/presentation_deck.html`
