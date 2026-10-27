# Umkhuseli: The Protector (Sankofa Safe) — Release Log & Governance Demarcation

---

## 🏛️ Executive Release & Governance Notice

> [!IMPORTANT]
> ### FNB App of the Year 2026 (FNB_AOTY_2026) Hackathon Baseline: Version 2.5.0
> **Release `v2.5.0` (Git Tag: `v2.5.0` / `FNB_AOTY_2026_MVP`) represents the official, frozen, and complete Hackathon MVP submission for the First National Bank App of the Year 2026 (FNB AOTY 2026).**
>
> 1. **14-Day Limited Public Evaluation Window**:
>    This repository (`https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector`) is made publicly visible for a strictly limited duration of **fourteen (14) calendar days** (commencing October 27, 2026 through November 10, 2026). This public availability is granted **strictly and exclusively for FNB AOTY 2026 adjudicators, judges, mentors, technical evaluators, and accredited Hackathon stakeholders**.
>
> 2. **Permitted Intended Purpose ONLY**:
>    Access, review, inspection, and verification of this repository and release `v2.5.0` are permitted **SOLELY for the intended purpose of the FNB AOTY 2026 Hackathon evaluation and scoring**. Any extraction, reproduction, commercial exploitation, redistribution, reverse engineering, or unauthorized distribution of this codebase outside the formal judging process of FNB AOTY 2026 is strictly prohibited.
>
> 3. **Proprietary Ownership & Intellectual Property Reservation**:
>    **Outside the specific construct and evaluation of the FNB AOTY 2026 Hackathon, Full Ownership, Intellectual Property (IP), Proprietary Architecture, Trade Secrets, and Commercial Rights are unconditionally reserved and retained by Sankofa Digital.**
>
> 4. **Release `v2.6.0` (Latest) — Sankofa Digital Commercial Continuation on Private Repository**:
>    **Version `v2.6.0` (Latest)** constitutes **Sankofa Digital's independent continuation and active commercialization** of the Umkhuseli platform. In accordance with enterprise data protection standards and commercial IP boundaries, `v2.6.0` (and all subsequent releases) is maintained and hosted on a **separate, private proprietary repository**. The private repository tags `v2.6.0` as its release and directly references this public repository as its upstream baseline, which **officially and permanently concludes at `v2.5.0`**.

---

## 🏷️ Release Demarcation Matrix

| Release Tag | Target Audience / Destination | Repository Type | Access Window | Legal & IP Governance |
|---|---|---|---|---|
| **`v2.5.0`** *(Current)*<br>`FNB_AOTY_2026_MVP` | **FNB App of the Year 2026**<br>Hackathon Judges, Mentors & Stakeholders | **Public Repository**<br>(Current Repo) | **14 Calendar Days Only**<br>*(October 27 – November 10, 2026)* | Limited Hackathon Evaluation License.<br>**Full IP & Ownership reserved by Sankofa Digital**. |
| **`v2.6.0`** *(Latest)* | **Sankofa Digital Enterprise**<br>Commercial Continuation & Scaling | **Private Repository**<br>(Proprietary Sankofa Digital Repo) | **Permanent / Closed**<br>(Sankofa Digital Internal & Enterprise Partners) | **100% Proprietary & Confidential**.<br>References public upstream repo ending at `v2.5.0`. |

---

## 📋 Table of Contents

1. [Executive Release & Governance Notice](#️-executive-release--governance-notice)
2. [Release Demarcation Matrix](#-release-demarcation-matrix)
3. [Release v2.5.0 — FNB AOTY 2026 Final MVP (Public Baseline)](#-release-v250--fnb-aoty-2026-final-mvp-public-baseline)
   - [Overview & Verification Scope](#overview--verification-scope)
   - [The 5 Definitive MVP Features Delivered](#the-5-definitive-mvp-features-delivered)
   - [Quality Assurance & Automated Test Results](#quality-assurance--automated-test-results)
   - [Legal Compliance & Evidentiary Certifications](#legal-compliance--evidentiary-certifications)
4. [Release v2.6.0 (Latest) — Sankofa Digital Continuation (Private Repository)](#-release-v260-latest--sankofa-digital-continuation-private-repository)
   - [Commercial Rationale & Enterprise Architecture](#commercial-rationale--enterprise-architecture)
   - [Private Repository Lineage & Upstream Reference](#private-repository-lineage--upstream-reference)
   - [Advanced Feature Roadmap in v2.6.0+](#advanced-feature-roadmap-in-v260)
   - [Private Forking & Ingestion Instructions](#private-forking--ingestion-instructions)
5. [Complete Release History (v1.0.0 – v2.5.0)](#-complete-release-history-v100--v250)
6. [Terms of Evaluation & Intellectual Property Declaration](#-terms-of-evaluation--intellectual-property-declaration)

---

## 🏆 Release v2.5.0 — FNB AOTY 2026 Final MVP (Public Baseline)

### Overview & Verification Scope
- **Git Commit SHA**: `080a2136c228c903ca3d5fe5188eed774d83a237`
- **Release Tags**: `v2.5.0`, `FNB_AOTY_2026_MVP`
- **Target Event**: First National Bank App of the Year 2026 (FNB AOTY 2026)
- **Publication Date**: October 27, 2026
- **Public Visibility Window**: 14 Days (Strictly for FNB AOTY 2026 stakeholders)
- **Platforms Verified**:
  - Native Android (API 24 to API 36, Android 7.0 through Android 15)
  - Progressive Web App (React 18, Vite, Tailwind CSS, Safari/Chrome/Edge mobile & desktop)

### The 5 Definitive MVP Features Delivered

Following formal consultation with FNB App of the Year hackathon mentors, the scope of release `v2.5.0` was laser-focused on 5 mission-critical, field-proven capabilities engineered for South African conditions:

#### 1. Chameleon Camouflage & 0-Millisecond Panic Exit
- **Dual-Persona Disguises**:
  - *Native Android*: **Sankofa Wisdom Launcher** (Akan, Zulu, and Sotho proverbs with authentic app drawer) and **PowerCal SA** (Municipal Prepaid Electricity Calculator).
  - *Web PWA*: **PowerCal SA** (Eskom and City Power Incline Block Tariffs with STS voucher generator). Operates incognito with **zero Google Play Store or Apple App Store footprint**.
- **0ms Instant Memory Scrub**:
  - Synchronous RAM zeroing on hardware Back press, Escape key, or top panic emblem.
  - Purges all decrypted memory buffers, keystores, and DOM nodes in <10ms without recents snapshot artifacts.
  - Task-switcher snapshot blur prevents visual capture during app backgrounding.

#### 2. ECTA Section 15 Tamper-Evident Evidence Vault
- **Cryptographic Integrity**:
  - Authenticated encryption via AES-256-GCM with hardware-backed master keys residing in `AndroidKeyStore`.
  - Android StrongBox Hardware Security Module (HSM) prioritization (`setIsStrongBoxBacked(true)`) with graceful fallback to standard Trusted Execution Environment (TEE).
  - Unique 12-byte cryptographically secure IVs prepended to every ciphertext payload.
- **Evidentiary Hash Chaining**:
  - SHA-256 recursive hash chaining on each recorded incident entry, establishing contemporaneity under Section 15 of the South African Electronic Communications and Transactions Act (Act 25 of 2002).
  - Tamper-detection audit flags if any byte in the local Room SQLite database is modified.

#### 3. Loadshedding-Resilient Emergency Dispatch & Duress Engine
- **Duress PIN `9999` & STS Terminal Emulation**:
  - Secret duress PIN `9999` mimics an authentic Standard Transfer Specification (STS) Error 30 (KRN2 key revision expired) failure terminal screen.
  - Zero visible emergency banners, sirens, or countdown indicators on the perpetrator-facing display.
  - Silently dispatches high-priority background distress payloads to configured In-Case-of-Emergency (ICE) guardians.
- **Fail-Safe Dispatch Cascade**:
  - Primary: Zero-Knowledge Encrypted Webhook.
  - Secondary: Zero-Airtime USSD Callback (`*120*7867#`).
  - Tertiary: Direct Carrier SMS with GPS coordinates.
  - Tactile 3-second abort countdown with haptic feedback to prevent accidental dispatches.
- **Loadshedding Stage Intelligence**:
  - Real-time Eskom and municipal loadshedding stage tracking with offline edge caching.

#### 4. Statutory Form 2 DVA Court Preparation Pack
- **Magistrates Court Alignment**:
  - Dynamic mapping of survivor incident logs into the exact statutory format of **Form 2 (Application for Protection Order)** under the Domestic Violence Act (Act 116 of 1998, as amended by Act 14 of 2021).
  - Includes digital survivor signature capture, SAPS incident cross-referencing, and clerk filing checklists.
- **Court-Admissible PDF Generation**:
  - Client-side in-memory PDF compiler generating timestamped, tamper-evident court affidavits containing cryptographic hash verification seals.

#### 5. Offline 9-Province Thuthuzela Care Centre (TCC) & 72-Hour PEP Navigator
- **Zero-Data Public Health Directory**:
  - Comprehensive, verified, preloaded directory of all public Thuthuzela Care Centres across all 9 South African provinces.
  - Instant offline distance and route calculation without requiring active mobile data.
- **Clinical Forensics & PEP Guidance**:
  - Step-by-step guidance for accessing Post-Exposure Prophylaxis (PEP within 72 hours), STI preventative medication, emergency contraception, and medical J88 clinical forensics documentation.

### Quality Assurance & Automated Test Results

| Test Suite Category | Framework / Runner | Total Tests | Pass Rate | Status |
|---|---|---|---|:---:|
| **Web PWA Unit & Decoy Tests** | Vitest 2.1.8 / JSDOM | 193 tests (28 suites) | 100% | `PASSED` |
| **Android JVM Unit & Robolectric** | JUnit 4 / Robolectric / MockK | 45 tests | 100% | `PASSED` |
| **Accessibility (a11y) Audits** | axe-core / WCAG 2 AA/AAA | Full DOM inspection | 100% | `PASSED` |
| **CI/CD Build Matrix** | GitHub Actions (JDK 21, Node 20) | Multi-job workflow | 100% | `PASSED` |

### Legal Compliance & Evidentiary Certifications
- **POPIA (Protection of Personal Information Act 4 of 2013)**: Zero third-party telemetry, zero commercial ad SDKs, zero unencrypted cloud transmission.
- **Domestic Violence Act (Act 116 of 1998 & Act 14 of 2021)**: Verifiable incident intake matching Form 2 statutory regulations.
- **ECTA (Electronic Communications and Transactions Act 25 of 2002)**: Section 15 contemporaneous data message authentication and integrity hashing.

---

## 🔒 Release v2.6.0 (Latest) — Sankofa Digital Continuation (Commercial Repository)

### Commercial Rationale & Enterprise Architecture

While `v2.5.0` fulfills all requirements for the FNB AOTY 2026 Hackathon MVP, **Release `v2.6.0` (Latest)** marks the deployment of the Umkhuseli platform into an enterprise-ready, commercially viable safety and crisis infrastructure platform under the exclusive development of **Sankofa Digital**.

- **Repository URI**: `https://github.com/Sankofa-Digital-Studio/Umk_Commercial.git` *(Commercial Repository)*
- **Upstream Public Baseline**: `v2.5.0` (`https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector.git`)
- **Active Release Tag**: `v2.6.0`
- **Production Public Decoy Domain**: `https://ishekomberera.vercel.app`

### Features Delivered in Release v2.6.0

1. **'The Mask' Chameleon Camouflage Engine**:
   - **Face 1: PowerCalc SA** (`MunicipalPrepaidCalculator.tsx`): Municipal STS-6 electricity & water token vending and tariff analyzer.
   - **Face 2: Coco Bongo Beats** (`CocoBongoMusicFacade.tsx`): South African music streaming player featuring Amapiano, Afro House, Gospel, and Maskandi playlists, vinyl spinning album art, audio scrubbers, and offline caching decoys.
   - **Face 3: GraceShare Bible SA / Izwi LeNkosi** (`DailyDevotionalFacade.tsx`): Faith-based devotional portal with multilingual scriptures (English, isiZulu, Sesotho), downloadable verse cards, and WhatsApp-style voice note sermons with audio waveforms (1.0x, 1.5x, 2.0x speeds).
   - **Face 4: Ipkiss Minimalist Launcher** (`AndroidLauncherFacade.tsx` & `launcher/*`): Native Android home screen interface with realistic clock widget, weather badge, Google search bar, app drawer grid, dock, and dialer modal.

2. **Unified Covert Security & Sensor Matrix**:
   - **Universal Unlock PIN 8426**: Unlocks Safe Haven via search bars, concordance keypad, dialpad (`*#8426#`), and audio duration scrubber (`08:42`).
   - **Multi-Tap Gestures**: 3-tap rapid gesture on municipal crest, 3-tap gesture on spinning vinyl album art, or 4-tap gesture on scripture cross.
   - **Silent Duress SOS (PIN 9999)**: Submitting `9999` silently dispatches distress beacon to 5 ICE guardians while displaying realistic decoys (STS Error 30 terminal, track queued `#9999`, intercession prayer confirmation, or carrier MMI dialer decoy `*#9999#`).
   - **0ms Instant Panic Camouflage**: Escape key, background tap, or Android hardware back/home instantly resets UI to the active facade with synchronous RAM wiping and cryptographic session purge.

3. **Automated Test Suite Maturity (100% Green)**:
   - Vitest unit suites for all 4 facades (`androidLauncherFacade.test.tsx`, `cocoBongoMusicFacade.test.tsx`, `dailyDevotionalFacade.test.tsx`, `disguiseManager.test.ts`).
   - 38/38 facade tests passing; 231 total tests across 32 test suites passing.

### Advanced Feature Roadmap in v2.6.0+

The following enterprise capabilities are actively implemented in `v2.6.0` on the private repository:

1. **Enterprise Multi-Tenant Crisis Operations Center (C2)**:
   - Real-time command dashboard for accredited private security providers, university campus security, and gender rights non-governmental organizations (NGOs).
   - Dynamic incident triage, fleet dispatch, and automated SAPS 10111 case handoff.

2. **Direct Carrier Reverse-Billed USSD Gateway (VAS Aggregators)**:
   - Direct SS7/SMPP telecommunications integration with Vodacom, MTN, Telkom, and Cell C.
   - Dedicated zero-airtime shortcodes (`*134*UMKHUSELI#`) allowing survivors with 0.00 ZAR balance to trigger live cell-tower triangulation beacons.

3. **Audio Sentry: Acoustic Distress AI Classifier**:
   - On-device, edge-computed TensorFlow Lite / ONNX acoustic classifier trained to detect domestic violence distress markers, screams, glass breaking, and aggressive vocal escalation.
   - Operates entirely offline with zero continuous audio streaming or privacy leakage.

4. **Bolt & e-Hailing Route Corridor Sentinel**:
   - Background trip corridor monitoring that alerts trusted guardians if a vehicle deviates significantly from safe route corridors or idles unexpectedly in high-risk zones.
   - Dead-man safety timer requiring biometric confirmation upon trip termination.

5. **OPRF PSI: Oblivious Pseudorandom Function Private Set Intersection**:
   - Cryptographic protocol enabling stealth survivor-to-guardian pairing without revealing contact directories or registering phone numbers on a centralized server.

6. **P2P Wi-Fi Direct Encrypted Mesh Sharing**:
   - Device-to-device evidence synchronization and offline emergency alert propagation during total telecommunication grid failures or Stage 8 loadshedding events.

7. **DOJ&CD Integrated Court Clerk E-Filing API**:
   - Direct digital submission channel to the South African Department of Justice and Constitutional Development portal for immediate interim protection order docket generation.

---

### 💻 Private Forking & Ingestion Instructions

For authorized Sankofa Digital engineers configuring the private enterprise repository, use the following standardized Git procedure:

```bash
# 1. Clone the public baseline at tag v2.5.0
git clone --branch v2.5.0 https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector.git umkhuseli-private
cd umkhuseli-private

# 2. Rename the origin remote to public-upstream
git remote rename origin public-upstream
git remote set-url --push public-upstream DISABLED_PUBLIC_REPO_FROZEN_AT_v2.5.0

# 3. Add the private enterprise repository as origin
git remote add origin git@github.com:SankofaDigital/Umkhuseli-Core.git

# 4. Create and checkout the commercial main branch
git checkout -b commercial-main v2.5.0

# 5. Tag release v2.6.0 on the private repository
git tag -a v2.6.0 -m "Release v2.6.0: Sankofa Digital Commercial Continuation & Enterprise Platform"

# 6. Push to the private repository with all tags
git push -u origin commercial-main --tags
```

---

## 📜 Complete Release History (v1.0.0 – v2.5.0)

### [2.5.0] - 2026-10-27 — FNB AOTY 2026 Hackathon Final MVP Release
- **Official FNB AOTY 2026 Release**: Complete delivery of 5 core MVP features.
- **STS Duress Simulation**: Implemented PIN `9999` masquerading as Error 30 terminal failure with silent distress dispatch.
- **Court Affidavit Pack**: Section 15 ECTA compliant Form 2 PDF generation with embedded SHA-256 integrity chains.
- **Decoy Calculator Vitest Suite**: 193 automated tests passing in Vitest with 100% green status.
- **Anti-Forensic Protection**: Snapshot blur, de-identified key storage, and 0ms atomic memory wipe.

### [2.4.0] - 2026-10-26 — Mentor Feedback Alignment & 5-Feature MVP Baseline
- Scoped repository from 12 exploratory features down to 5 definitive hackathon deliverables following mentor feedback.
- Formalized dual-persona launcher mode and incognito web PWA deployment on Vercel.
- Documented anti-surveillance reality disclaimers and legal admissibility standards.

### [2.3.0] - 2026-10-25 — Android 14+ Doze Mode & Hardware StrongBox
- Implemented `CamouflagedEmergencyForegroundService` for Android 14+ Doze mode resilience.
- Upgraded KeyStore master key provisioning to prioritize Android StrongBox HSM (`setIsStrongBoxBacked(true)`).
- Zero-knowledge encrypted offline outbox for handling Stage 6 loadshedding cellular blackouts.

### [2.2.0] - 2026-10-25 — Duress Keypad & STS Voucher Engine
- Integrated municipal electricity tariff calculation math for Eskom and major metros.
- Added tactile 3-second grace countdown with physical vibration abort feedback.

### [2.1.8] - 2026-10-24 — Web PWA Decoy Calculator & Vitest Suite
- Built initial React 18 / Vite municipal prepaid electricity decoy calculator.
- Implemented AES-256-GCM Web Crypto API vault helper with unique 12-byte IV generation.

### [2.0.0] - 2026-09-15 — Dual-Persona Stealth Architecture Pivot
- Conceptualized and implemented the dual-persona paradigm: Cultural Proverbs launcher facade over GBV Safe Haven.
- BiometricPrompt integration with hardware keystore authentication.

### [1.0.0] - 2026-08-01 — Initial Proof of Concept
- Prototype emergency speed dial and basic incident note taker.

---

## ⚖️ Terms of Evaluation & Intellectual Property Declaration

1. **Hackathon Limited Evaluation License**:
   Sankofa Digital grants the organizers, judges, technical mentors, and authorized evaluation staff of the **First National Bank App of the Year 2026 (FNB AOTY 2026)** a temporary, non-exclusive, revocable, non-transferable license to access, build, inspect, and evaluate release `v2.5.0` of this repository for the sole purpose of assessing the submission against hackathon judging criteria for fourteen (14) calendar days following publication.

2. **Proprietary Rights Reserved**:
   Except for the limited evaluation rights expressly granted above:
   - All rights, title, interest, patents, copyright, registered designs, trademarks, trade secrets, software code, UI designs, system architectures, and documentation in and to **Umkhuseli: The Protector**, **Sankofa Safe**, and related systems are and shall remain the exclusive property of **Sankofa Digital**.
   - No commercial license, patent grant, distribution right, or sublicensing authorization is granted to any party.

3. **Inquiries**:
   For commercial partnerships, enterprise licensing, or municipal deployment pilots:
   - **Entity**: Sankofa Digital
   - **Lead Developer & Maintainer**: Ntula Otto Thoso (`@OhhttooeXCIV`)
   - **Email**: `thosontula@gmail.com`
