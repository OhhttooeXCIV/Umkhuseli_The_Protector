# Umkhuseli: The Protector — Project & Kanban Board

> **Live Project Tracking, Workflows, Sprint Planning, and Task Delivery Matrix**
> *Dual-Persona Covert GBV Response & Court-Admissible Evidence Vault for South Africa*

---

## 1. Kanban Board Overview

This Kanban board tracks engineering, design, security audits, and field-readiness tasks across the **Android Native App**, **Web PWA Decoy Calculator**, and **Supabase Zero-Knowledge Cloud Services**.

### Workflow Columns & WIP Limits
- **Backlog**: Prioritized tasks ready for scoping and architectural review (No limit).
- **In Progress**: Actively being implemented or optimized (WIP Limit: 4).
- **Review / Verification**: Functional testing, Robolectric / Vitest suites, cryptographic validation, and physical adversary threat modeling (WIP Limit: 3).
- **Done / Production Ready**: Verified, tested, security reviewed, and merged into `main` branch.

---

## 2. Interactive Project Board Matrix

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

---

## 3. Detailed Kanban Task Cards

### 🟢 Done / Production Delivered

| Card ID | Epic | Task Title & Deliverable | Assignee | Completion Date | Verification Artifact |
|---|---|---|---|---|---|
| **UMK-001** | *Camouflage* | Dual-Persona Android Launcher Facade (Sankofa Wisdom Launcher) with African proverb generator and innocent drawer | `@OhhttooeXCIV` | 2026-10-23 | Verified in `app-debug.apk` |
| **UMK-010** | *Security* | 0-Millisecond Panic Camouflage Wipe: instant memory clearing and facade switch on hardware Back or panic tap | `@OhhttooeXCIV` | 2026-10-23 | `SankofaViewModel.kt` |
| **UMK-022** | *Security* | Hardware-backed Biometric Authentication (`BIOMETRIC_STRONG` / device PIN) protecting the Safe Haven | `@OhhttooeXCIV` | 2026-10-23 | BiometricPrompt integration |
| **UMK-031** | *Vault* | AES-256-GCM encrypted Room Database with master key in `AndroidKeyStore` (`ENC:` ciphertext tags) | `@OhhttooeXCIV` | 2026-10-23 | `VaultEncryptionHelper.kt` |
| **UMK-045** | *Directory* | Offline Thuthuzela Care Centre (TCC) directory covering all 9 SA provinces with 24/7 direct dial & USSD callback | `@OhhttooeXCIV` | 2026-10-23 | `TccData.kt` (all provinces) |
| **UMK-050** | *Dispatch* | State-driven emergency SOS dispatch with tactile 3-second abort countdown, GPS coordinate beacon, and ICE SMS | `@OhhttooeXCIV` | 2026-10-24 | `SafetyTriggerOverlay.kt` |
| **UMK-060** | *Decoy* | Municipal Prepaid Electricity Calculator Decoy with authentic Eskom/City Power tariffs and STS token generator | `@OhhttooeXCIV` | 2026-10-24 | `web/src/components/` |
| **UMK-065** | *Decoy* | Duress PIN (`9999`) silent dispatch trigger masquerading as a fake electricity purchase receipt | `@OhhttooeXCIV` | 2026-10-24 | `camouflageTriggers.test.tsx` |
| **UMK-070** | *Architecture* | Manual Dependency Injection via centralized `AppContainer` and `ViewModelFactory` | `@OhhttooeXCIV` | 2026-10-24 | `AppContainer.kt` |
| **UMK-072** | *Optimization* | R8 / ProGuard shrinking and minification rules preventing reverse engineering of vault classes | `@OhhttooeXCIV` | 2026-10-24 | `proguard-rules.pro` |

---

### 🟡 Review & Quality Assurance

| Card ID | Epic | Task Title & Scope | Priority | Test Coverage | Target Milestone |
|---|---|---|---|---|---|
| **UMK-077** | *Court Prep* | **Form 2 Protection Order Swipeable Viewer**: Swiping through recorded incidents with court case numbers, J88 medical notes, and SAPS OB numbers | **High** | Unit test created in `Form2RecordViewerTest.kt` | Milestone 4 |
| **UMK-079** | *Decoy Test* | **Municipal Decoy Vitest Test Suite**: 46 unit & integration tests validating tariff arithmetic, secret gestures, and duress flows | **High** | 46/46 Passing in `web/src/__tests__` | Milestone 4 |
| **UMK-081** | *Security* | **AES-GCM Nonce / IV Collision Hardening**: Cryptographic random 12-byte IV prepended to raw bytes with base64 serialization | **Critical** | Tested in `crypto.test.ts` & `VaultEncryptionHelperTest.kt` | Milestone 2 |
| **UMK-082** | *Field QA* | **Live Device UAT Test Plan & Feedback Guide**: End-to-end device acceptance testing covering stealth facades, 0ms panic wipes, and loadshedding outbox | **High** | Detailed in `docs/USER_ACCEPTANCE_TEST_PLAN.md` | Milestone 4 |

---

### 🔵 In Progress

| Card ID | Epic | Task & Scope | Assignee | Priority | Blocking Dependencies |
|---|---|---|---|---|---|
| **UMK-084** | *Dispatch* | **Android 14+ Doze Mode GPS Resiliency**: Background foreground service sticky dispatch to preserve GPS tracking when screen turns off | `@OhhttooeXCIV` | **High** | `ACCESS_BACKGROUND_LOCATION` policy review |
| **UMK-088** | *Cloud Sync* | **Zero-Knowledge Supabase Sync**: Client-side AES-GCM encrypted cloud backup for cross-device survivor migration without server-side plaintext access | `@OhhttooeXCIV` | **Medium** | Edge function security review (`sync-vault`) |
| **UMK-092** | *Resilience* | **Offline PWA Load-shedding Cache**: Workbox service worker caching for 100% offline functionality during Stage 6 power outages | `@OhhttooeXCIV` | **High** | Service worker cache invalidation strategy |

---

### ⚪ Backlog (Upcoming Epics)

| Card ID | Epic | Feature Description | Complexity | Target Release |
|---|---|---|---|---|
| **UMK-101** | *Telecom* | **Zero-Rated USSD Carrier Integration**: Partnership with Vodacom, MTN, Telkom, and Cell C for zero-airtime emergency reverse-billing | High | Phase 6 |
| **UMK-102** | *Legal* | **One-Tap Form 2 PDF Exporter**: Direct generation of official court-ready PDF affidavits formatted for Magistrates Court clerks | Medium | Phase 5 |
| **UMK-103** | *Community* | **Thuthuzela Care Centre Real-Time Status Feed**: Live intake capacity, on-duty nurse availability, and medical prep guidelines | Medium | Phase 6 |
| **UMK-104** | *Biometrics* | **StrongBox Hardware Keystore Fallback**: Dynamic graceful degradation for budget MediaTek/Unisoc devices lacking dedicated security chips | Low | Phase 5 |
| **UMK-105** | *Distribution* | **Covert Nearby Share (Bluetooth/Wi-Fi Direct)**: Peer-to-peer APK distribution between trusted community health workers without internet | Medium | Phase 6 |

---

## 4. Sprint Cadence & Definition of Done (DoD)

### Definition of Done (DoD) Checklist
1. **Camouflage Invariance**: The feature must not reveal any hint of the Safe Haven in the Facade UI, app launcher icon, or system notifications.
2. **Adversary-in-Hand Safety**: All in-memory plaintext must be purged immediately upon panic lock or app minimization.
3. **Cryptographic Rigour**: All persistent sensitive data must use AES-256-GCM authenticated encryption.
4. **Offline Capability**: Core SOS, directories, and vault operations must execute flawlessly with 0 airtime and 0 mobile data.
5. **POPIA Compliance**: Zero non-essential analytics or telemetry; all device logs must be scrubbed of survivor identities.
6. **Automated Testing**: 100% pass rate across Android Robolectric / JUnit test suites and Web Vitest test suites.
