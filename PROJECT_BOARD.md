# Umkhuseli: The Protector — Final Project Roadmap & Kanban Board

> **Live Project Tracking, Multi-Platform Architecture, and FNBAOTY Mentor Feedback Alignment Matrix**  
> *Target Version: 2.4.0-PROD | Hackathon MVP Scope: 5 Definitive Core Features*  
> *Dual-Persona Covert GBV Response & Court-Admissible Evidence Vault for South Africa*

---

## 1. FNBAOTY Mentor Feedback Alignment Matrix

This roadmap incorporates the guidance provided by the First National Bank App of the Year (FNBAOTY) hackathon mentors:

| Mentor Guidance & Risk Vector | Mentor Recommendation | Umkhuseli 2.4.0 Production Architecture Response |
|---|---|---|
| **Scope Overload** | *"Narrow the scope and prioritise a small number of features that you can demonstrate reliably during the hackathon."* | **Locked to 5 Definitive Core Features**: Chameleon Camouflage, ECTA Evidence Vault, Loadshedding Emergency Dispatch, Form 2 Court Prep, and 72-Hour TCC Navigator. All other 7 features re-allocated to Future Horizons. |
| **Competitor Differentiation** | *"Conduct a competitor analysis of existing GBV response applications... identify what gaps remain."* | **Covert Decoy vs Overt Panic Apps**: Unlike Namola, Bright Sky SA, or Tears Foundation (which place dangerous branded icons on phones), Umkhuseli delivers authentic disguises (*PowerCal SA* & Wisdom Launcher), offline resilience during Stage 6 loadshedding, and Section 15 ECTA court alignment. |
| **Safety & Forensic Traces** | *"A hidden interface or panic-close cannot guarantee that an abusive person will not discover the app... deleting local files does not remove all traces."* | **Multi-Platform Zero-Trace Architecture**: For survivors facing intense device inspection, the **Web PWA on Vercel** runs in private/incognito browser mode leaving **zero Google Play or Apple App Store download history**, no battery/data usage entries, and no system launcher icons. |
| **Legal Admissibility** | *"Encrypted evidence, timestamps and location data do not automatically make records legally admissible."* | **Section 15 ECTA Alignment**: We do NOT claim "guaranteed court admissibility". The vault generates tamper-evident, SHA-256 hashed **contemporaneous records** designed under Section 15 of the Electronic Communications and Transactions Act (Act 25 of 2002) to corroborate sworn affidavits and J88 clinical notes. |
| **AI Protection Orders** | *"AI-generated protection-order statements should be reviewed against current legal requirements and by appropriate experts."* | **Structured Intake Assistant (Not Unchecked AI)**: Maps survivor statements directly to statutory sections of **Form 2 (Domestic Violence Act 116 of 1998 / Act 14 of 2021)** for review by Magistrates Court clerks, with clear legal disclaimers. |

---

## 2. Multi-Platform Deployment & Disguise Strategy

```
                                  ┌──────────────────────────────────────────────┐
                                  │      UMKHUSELI MULTI-PLATFORM SUITE          │
                                  └──────────────────────────────────────────────┘
                                                         │
                        ┌────────────────────────────────┴────────────────────────────────┐
                        ▼                                                                 ▼
         ┌──────────────────────────────┐                                  ┌──────────────────────────────┐
         │     Native Android APK       │                                  │      Web SPA (Vercel)        │
         └──────────────────────────────┘                                  └──────────────────────────────┘
                        │                                                                 │
         ┌──────────────┴──────────────┐                                                  ▼
         ▼                             ▼                                   ┌──────────────────────────────┐
  [Disguise Mode A]             [Disguise Mode B]                          │  PowerCal SA (PWA & iOS)     │
  Sankofa Wisdom Launcher       PowerCal SA App Decoy                      • Zero App Store trace         │
  • Full system launcher        • Municipal prepaid electricity            • Incognito browser safe       │
  • Daily African proverbs      • Real Eskom / City Power tariffs          • Safari Add to Home Screen    │
  • Neutral app drawer          • 20-digit STS token generator             • WebCrypto AES-256-GCM        │
  • Proverb secret tap gesture  • Equation trigger (1234=)                 • Duress PIN 9999              │
```

---

## 3. The Definitive 5-Feature Hackathon MVP (Production Baseline)

The hackathon demonstration focuses exclusively on executing these 5 features with 100% reliability:

```mermaid
kanban
  5-Feature MVP Baseline (Verified)
    [FEAT-01] Chameleon Disguise Engine (Launcher + PowerCal SA)
    [FEAT-02] ECTA Section 15 Tamper-Evident Evidence Vault
    [FEAT-03] Loadshedding-Resilient Emergency Dispatch & Duress 9999
    [FEAT-04] Statutory Form 2 DVA Court Preparation Pack
    [FEAT-05] Offline 9-Province Thuthuzela Care Centre (TCC) Directory
  Review & Live Pitch Rehearsal
    [QA-01] 3-Minute Live Hackathon Demo Run-Sheet
    [QA-02] ECTA Sec 15 Disclaimers in Safe Haven UI
    [QA-03] Android 14+ Doze Mode Background Location Service
  Future Horizons: Horizon 1 (Phase 2)
    [H1-01] Safe Journey E-Hailing Corridor Sentinel
    [H1-02] Audio Sentry Ambient Acoustic Distress Classifier
    [H1-03] Direct Carrier VAS Airtime & Data Tokens
  Future Horizons: Horizon 2 (Phase 3)
    [H2-01] OPRF PSI Private Set Intersection Contact Discovery
    [H2-02] Touched by an Angel Citizen First-Responder KYC Network
    [H2-03] P2P Wi-Fi Direct Covert Mesh Share
    [H2-04] Ward-Level Geofenced Community Forum
```

---

## 4. Feature Specifications: 5 MVP Features vs Future Horizons

### 🟢 The 5 MVP Features (Hackathon Core Delivery)

| Feature ID | Feature Name | Core Functionality & SA Value-Add | Verification Artifact |
|---|---|---|---|
| **FEAT-01** | **Chameleon Disguise Engine & 0ms Exit** | Dual Android disguises (Wisdom Launcher + PowerCal SA Decoy) and Vercel PWA for iOS/Web. Instant memory wipe on Back/Panic. | `LauncherFacadeScreen.kt`, `MunicipalPrepaidCalculator.kt`, `MunicipalPrepaidCalculator.tsx` |
| **FEAT-02** | **ECTA Section 15 Evidence Vault** | Local AES-256-GCM encrypted incident logging with SHA-256 cryptographic hash chaining for contemporaneous legal corroboration. | `VaultEncryptionHelper.kt`, `EvidenceVaultSection.kt`, `crypto.test.ts` |
| **FEAT-03** | **Loadshedding SOS & Duress Flow** | Duress PIN `9999` masquerading as a meter voucher receipt while secretly dispatching emergency beacons. Offline SMS/GPS fallback for tower blackouts. | `EmergencyDispatchHelper.kt`, `EmergencySosSection.kt`, `offlineOutbox.ts` |
| **FEAT-04** | **Statutory Form 2 DVA Court Pack** | Structured affidavit generator mapping vault incidents into the official Domestic Violence Act Form 2 format for Magistrates Court clerks. | `Form2RecordViewer.kt`, `PdfPrintHelper.kt`, `ectaSection15Pdf.ts` |
| **FEAT-05** | **Offline 9-Province TCC & PEP Navigator** | Complete preloaded offline directory of all public Thuthuzela Care Centres across SA with critical 72-hour HIV PEP & J88 clinical guidelines. | `ThuthuzelaRepository.kt`, `ThuthuzelaSection.kt`, `TccData.kt` |

---

### ⚪ Future Horizons (Post-Hackathon Engineering Roadmap)

These features have foundational codebase components already implemented in the repository, and are scheduled for post-hackathon rollouts:

#### Horizon 1: Immediate Field Expansion (Phase 2)
1. **Safe Journey E-Hailing & Taxi Sentinel (`SafeJourneyManager.kt`)**: Cross-track corridor deviation monitoring for Bolt, Uber, and minibus taxi rides with dead-man's switch escalation.
2. **Audio Sentry Acoustic Distress Classifier (`audioSentryService.ts`)**: Local on-device decibel spike and screaming frequency classifier using circular audio buffers.
3. **Direct Carrier VAS Reverse-Billing (`CarrierDetectionManager.kt`)**: Zero-rated USSD carrier integration with Vodacom, MTN, Telkom, and Cell C for zero-airtime emergency reverse-billing.

#### Horizon 2: Community & Ecosystem Scaling (Phase 3)
4. **OPRF PSI Private Contact Discovery**: 2-Hash Elliptic Curve Diffie-Hellman Oblivious PRF over Curve25519 preventing phone number rainbow table attacks across South African MSISDN ranges.
5. **'Touched by an Angel' Citizen First-Responder Network (`GuardianResponderSection.kt`)**: Proximity-based radial dispatch algorithm paired with 3-tier KYC (DHA ID check, biometric liveness, SAPS police clearance certificate).
6. **Peer-to-Peer Wi-Fi Direct Mesh Share (`WifiDirectShareManager.kt`, `CovertNearbyShareSection.kt`)**: Offline APK distribution between community health workers without internet connectivity.
7. **Pseudonymous Community Safety Circles**: PostGIS ward-level localized forums with monthly rotating cryptographic pseudonyms.

---

## 5. South African Competitor Analysis & Positioning

| Dimension | Standard Safety Apps (Namola, MySOS) | GBV Portals (Bright Sky, Tears Foundation) | Umkhuseli: The Protector (Sankofa Safe) |
|---|---|---|---|
| **Threat Vector** | Overt panic button; visible icon alerts abuser | Branded GBV portal; immediate suspicion if discovered | **Chameleon Decoy**: Authentic municipal calculator or cultural launcher |
| **App Store Footprint** | Installed via App Store / Play Store | Installed via App Store / Play Store | **Multi-Platform**: Android native + Zero-install Vercel PWA for zero download traces |
| **Loadshedding Handling** | Fails or degrades when LTE cell towers lose battery | Requires active mobile internet bundle | **Offline-First**: Local Room/WebCrypto vault, SMS/USSD fallback, cached TCC directory |
| **Legal Admissibility** | Simple GPS breadcrumbs | Generic educational advice | **ECTA Section 15**: SHA-256 contemporaneous hash chain & Form 2 statutory preparation pack |
| **Post-Assault Care** | Alerts dispatchers only | Basic hotline directory | **72-Hour TCC Navigator**: Comprehensive PEP and J88 clinical exam guides across all 9 provinces |

---

## 6. Definition of Done (DoD) for Hackathon Demo

1. **Failure-Proof Demo**: All 5 MVP features execute without network dependencies, crashes, or unhandled exceptions.
2. **Camouflage Invariance**: The Safe Haven leaves no UI traces in recents, notifications, or task switchers.
3. **Forensic Integrity**: Memory wiped within 0 ms on Back press; no plaintext persisted to disk.
4. **Legal Realism**: UI transparently frames Form 2 outputs as preparatory drafting dossiers, requiring clerk/social worker review.
5. **Loadshedding Demonstration**: The SOS flow gracefully queues to offline outbox if airplane mode is engaged.
