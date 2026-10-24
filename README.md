# Umkhuseli: The Protector (Sankofa Safe)

<div align="center">

[![Build & Test Matrix](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?style=for-the-badge&logo=github-actions)](.github/workflows/ci.yml)
[![Android Platform](https://img.shields.io/badge/Android-API%2024%20to%2036-3DDC84?style=for-the-badge&logo=android)](app/build.gradle.kts)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.1.0-7F52FF?style=for-the-badge&logo=kotlin)](build.gradle.kts)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-BOM%202024.10.01-4285F4?style=for-the-badge&logo=jetpackcompose)](app/build.gradle.kts)
[![Web PWA Tests](https://img.shields.io/badge/Vitest-46%2F46%20Passed-6E9F18?style=for-the-badge&logo=vitest)](web/src/__tests__)
[![Cryptography](https://img.shields.io/badge/Encryption-AES--256--GCM%20%2B%20StrongBox-red?style=for-the-badge)](PROJECT_DELIVERABLES.md#3-ssdl-security-software-development-lifecycle--threat-model)
[![Compliance](https://img.shields.io/badge/POPIA%20%26%20DV%20Act-Compliant-success?style=for-the-badge)](PROJECT_DELIVERABLES.md#phase-1-security-requirements--compliance)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)

**Discreet, low-data GBV emergency response application and court-admissible legal evidence vault for South Africa.**  
*Disguised as an innocent cultural proverbs launcher and municipal prepaid electricity calculator.*

[Overview](#-overview--mission) •
[Dual-Persona Stealth](#-dual-persona-stealth-architecture) •
[Key Features](#-key-features) •
[Kanban Board](#-project--kanban-board) •
[Milestones](#-project-milestones--roadmap) •
[Past & Current Issues](#-past-and-current-issues) •
[Quick Start](#-quick-start--local-setup) •
[Security & POPIA](#-ssdl--popia-compliance) •
[Demo Credentials](#-demo-credentials--evaluation)

</div>

---

## 📖 Overview & Mission

In South Africa, where the femicide rate is five times the global average, standard emergency apps present severe risks: abusive partners regularly monitor survivors' smartphones, and discovering a safety app often triggers severe retaliatory violence. Furthermore, survivors face systemic hurdles securing Magistrates Court Protection Orders due to lost, tampered, or inadmissible evidence, compounded by prohibitive data costs.

**Umkhuseli: The Protector (*Sankofa Safe*)** solves this through a fundamental design ethos:
> *"Safety without suspicion; evidence without leakage."*

It delivers a zero-trace, dual-persona Android & Web platform combining everyday utility with covert life-saving SOS dispatch, zero-airtime USSD callbacks, and court-admissible Form 2 Protection Order incident documentation compliant with the South African Domestic Violence Act (Act 116 of 1998 / Act 14 of 2021) and POPIA.

---

## 🎭 Dual-Persona Stealth Architecture

Umkhuseli operates two layers of deception depending on context:

```mermaid
flowchart TD
    subgraph FacadeLayer ["Innocent Facade Layer (Everyday Use)"]
        A["Mobile: Sankofa Wisdom Launcher<br>(Daily Akan, Zulu & Sotho Proverbs)"]
        B["Web/PWA: Municipal Prepaid Calculator<br>(Authentic Eskom & City Power Tariffs)"]
    end

    subgraph TriggerLayer ["Covert Access Triggers"]
        T1["PIN Code (1234 / 0000 / 8426)"]
        T2["Triple-Tap Sacred Sankofa Emblem"]
        T3["Duress PIN (9999) - Silent Dispatch"]
    end

    subgraph SafeHavenCore ["Safe Haven Core (Biometric Protected)"]
        SH1["Hardware AES-256-GCM Evidence Vault"]
        SH2["Tactile 3s Grace SOS Dispatcher"]
        SH3["9-Province Thuthuzela Care Directory"]
        SH4["Form 2 Court Protection Order Generator"]
    end

    subgraph PanicLayer ["0ms Panic Exit"]
        P1["Hardware Back Button / Panic Tap"]
        P2["Instant Memory Scrub & Facade Reset (0 ms)"]
    end

    A --> T1 & T2
    B --> T1 & T3
    T1 & T2 -->|Biometric Challenge| SafeHavenCore
    T3 -->|Silent Beacon + Fake Voucher| B
    SafeHavenCore -->|Adversary Approaches| P1 --> P2 --> A
```

1. **Native Android Launcher Facade**: Appears as "Sankofa Wisdom Launcher", a lightweight launcher showing African proverbs and standard app launcher functionality.
2. **Web / PWA Decoy Calculator**: Masquerades as a municipal utility tool that calculates residential electricity units (Block 1 & 2 Lifeline tariffs, 15% VAT) and generates authentic 20-digit STS recharge vouchers.
3. **0-Millisecond Panic Camouflage**: Hitting the hardware Back button or any top panic bar instantly zeroes sensitive in-memory state and restores the decoy within 0 ms without recents snapshots.

---

## ✨ Key Features

- **Camouflage Facade & 0ms Exit**: Disguised as an innocent launcher; secret gestures or PIN unlocks the Safe Haven in 0 ms, with an instant memory purge when an abuser approaches.
- **Biometric Evidence Vault**: Hardware-backed AES-256-GCM encryption with `AndroidKeyStore` master keys and `BiometricPrompt` (`BIOMETRIC_STRONG`), encrypting incident descriptions, injuries, and witness statements.
- **State-Driven SOS Dispatch**: Configurable armed grace countdown with tactile haptic vibration, automated SMS broadcasting with 72-hour GPS tracker links to up to 5 ICE guardians.
- **Zero-Airtime Lifelines**: Integrated zero-rated USSD callback support (`*120*7867#` and `*134*7355#`) and direct-dialing for SAPS (`10111`) and GBV Command Centre (`0800 428 428`).
- **Complete Thuthuzela Care Centres (TCC) Directory**: Comprehensive, offline-cached directory across all 9 South African provinces with 24/7 helpline calling and GPS navigation guidance.
- **Court-Ready Form 2 Generator**: Standardized incident logger mapping directly to South African Department of Justice Form 2 Domestic Violence Protection Order affidavits with SAPS OB numbers and J88 medical notes.
- **Zero-Knowledge Cloud Sync (Supabase)**: Client-side E2EE sync allowing cross-device vault backup without server-side plaintext leakage.

---

## 📊 Project & Kanban Board

Umkhuseli tracks all engineering, security, and field tasks through an active Kanban system. See [`PROJECT_BOARD.md`](./PROJECT_BOARD.md) for full task definitions, WIP limits, and team workflows.

```mermaid
kanban
  Backlog
    [UMK-101] Zero-Rated USSD Carrier Gateway
    [UMK-102] Form 2 Digital PDF Export Engine
    [UMK-103] Community Worker Bulk TCC Sync
  In Progress
    [UMK-084] Android 14+ Doze Mode GPS Resiliency
    [UMK-088] E2EE Supabase Edge Function Sync
    [UMK-092] Offline PWA Loads-shedding Cache
  Review / QA
    [UMK-077] Form 2 Protection Order Swiper
    [UMK-079] Municipal Prepaid Decoy Vitest Suite
    [UMK-081] AES-GCM IV Collision Protection
  Done
    [UMK-001] Dual-Persona Facade Launcher UI
    [UMK-010] 0ms Camouflage Panic Wipe
    [UMK-022] BiometricPrompt Hardware Keystore
    [UMK-031] Room SQLite AES-256 Encrypted DAO
    [UMK-045] Offline 9-Province TCC Directory
    [UMK-050] Tactile 3-Second SOS Grace Countdown
    [UMK-060] Municipal Prepaid Decoy Calculator
```

### Current Board Highlights

| Status | Card ID | Task Title | Component | Priority |
|---|---|---|---|:---:|
| **Done** | `UMK-001` | Dual-Persona Launcher Facade & Proverbs UI | Android Core | High |
| **Done** | `UMK-010` | 0-Millisecond Panic Camouflage Memory Scrub | Security | Critical |
| **Done** | `UMK-022` | BiometricPrompt Integration (`BIOMETRIC_STRONG`) | Security | Critical |
| **Done** | `UMK-031` | AES-256-GCM Encrypted Room SQLite Database | Evidence Vault | Critical |
| **Done** | `UMK-045` | Offline 9-Province Thuthuzela Care Directory | Telephony | High |
| **Done** | `UMK-060` | Municipal Prepaid Electricity Decoy Calculator | Web PWA | High |
| **Done** | `UMK-070` | Centralized `AppContainer` Dependency Injection | Architecture | Medium |
| **Review** | `UMK-077` | Form 2 Protection Order Swipeable Viewer | Legal Vault | High |
| **Review** | `UMK-079` | Web Vitest 46/46 Automated Decoy Test Suite | Web PWA | High |
| **In Progress** | `UMK-084` | Android 14+ Doze Mode GPS Background Dispatch | Location Service | High |
| **In Progress** | `UMK-088` | Zero-Knowledge Supabase Edge Functions Sync | Cloud / E2EE | Medium |
| **In Progress** | `UMK-092` | Workbox Service Worker Cache during Load-Shedding | Web PWA | High |
| **Backlog** | `UMK-101` | Zero-Rated Carrier USSD Gateway (Vodacom/MTN) | Telecom | High |
| **Backlog** | `UMK-102` | Native Form 2 PDF Exporter with SHA-256 Hash | Legal Export | Medium |

---

## 🗺️ Project Milestones & Roadmap

Our development lifecycle is broken down into 6 key milestones. See [`MILESTONES.md`](./MILESTONES.md) for full acceptance criteria and delivery proofs.

```mermaid
timeline
    title Umkhuseli: The Protector Development Lifecycle
    section 2026 Q1 - Q2
        Milestone 1 : Covert Facade & Launcher Foundation : African Proverb Engine : 0ms Camouflage Panic Wipe
        Milestone 2 : AES-256-GCM Vault : BiometricPrompt StrongBox : Encrypted Room SQLite DAO
    section 2026 Q3
        Milestone 3 : Offline SOS Dispatch : GPS Coordinate Beacon : 9-Province TCC Directory : Zero-Airtime USSD Callback
        Milestone 4 : Form 2 Protection Order Viewer : Municipal Prepaid Decoy : Web PWA Integration : 46 Vitest Suite
    section 2026 Q4
        Milestone 5 : Zero-Knowledge Supabase Sync : E2EE Edge Functions : Automated CI/CD Matrix : Doze Mode GPS Resiliency
    section 2027 Q1+
        Milestone 6 : National TCC / SAPS Pilot : Carrier USSD Gateway Partnership : Multi-Language Localization
```

- **[x] Milestone 1: Stealth Facade & Launcher Foundation** *(Delivered: 2026-08-30)*  
  Dual-persona launcher with African proverbs, app drawer, secret entry PIN, and 0ms panic exit.
- **[x] Milestone 2: Hardware-Backed Cryptography & Evidence Vault** *(Delivered: 2026-09-25)*  
  Master key in `AndroidKeyStore`, AES-256-GCM encryption with unique 12-byte IVs, Room DB encryption, and StrongBox biometrics.
- **[x] Milestone 3: Zero-Data SOS Lifelines & SA Emergency Network** *(Delivered: 2026-10-12)*  
  State-driven SOS countdown, GPS tracker links via SMS, SAPS/GBVCC speed dial, and offline 9-province TCC directory.
- **[x] Milestone 4: Court-Ready Form 2 Generator & Municipal Decoy PWA** *(Delivered: 2026-10-24)*  
  Domestic Violence Act Form 2 record viewer, Municipal electricity calculator decoy, duress PIN 9999 silent dispatch, and 46 passing Vitest unit tests.
- **[ ] Milestone 5: Zero-Knowledge Cloud Sync & Resiliency Matrix** *(85% Complete - Target: 2026-11-30)*  
  Supabase zero-knowledge cloud schema, automated GitHub Actions CI matrix, Android 14 Doze mode background GPS tuning.
- **[ ] Milestone 6: National South African Healthcare & SAPS Field Pilot** *(Planned - 2027 Q1-Q2)*  
  Pilots in Gauteng & Western Cape TCC clinics, zero-rated carrier reverse-billing partnerships, and offline peer-to-peer APK distribution.

---

## 🛠️ Past and Current Issues

We maintain a transparent defects register and post-mortem log in [`ISSUES.md`](./ISSUES.md).

### Resolved Issues Summary

| Issue ID | Title & Component | Severity | Resolution Summary | Reference |
|---|---|:---:|---|:---:|
| **ISSUE-001** | KSP & AGP 9.1 Source Set Binding | High | Explicitly chained KSP task dependency order for Room generated code | [`d268fac`](https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector/commit/d268fac) |
| **ISSUE-002** | Deprecated `kotlinOptions` DSL | Medium | Migrated to modern Kotlin `compilerOptions` with JVM 21 target | [`4a7db3c`](https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector/commit/4a7db3c) |
| **ISSUE-003** | Non-Deterministic Nonce / IV in AES Vault | Critical | Enforced 12-byte cryptographically secure random IVs prepended to ciphertext | [`crypto.ts`](web/src/services/crypto.ts) |
| **ISSUE-004** | Plaintext State Leak on Instant Wipe | Critical | Implemented synchronous atomic memory scrub purging StateFlow on exit | [`SankofaViewModel.kt`](app/src/main/java/com/example/ui/SankofaViewModel.kt) |
| **ISSUE-005** | USSD Callback String Truncation (#) | High | Added `Uri.encode(ussdString)` to prevent `#` delimiter stripping on Android 14 | `EmergencyDispatchHelper.kt` |
| **ISSUE-006** | Municipal Decoy Multi-Tier Tariff Math | Medium | Engineered authentic Eskom Incline Block tariff math with 15% VAT deduction | `calculator.test.tsx` |

### Active Issues & Backlog

| Issue ID | Title | Severity | Status | Planned Resolution |
|---|---|:---:|:---:|---|
| **ISSUE-007** | Android 14+ Doze Mode Background GPS | High | In Progress | Implement location foreground service with sticky notification |
| **ISSUE-008** | PWA Service Worker Load-Shedding Cache | Medium | In Progress | Workbox cache-first strategy for zero-connectivity offline operation |
| **ISSUE-009** | StrongBox KeyStore Graceful Fallback | Medium | In Progress | Catch `StrongBoxUnavailableException` and fallback to standard TEE |
| **ISSUE-010** | Native Court-Admissible Form 2 PDF Exporter | High | In Progress | In-memory PDF document generator matching statutory J480 Form 2 layout |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Android**: Android Studio Meerkat or Ladybug, JDK 21, Android SDK (API 24 to 36).
- **Web**: Node.js 20+, npm 10+.

### 1. Clone Repository
```bash
git clone https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector.git
cd Umkhuseli_The_Protector
```

### 2. Android App (Native)
```bash
# Run Android Unit Tests
./gradlew testDebugUnitTest

# Build Debug APK
./gradlew assembleDebug

# Output APK Location:
# app/build/outputs/apk/debug/app-debug.apk
```

### 3. Web PWA Decoy Calculator
```bash
cd web

# Install dependencies
npm install

# Run Vitest test suite (46 unit & integration tests)
npm test -- --run

# Start local development server
npm run dev
```

### 4. Supabase Zero-Knowledge Backend
```bash
# Apply zero-knowledge schema with Row-Level Security
supabase db push --file supabase/schema.sql

# Test Deno edge functions
supabase functions serve
```

---

## 🔒 SSDL & POPIA Compliance

Umkhuseli is architected around an extreme adversary threat model: **The Adversary in Physical Possession of the Device**.

```
[Requirements] ──> [Threat Modeling] ──> [Secure Design] ──> [Implementation] ──> [Verification] ──> [Deployment]
  POPIA & DV Act     Adversary-in-Hand    AES-GCM + StrongBox   No-Leak Memory      Static Analysis    R8 Obfuscation
```

1. **POPIA Mandate**: Zero telemetry, third-party trackers, or cloud advertising SDKs. Data is strictly local-first.
2. **Cryptographic Protection**: AES-256-GCM authenticated encryption with master keys in `AndroidKeyStore`. SQLite databases contain only `ENC:` tagged ciphertexts.
3. **Instant Zero-Trace Wipe**: 0ms transition on Back press or top panic shield; cleans decrypted plaintext from memory and eliminates recents snapshot artifacts.
4. **R8 / ProGuard Obfuscation**: Class and method names obfuscated in release binaries (`isMinifyEnabled = true`, `isShrinkResources = true`).

---

## 🔑 Demo Credentials & Evaluation

| Purpose | Credential / Trigger | Description |
|---|---|---|
| **Default In-App PIN** | `1234` or `0000` | Enter on launcher keypad to unlock Safe Haven |
| **Secret Emblem Gesture** | Triple-tap Sankofa Adinkra Icon | Discreet gesture on the camouflage launcher |
| **Web Decoy Secret PIN** | Enter `8426` in Amount Field | Unlocks Web Safe Haven dashboard from calculator |
| **Duress Emergency Trigger** | Enter `9999` in Amount Field | Silently triggers SOS while printing fake electricity voucher |
| **Instant Panic Exit** | Hardware Back Button | 0ms wipe returning immediately to camouflage facade |
| **Pre-seeded ICE Contact** | Lerato Khubeka (`082 000 0001`) | Configured emergency guardian for demo testing |

### Emergency Helplines & Lifelines (South Africa)
- **GBV Command Centre**: `0800 428 428` (Toll-Free, 24/7)
- **SAPS Police Emergency**: `10111`
- **Zero-Airtime USSD Callback**: `*120*7867#`
- **TEARS Crisis Line USSD**: `*134*7355#`

---

## 👥 Contributors & Maintainers

- **Lead Developer & Maintainer**: `@OhhttooeXCIV` (Ntula Otto Thoso)
- **Interactive Presentation Deck**: Available at [`public/presentation_deck.html`](public/presentation_deck.html)
- **Project Deliverables Specification**: [`PROJECT_DELIVERABLES.md`](PROJECT_DELIVERABLES.md)
- **Kanban Board**: [`PROJECT_BOARD.md`](PROJECT_BOARD.md)
- **Milestones**: [`MILESTONES.md`](MILESTONES.md)
- **Issues Register**: [`ISSUES.md`](ISSUES.md)

---

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
