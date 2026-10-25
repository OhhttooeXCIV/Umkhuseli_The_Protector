# Changelog

All notable changes to **Umkhuseli: The Protector** (also known as *Sankofa Safe*) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.3.0] - 2026-10-25

### Added
- **Android 14+ Doze Mode Location Foreground Service (`CamouflagedEmergencyForegroundService`)**:
  - Implements an ongoing foreground service (`foregroundServiceType="location"`) to ensure emergency telemetry and GPS beacons survive Android Doze mode and OEM battery optimizations.
  - Camouflaged system notification ("PowerCalc SA: Tariff Monitor") with zero visible references to "SOS", "Emergency", or "GBV" to prevent adversary discovery.
  - Coroutine-driven periodic location polling with wake-lock support.
- **Hardware StrongBox Security Module Support (`VaultEncryptionHelper`)**:
  - Upgrades KeyStore master key provisioning to prioritize Android StrongBox Hardware Security Modules (`setIsStrongBoxBacked(true)`) on supported devices (API 28+).
  - Graceful hardware fallback to standard Trusted Execution Environment (TEE) when StrongBox hardware is absent.
- **Zero-Knowledge Encrypted Offline Outbox (`offlineOutbox.ts`)**:
  - Stage 6 load-shedding resilience matrix for South African cellular blackout conditions.
  - Incident drafts and SOS distress beacons are queued locally using client-side AES-256-GCM encryption before storage.
  - Automatic `'online'` window event listener drains queued payloads as soon as network connectivity is restored.
  - Zero-airtime offline fallback routing (USSD `*120*7867#` and SMS dispatch).
- **Test Coverage Expansion**:
  - Added unit test suite for `CamouflagedEmergencyForegroundService` (`CamouflagedEmergencyForegroundServiceTest.kt`).
  - Added unit test suite for `offlineOutbox` (`offlineOutbox.test.ts`), bringing web test coverage to 19 suites (155 passing tests).

### Fixed
- Resolved ambiguous coroutine imports and missing `finally` cleanup in `ExampleRobolectricTest.kt`.
- Resolved ambient type declaration discrepancies in `web/src/vite-env.d.ts` for Lucide icons (`Share`, `Share2`, `PlusSquare`, `SquarePlus`, `Fingerprint`, `FingerprintPattern`).
- Green GitHub Actions CI matrix validation across Android JDK 21 unit tests and Web PWA bundle builds.

---

## [2.2.0] - 2026-10-25

### Added
- **iOS File Sharing & Safari PWA Stealth Suite**:
  - Native iOS WebKit share sheet adapter (`iosFileShare.ts`) enabling direct save of Form 2 protection order PDFs to iCloud Drive or iOS Files.
  - Discreet PWA installation guide modal for Safari (`IosInstallGuideModal.tsx`).
  - Storage persistence manager ensuring client-side evidence vaults resist WebKit 7-day eviction policies.
- **WebAuthn Biometric Passkey Integration (`webAuthnBiometrics.ts`)**:
  - Hardware-backed Touch ID / Face ID authentication for evidence vault unlocking.
  - Duress PIN fallback (PIN `9999`) to silently wipe sensitive UI state and dispatch panic alarms.

---

## [2.1.0] - 2026-10-25

### Added
- **Multi-Persona Disguise Matrix (`disguiseManager.ts`)**:
  - Real-time facade switching between Municipal Prepaid Electricity Calculator, Daily Devotional Scripture Facade, South African Weather Monitor, and Recipe Book.
  - Instant panic lock controls: hardware `Escape` key, rapid double-tap root gesture, proximity face-down sensor trigger, and browser visibility change lock.
- **AudioSentry Acoustic Distress Detection (`audioSentryService.ts`)**:
  - Web Audio API microphone stream analysis with discrete decibel spike and acoustic stress detection.
- **Route Corridor Sentinel (`routeCorridorSentinel.ts`)**:
  - Live GPS breadcrumb trail logging with geofenced corridor drift calculations for high-risk transit routes across South Africa.
- **ICE Referral Service (`iceReferralService.ts`)**:
  - Automated WhatsApp dispatch message builder with GPS coordinates, Find My Device URLs, and survivor identity details.

---

## [2.0.0] - 2026-10-25

### Added
- **Cross-Platform Zero-Install PWA (Progressive Web App)**:
  - Vite-powered PWA with full offline caching via Workbox service workers.
  - Complete parity with Android core safety features for zero-install browser usage.
  - WebCrypto AES-256-GCM authenticated encryption and SHA-256 hashing.
  - South African 13-digit ID validator with Luhn algorithm and gender/citizenship parsing (`saIdValidator.ts`).

---

## [1.1.0] - 2026-10-24

### Added
- **ECTA Section 15 & Form 2 Domestic Violence Affidavit Generator (`ectaSection15Pdf.ts`)**:
  - Automated generation of court-admissible PDF documentation complying with Section 15 of the Electronic Communications and Transactions Act 25 of 2002.
  - Incorporates Form 2 Protection Order statutory declarations, J88 medical report references, and SAPS station details.
- **Zero-Install Ephemeral Responder Console (`GuardianTrackerView.tsx`)**:
  - Lightweight console for emergency contacts and community responders.
  - Displays live telemetry (battery level, cellular signal, GPS accuracy, 72-hour beacon status) and Google Maps route navigation.
- **Daily Devotional Camouflage Facade (`DailyDevotionalFacade.tsx`)**:
  - Authentic offline scripture reader in English, isiZulu (*IBhayibheli Elingcwele*), and Sesotho (*Bibele*).
  - Hidden concordance keypad for secret PIN unlock (`8426`).

---

## [1.0.0] - 2026-10-23

### Added
- **Dual-Persona Android Application**:
  - Surface launcher facade disguised as *PowerCalc SA* (Eskom & Municipal Prepaid Electricity Calculator).
  - Concealed *Umkhuseli Safe Haven* dashboard accessible via secret calculation sequences or discreet hardware triggers.
- **Hardware Distress Triggers**:
  - Triple-press volume button listener, device shake detector, and proximity face-down flip sensor.
- **Evidence Vault & Encryption**:
  - Room database backed with AES-256-GCM encryption for incident statements, photos, and emergency logs.
- **South African National GBV Directory**:
  - Comprehensive directory of verified Thuthuzela Care Centres (TCCs) across all 9 provinces.
  - Direct integration with SAPS 10111, GBV Command Centre (`0800 428 428`), and USSD zero-airtime service (`*120*7867#`).
