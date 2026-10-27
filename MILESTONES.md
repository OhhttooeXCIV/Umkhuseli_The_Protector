# Umkhuseli: The Protector — Project Milestones & Roadmap

> **Comprehensive Engineering Roadmap, Milestone Deliverables, and Quality Gates**  
> *Sankofa Safe — Covert GBV Response & Evidence Documentation System for South Africa*

---

## 1. Milestone Roadmap Overview

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

---

## 2. Detailed Milestone Specifications

### 🏆 Milestone 1: Stealth Facade & Launcher Foundation
- **Status:** `COMPLETED (100%)`
- **Target Date:** 2026-08-30 | **Delivered:** 2026-08-30
- **Primary Objective:** Build an innocent everyday launcher facade capable of instantly masking the safety application from physical inspection.
- **Key Deliverables:**
  - [x] Dual-persona Android launcher interface displaying daily Akan, Zulu, and Sotho proverbs.
  - [x] Standard application drawer providing normal smartphone functionality.
  - [x] Secret entry triggers: PIN code verification (`1234` / `0000`) and sacred Sankofa emblem triple-tap.
  - [x] Instantaneous 0-millisecond camouflage wipe mechanism hooked into hardware back button and top shield indicator.
- **Verification & DoD Proof:**
  - Zero UI lag on back press; no visual recents artifacts or app switching animations.
  - Process name disguised as `com.aistudio.sankofa.safe`.

---

### 🛡️ Milestone 2: Hardware-Backed Cryptography & Evidence Vault
- **Status:** `COMPLETED (100%)`
- **Target Date:** 2026-09-30 | **Delivered:** 2026-09-25
- **Primary Objective:** Implement an encrypted, local-first incident diary conforming to South African court admissibility rules and POPIA privacy mandates.
- **Key Deliverables:**
  - [x] Hardware-backed master key generation in `AndroidKeyStore` using AES-256 in GCM block mode.
  - [x] Cryptographic 12-byte random IV per record, preventing replay attacks and ciphertext predictability.
  - [x] `androidx.biometric.BiometricPrompt` integration requiring `BIOMETRIC_STRONG` or secure device credential.
  - [x] Room database encryption ensuring SQLite database dumps contain only `ENC:` tagged ciphertexts.
  - [x] Memory scrubbing: sensitive plaintext strings zeroed or cleared from ViewModel state on session exit.
- **Verification & DoD Proof:**
  - Unit tests validating encryption/decryption roundtrips and IV uniqueness (`VaultEncryptionHelperTest.kt`, `crypto.test.ts`).
  - ADB database inspection verified zero unencrypted incident text or witness names.

---

### 🚨 Milestone 3: Zero-Data SOS Lifelines & SA Emergency Network
- **Status:** `COMPLETED (100%)`
- **Target Date:** 2026-10-15 | **Delivered:** 2026-10-12
- **Primary Objective:** Equip users with reliable emergency dispatch capabilities that function even with zero data or airtime balance.
- **Key Deliverables:**
  - [x] State-driven `SafetyTriggerOverlay` state machine (`Idle` → `Armed` → `Dispatched` / `Cancelled`).
  - [x] 3-second tactile vibration grace period preventing accidental false alarms while maintaining speed.
  - [x] SMS emergency beacon generation dispatching GPS latitude/longitude, battery level, and 72-hour tracker link to up to 5 ICE guardians.
  - [x] Direct one-tap telephone links to SAPS Police Emergency (`10111`) and National GBV Command Centre (`0800 428 428`).
  - [x] Zero-Airtime USSD callback support (`*120*7867#` and `*134*7355#`).
  - [x] Comprehensive, offline-cached directory of Thuthuzela Care Centres (TCCs) covering all 9 South African provinces.
- **Verification & DoD Proof:**
  - Offline airplane mode SOS simulation verified SMS queueing and offline directory search.
  - Emergency contacts accurately filtered by province and distance.

---

### ⚖️ Milestone 4: Court-Ready Form 2 Generator & Municipal Decoy PWA
- **Status:** `COMPLETED (100%)`
- **Target Date:** 2026-10-24 | **Delivered:** 2026-10-24
- **Primary Objective:** Standardize legal evidentiary exports for Magistrates Court Protection Orders and introduce a web-based decoy platform for multi-device safety.
- **Key Deliverables:**
  - [x] **Form 2 Protection Order Record Viewer**: Structured incident reporting capturing perpetrator identity, relationship, incident timestamps, physical injuries, witness details, and SAPS OB / case numbers.
  - [x] **Municipal Prepaid Electricity Decoy**: Fully responsive web tool calculating Eskom & City Power tariffs (Block 1 & 2 Lifeline tariffs, 15% VAT, and kWh output) that generates authentic 20-digit STS recharge tokens.
  - [x] **Secret Web Camouflage Gestures**: Safe Haven unlocked via secret purchase amount `8426` or triple-click on municipal seal.
  - [x] **Duress Emergency PIN (`9999`)**: Triggers silent SOS beacon while rendering an authentic electricity purchase voucher.
  - [x] **46 Automated Vitest Tests**: 100% test pass rate across cryptographic roundtrips, tariff math, duress triggers, and UI components.
- **Verification & DoD Proof:**
  - `Form2RecordViewer.kt` and `MunicipalPrepaidCalculator.tsx` integrated and verified.
  - Vitest test suite: 5 test files, 46 tests passing.

---

### ☁️ Milestone 5: Zero-Knowledge Cloud Sync & Resiliency Matrix (v2.5.0)
- **Status:** `COMPLETED (100%)`
- **Target Date:** 2026-10-26 | **Delivered:** 2026-10-26 (FNB AOTY 2026 Hackathon MVP)
- **Primary Objective:** Enable secure cross-device evidence vault migration using zero-knowledge client-side encryption and harden background location tracking.
- **Key Deliverables:**
  - [x] Supabase PostgreSQL database schema with row-level security (RLS) policies.
  - [x] Deno edge functions for zero-knowledge vault synchronization (`sync-vault`) and serverless SOS dispatch (`dispatch-sos`).
  - [x] GitHub Actions CI matrix running Android Robolectric tests and Web Vitest suites on every pull request.
  - [x] Android Doze Mode GPS foreground service tuning for persistent tracking during screen-off intervals.
  - [x] Automated Form 2 PDF generation with digital signature hashing for direct submission to court clerks.
- **Verification & DoD Proof:**
  - Zero-knowledge schema guarantees that backend administrators cannot inspect survivor records or incident details.
  - 193 automated Vitest tests and Android Robolectric tests passing.

---

### 🎭 Milestone 6: 'The Mask' Chameleon Camouflage Facades & Android Launcher Suite (v2.6.0)
- **Status:** `COMPLETED (100%)`
- **Target Date:** 2026-10-27 | **Delivered:** 2026-10-27 (Sankofa Digital Commercial Release)
- **Primary Objective:** Deliver the multi-persona chameleon camouflage architecture ("The Mask") providing context-appropriate decoy layers and native Android home launcher integration.
- **Key Deliverables:**
  - [x] **Face 1: PowerCalc SA**: Municipal prepaid STS-6 token vending and tariff calculation.
  - [x] **Face 2: Coco Bongo Beats**: Authentic South African music streaming player (Amapiano, Afro House, Gospel, Maskandi) with spinning vinyl artwork and covert sensors.
  - [x] **Face 3: GraceShare Bible SA / Izwi LeNkosi**: Faith-based devotional portal with multilingual scriptures (English, isiZulu, Sesotho), downloadable verse cards, and WhatsApp-style voice note sermons with audio waveforms.
  - [x] **Face 4: Ipkiss Minimalist Launcher**: Native Android home screen interface with clock widget, weather badge, Google search bar, app drawer grid, dock, and dialer modal.
  - [x] **Unified Covert Security Matrix**: Universal Safe Haven unlock (`8426`, `*#8426#`), silent duress SOS (`9999`, `*#9999#` MMI decoy), multi-tap gestures, and 0ms synchronous memory scrubbing.
  - [x] **Automated Vitest Test Expansion**: 38/38 passing tests in camouflage suite; 231 total tests across 32 test suites in web platform (100% pass).
- **Verification & DoD Proof:**
  - Deployed to production at `https://ishekomberera.vercel.app`.
  - Zero regressions on Safe Haven cryptographic vault and legal affidavit engines.

---

### 🤝 Milestone 7: Enterprise C2 Crisis Operations & Carrier USSD Gateway (v2.7.0)
- **Status:** `ACTIVE / IN PROGRESS`
- **Target Date:** 2027-01-31 (Q1 2027)
- **Primary Objective:** Enterprise crisis operations center for private security/NGO fleet dispatch and direct telecommunication reverse-billed USSD integrations.
- **Key Deliverables:**
  - [ ] Enterprise Multi-Tenant C2 Dispatcher console for private security response fleets and campus security.
  - [ ] Zero-rated carrier gateway partnership (reverse-billed USSD `*134*UMKHUSELI#` & SMS via Vodacom/MTN/Telkom/Cell C).
  - [ ] Audio Sentry edge acoustic distress AI classifier (TensorFlow Lite).
  - [ ] Bolt & e-Hailing Route Corridor Sentinel with real-time route deviation watchdog.
  - [ ] OPRF PSI stealth contact discovery for zero-knowledge guardian pairing.
