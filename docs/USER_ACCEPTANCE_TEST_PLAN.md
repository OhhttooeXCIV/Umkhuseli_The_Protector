# Umkhuseli: The Protector (Sankofa Safe) — User Acceptance Test (UAT) Plan & Live Device Testing Guide

**Document Version:** 1.0.0-PROD  
**Target Application Version:** v2.3.0 (Android Native APK & Safari/Chrome Web PWA)  
**Applicable Standards:** South African Domestic Violence Act (Act 116 of 1998 / Act 14 of 2021), POPIA (Act 4 of 2013), ECTA (Act 25 of 2002), ISO/IEC 25010 Software Quality Standards  
**Target Audience:** Field Testers, Community Monitors, GBV Responders, Legal Advocates, QA Engineers, and Beta Users  

---

## 1. Executive Summary & Purpose

### 1.1 Purpose
This User Acceptance Test (UAT) Plan defines the methodology, test scenarios, execution workflows, and feedback collection instruments for live device testing of **Umkhuseli: The Protector** (*Sankofa Safe*). Testing evaluates real-world performance, usability, stealth credibility, psychological safety, and court-admissible evidence fidelity directly on physical devices in the South African operational environment.

### 1.2 Core System Capabilities Under Test
1. **Dual-Persona Chameleon Stealth**: Believability of the *PowerCalc SA* (Eskom Prepaid Electricity Calculator) and *Daily Devotional* facades.
2. **0-Millisecond Panic Camouflage**: Sub-second in-memory zeroization and instant disguise restoration across gesture, button, and sensor triggers.
3. **Biometric Evidence Vault & Form 2 Generation**: AES-256-GCM encrypted incident documentation, EXIF/GPS scrubbing, and court-compliant PDF generation.
4. **Resilient Emergency SOS Dispatch**: Tactile 3-second abort countdown, camouflaged background location service (Android 14+ Doze Mode), and offline outbox queuing under Stage 6 loadshedding conditions.
5. **National Care Centre Lifelines**: 9-Province offline Thuthuzela Care Centre (TCC) directory, GPS navigation, and zero-airtime USSD callback integration.

---

## 2. Safety, Legal & Ethical Protocol (MANDATORY)

> [!CAUTION]
> **CRITICAL PARTICIPANT SAFETY RULES:**
> 1. **NO TESTING IN HIGH-RISK ENVIRONMENTS:** Testers MUST NOT execute test scripts in the presence of an active or suspected domestic abuser, volatile household member, or monitored environment.
> 2. **NO LIVE DISPATCH TO EMERGENCY AUTHORITIES:** During testing, testers MUST ONLY configure pre-arranged test contacts (fellow testers/coordinators) as ICE Guardians. **DO NOT trigger live emergency dispatch to SAPS 10111 or GBV Command Centre 0800 428 428 during routine tests.**
> 3. **SANITIZED TEST DATA:** When logging simulated incidents in the Evidence Vault, testers must use fictionalized scenarios. Do NOT enter sensitive real-world trauma data or actual personal identifiers into unverified beta builds.
> 4. **POST-TEST CLEANUP:** Testers must be briefed on how to execute a factory reset/wipe of test data before returning or daily-carrying their device.

---

## 3. Participant Cohorts & Device Test Matrix

### 3.1 Tester Cohorts
- **Cohort A: Everyday Commuters & Students** (Focus: E-hailing safety, taxi rank walking, decoy believability, ease of secret unlock).
- **Cohort B: Community Health Workers & First Responders** (Focus: Offline TCC directory, bulk ICE management, rapid incident logging, loadshedding resilience).
- **Cohort C: Legal & Victim Support Specialists** (Focus: ECTA Section 15 compliance, Form 2 PDF accuracy, J88 medical notes, police OB numbering).
- **Cohort D: Low-Resource & Township Device Users** (Focus: Performance on budget hardware, low RAM, zero-data conditions, USSD fallback).

### 3.2 Target Device Matrix

| Device Tier | Sample Models | OS Version | Hardware Target |
|---|---|---|---|
| **Tier 1: Entry / Budget Android** | Mobicel, Hisense, Samsung Galaxy A03/A04e, Xiaomi Redmi 9A | Android 8.0 - 11 (Go Edition / 2GB RAM) | Software TEE Keystore, low memory, intermittent 3G |
| **Tier 2: Mid-Range Android** | Samsung Galaxy A34/A54, Huawei (Google/GMS or MicroG), Oppo A78 | Android 12 - 14 | Biometric fingerprint, standard GPS, LTE |
| **Tier 3: Flagship Android** | Google Pixel 7/8/9, Samsung Galaxy S22/S23/S24 | Android 14 - 16 | StrongBox HSM chip, advanced Doze mode, 5G |
| **Tier 4: Apple iOS (PWA)** | iPhone SE (2020), iPhone 11/13/15 | iOS 15.0 - 18.x | Safari WebKit PWA, Touch ID / Face ID WebAuthn, Share Sheet |

### 3.3 Network Condition Matrix
- **Condition N1 (Full Broadband):** Uncapped Wi-Fi or 4G/5G LTE.
- **Condition N2 (Loadshedding / Cell Tower Outage):** Airplane Mode enabled (100% offline).
- **Condition N3 (Low Data / Zero Airtime):** SIM card with R0.00 airtime balance and 0MB data bundle.

---

## 4. Test Preparation & Installation Guide

### Track A: Android Native APK Installation
1. Obtain the official signed APK: `Umkhuseli_Safe_v2.3.0.apk` (or scan the secure QR code provided by the test coordinator).
2. Enable *"Install unknown apps"* for your browser or file manager.
3. Install the application. Verify the app installs with the innocent icon and title:
   - **App Name:** `PowerCalc SA` (or `Sankofa Wisdom`)
   - **Icon:** Electric bolt / Cultural motif (NO shield, handcuffs, or emergency icons).
4. Launch the application and observe the initial facade.

### Track B: iOS / Safari PWA Installation
1. Open Safari on iOS and navigate to the staging PWA URL: `https://safe.umkhuseli.org` (or local test IP).
2. Tap the iOS **Share** button (box with upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm the icon displays as *PowerCalc SA* and tap **Add**.
5. Launch the app directly from your iOS Home Screen (in standalone full-screen mode).

---

## 5. Live Test Scenarios & Execution Scripts

### 📋 Scenario 1: Camouflage Facade & Stealth Unlock
**Objective:** Verify that the application appears and acts as an authentic South African utility, and only reveals the Safe Haven via covert triggers.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **1.1** | Launch the app. Observe the landing screen. | The app opens directly to *PowerCalc SA: Municipal Prepaid Electricity Calculator*. No mention of GBV or safety. | [ ] Pass<br>[ ] Fail | |
| **1.2** | Enter standard calculation: `R250` in amount field, select `City Power (Johannesburg)`, tap **Calculate Units**. | Correct kWh calculation displayed (Block 1 / Block 2 Lifeline split + 15% VAT). Generates simulated 20-digit STS voucher. | [ ] Pass<br>[ ] Fail | |
| **1.3** | Enter secret unlock PIN: Enter `1234` (or `8426`) in the prepaid meter number or calculation input and tap **Enter / Verify**. | Calculator instantly transitions to the Biometric / Safe Haven challenge. | [ ] Pass<br>[ ] Fail | |
| **1.4** | On the facade screen, rapidly triple-tap the municipal / Sankofa crest icon in the top header. | Secret gesture triggers Safe Haven unlock transition in under 200ms. | [ ] Pass<br>[ ] Fail | |
| **1.5** | Switch facade theme in Settings to *Daily Devotional* (or test Devotional build). | Screen shows authentic Bible verses in isiZulu / Sesotho / English with search and prayer counter. | [ ] Pass<br>[ ] Fail | |

---

### 📋 Scenario 2: 0-Millisecond Panic Camouflage & Anti-Adversary Eviction
**Objective:** Validate that if an unauthorized person or abuser approaches, the user can instantly restore the innocent disguise with zero residual traces in memory or app switcher.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **2.1** | While inside the unlocked Safe Haven dashboard, tap the discreet red panic button / top bar. | Screen returns to the innocent *PowerCalc SA* calculator in 0 ms. Vault memory is purged. | [ ] Pass<br>[ ] Fail | |
| **2.2** | While inside the Safe Haven, press the device **Hardware Back button** or perform the system back swipe gesture. | App immediately collapses back to the facade rather than exiting to Android Home Screen. | [ ] Pass<br>[ ] Fail | |
| **2.3** | Open the device **Recent Apps / App Switcher** multitasking carousel. | App preview tile is blank or shows the innocent calculator screen (`FLAG_SECURE` blocks vault content screenshots). | [ ] Pass<br>[ ] Fail | |
| **2.4** | While inside the vault, turn the phone face-down on a flat surface (flip sensor). | Proximity / accelerometer detects flip and instantly locks back to the innocent calculator. | [ ] Pass<br>[ ] Fail | |
| **2.5** | Enter the **Duress PIN (`9999`)** on the calculator lock screen. | App displays a convincing fake error ("Token Server Unavailable: Voucher R0.00") while silently queuing a priority emergency distress beacon. | [ ] Pass<br>[ ] Fail | |

---

### 📋 Scenario 3: Biometric Authentication & Hardware Security
**Objective:** Confirm that sensitive vault contents are protected by hardware-backed biometrics and device security credentials.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **3.1** | Trigger Safe Haven unlock. Prompt asks for Biometric verification. | System `BiometricPrompt` (Fingerprint / Face ID) appears with neutral prompt ("Verify Identity"). | [ ] Pass<br>[ ] Fail | |
| **3.2** | Scan an authorized fingerprint / face. | Access granted immediately to Safe Haven dashboard. | [ ] Pass<br>[ ] Fail | |
| **3.3** | Scan an unauthorized fingerprint or cancel biometric prompt. | Access is denied. App remains on innocent calculator screen with no error leak. | [ ] Pass<br>[ ] Fail | |
| **3.4** | On iOS Safari PWA: Trigger vault unlock. | Native WebAuthn Touch ID / Face ID prompt executes smoothly without page reload. | [ ] Pass<br>[ ] Fail | |
| **3.5** | Check KeyStore security on Android: verify device without StrongBox falls back gracefully to standard TEE. | No crash on budget devices; encryption functions smoothly. | [ ] Pass<br>[ ] Fail | |

---

### 📋 Scenario 4: SOS Emergency Dispatch & Grace Countdown
**Objective:** Verify that the life-saving distress beacon triggers reliably, alerts test guardians, and provides haptic feedback without alerting nearby perpetrators.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **4.1** | Configure 1 or 2 Test Guardians (enter co-tester phone numbers). | Test contacts saved securely in encrypted local database. | [ ] Pass<br>[ ] Fail | |
| **4.2** | Tap the **Emergency SOS** trigger button. | 3-second tactile countdown initiates with rhythmic haptic vibration pulses (audible sound is muted). | [ ] Pass<br>[ ] Fail | |
| **4.3** | During the 3-second countdown, tap **Cancel / Abort**. | Countdown aborts cleanly. No SOS packet or SMS is sent. | [ ] Pass<br>[ ] Fail | |
| **4.4** | Trigger SOS and let the 3-second countdown expire. | Emergency beacon dispatches. GPS coordinates, battery level, and timestamp are captured. | [ ] Pass<br>[ ] Fail | |
| **4.5** | Check test guardian device. | Test guardian receives automated SMS with survivor distress message and a 72-hour live tracking URL. | [ ] Pass<br>[ ] Fail | |
| **4.6** | On Android: Pull down the system notification drawer while SOS is armed. | Notification reads: `"PowerCalc SA: Tariff Monitor - Active"` with zero mention of SOS/GBV. | [ ] Pass<br>[ ] Fail | |
| **4.7** | Lock phone screen for 5 minutes during active tracking. | GPS location continues updating in background despite Android Doze mode. | [ ] Pass<br>[ ] Fail | |

---

### 📋 Scenario 5: Offline Outbox & Load-Shedding Resilience
**Objective:** Ensure that safety beacons and evidence drafts are never lost when cellular towers lose power or during Stage 6 loadshedding.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **5.1** | Put device into **Airplane Mode** (simulate complete network outage). | Network indicator shows offline. | [ ] Pass<br>[ ] Fail | |
| **5.2** | Trigger an Emergency SOS or create a new Vault Incident report while offline. | Action completes locally. System stores encrypted payload into `offlineOutbox`. | [ ] Pass<br>[ ] Fail | |
| **5.3** | Observe offline prompt. | App surfaces zero-airtime USSD fallback button (`*120*7867#`) to request reverse-billed callback. | [ ] Pass<br>[ ] Fail | |
| **5.4** | Turn off Airplane Mode (reconnect to Wi-Fi / LTE). | `offlineOutbox` automatically detects network restoration and flushes queued records. | [ ] Pass<br>[ ] Fail | |
| **5.5** | Verify guardian received the queued beacon upon reconnection. | Beacon timestamp reflects original incident trigger time + queued delivery tag. | [ ] Pass<br>[ ] Fail | |

---

### 📋 Scenario 6: Court-Admissible Form 2 Legal Affidavit & Evidence Vault
**Objective:** Validate that documented domestic violence incidents satisfy legal criteria for Magistrates Court Domestic Violence Act (Form 2) protection order applications and ECTA Section 15 digital evidence admissibility.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **6.1** | In Safe Haven, tap **Log Incident / Evidence Vault**. | Form opens with standardized fields (Incident Date, Nature of Abuse, SAPS Station, OB Number, Injuries). | [ ] Pass<br>[ ] Fail | |
| **6.2** | Take a test photo of a document/object using the in-app camera or file picker. | Photo is encrypted via AES-256-GCM. Metadata sanitizer strips all EXIF/camera model data. | [ ] Pass<br>[ ] Fail | |
| **6.3** | Fill out the form fields with test information. Draw a digital signature on the signature pad. | Signature renders smoothly without lag; vector points saved securely. | [ ] Pass<br>[ ] Fail | |
| **6.4** | Tap **Generate Form 2 Affidavit / ECTA Section 15 PDF**. | Professional PDF is generated containing statutory declaration header, court case details, and SHA-256 integrity hash. | [ ] Pass<br>[ ] Fail | |
| **6.5** | Tap **Export / Share PDF**. | On Android: Android Sharesheet allows sending to Print/Email/Drive. On iOS: File shares to iCloud / Files app. | [ ] Pass<br>[ ] Fail | |
| **6.6** | Delete the incident record. | Record and underlying encrypted files are wiped with zero recovery fragments. | [ ] Pass<br>[ ] Fail | |

---

### 📋 Scenario 7: Thuthuzela Care Centres (TCC) Directory & Safety Lifelines
**Objective:** Validate that survivors can locate and contact the nearest crisis support centers across all 9 provinces without requiring an internet connection.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **7.1** | Disconnect data / Wi-Fi. Navigate to **Thuthuzela Care Centres** in Safe Haven. | Complete directory loads instantly from offline local cache (covers GP, KZN, WC, EC, LP, MP, NW, FS, NC). | [ ] Pass<br>[ ] Fail | |
| **7.2** | Filter by Province (e.g., *Gauteng* or *Western Cape*). | Centers filter instantly (e.g., Chris Hani Baragwanath TCC, Karl Bremer TCC). | [ ] Pass<br>[ ] Fail | |
| **7.3** | Tap **Call Helpline / Facility**. | Device dialer opens with the correct 24/7 telephone number pre-filled. | [ ] Pass<br>[ ] Fail | |
| **7.4** | Tap **Navigate / Map Directions**. | Device opens native map application (Google Maps / Apple Maps) routed to the verified physical street address. | [ ] Pass<br>[ ] Fail | |
| **7.5** | Tap National Lifeline buttons (SAPS `10111`, GBVCC `0800 428 428`, Childline `116`). | Dialer opens with corresponding toll-free / emergency service number. | [ ] Pass<br>[ ] Fail | |

---

### 📋 Scenario 8: Advanced Sentinels (Route Corridor & AudioSentry)
**Objective:** Evaluate automated safety sentinels for e-hailing journeys and acoustic threat detection.

| Step # | Action | Expected Result | Pass / Fail | Notes |
|---|---|---|---|---|
| **8.1** | Start a simulated **Route Corridor Sentinel** trip (e.g. set destination 2km away). | Journey begins tracking GPS breadcrumbs at regular intervals. | [ ] Pass<br>[ ] Fail | |
| **8.2** | Simulate or execute a route deviation (> 300 meters off corridor). | Sentinel triggers subtle haptic warning: "Tap power button to confirm route change". | [ ] Pass<br>[ ] Fail | |
| **8.3** | Allow deviation timer to elapse without confirmation. | Emergency beacon automatically escalates to designated guardians. | [ ] Pass<br>[ ] Fail | |
| **8.4** | Activate **AudioSentry** listener and produce a controlled loud distress shout/spike. | AudioSentry detects decibel threshold spike and logs acoustic alert event without emitting noise. | [ ] Pass<br>[ ] Fail | |

---

## 6. Feedback Collection Instruments & Questionnaires

To collect standardized, quantitative, and qualitative data from live testers, utilize the following instruments:

### 6.1 Usability & Stealth Rating (System Usability Scale + Safety Index)
*Testers rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)*:

| # | Statement | Rating (1 - 5) |
|---|---|---|
| **Q1** | The innocent disguise (*PowerCalc SA* / Devotional) is completely convincing to an onlooker. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |
| **Q2** | I was able to trigger the panic button or exit to disguise without hesitation or lag. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |
| **Q3** | The secret unlock method was easy for me to remember but difficult for someone else to guess. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |
| **Q4** | The 3-second tactile SOS countdown gave me sufficient time to cancel an accidental trigger. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |
| **Q5** | The app operated reliably even when my phone had poor mobile signal or zero data. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |
| **Q6** | The generated Form 2 Protection Order PDF is clear, structured, and legally authoritative. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |
| **Q7** | The offline Thuthuzela directory provided relevant, reachable care centers in my area. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |
| **Q8** | Overall, I would feel safer having this application installed on my phone. | `[ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]` |

---

### 6.2 Structured Bug & Anomaly Incident Report Template
When a test scenario fails or an unexpected behavior occurs, testers must log details using this template:

```markdown
### 🐛 Bug / Anomaly Report

- **Tester ID / Codename:** [e.g., Tester-JHB-04]
- **Date & Time of Test:** [e.g., 2026-10-25 14:30 SAST]
- **Device Make & Model:** [e.g., Samsung Galaxy A04e / iPhone 12]
- **Operating System Version:** [e.g., Android 12 (Go Edition) / iOS 17.4]
- **Network Provider & Connection:** [Vodacom / MTN / Telkom / Cell C / Airplane Mode]
- **Test Scenario ID:** [e.g., Scenario 2.2 - Hardware Back Button]
- **Severity Rating:**
  - [ ] **Critical (Blocker):** Security leak, crash, emergency dispatch failure, unencrypted data.
  - [ ] **High:** Feature failure, disguise compromised, biometric error.
  - [ ] **Medium:** Visual glitch, slow rendering, text truncation.
  - [ ] **Low / Suggestion:** Copy improvement, translation enhancement.

#### Steps to Reproduce:
1. Open app to calculator.
2. Enter PIN 1234.
3. Tap on "Evidence Vault".
4. Press hardware Back button.

#### Observed Behavior:
[App froze for 2 seconds before closing; screen briefly blinked the vault title before closing]

#### Expected Behavior:
[Instant 0ms swap back to the calculator with no flash of the vault screen]

#### Attachment / Screenshot:
*(Remember: DO NOT take screenshots of personal or sensitive survivor data)*
```

---

### 6.3 Qualitative Feedback & Cultural Localization Questions
1. **Language & Dialect**: Are the proverbs and terms natural and respectful in isiZulu, Sesotho, isiXhosa, and Afrikaans?
2. **Disguise Believability**: Would anyone in your household or neighborhood question why you have an Eskom prepaid calculator on your phone?
3. **Anxiety Reduction**: Did using the app feel empowering or stressful? What would make it more reassuring?
4. **Offline Viability**: How did the app handle loadshedding or lack of airtime in your actual community?

---

## 7. Submission Channels for Testers

To accommodate varying digital access and privacy needs, four submission channels are established:

1. **In-App Anonymous Feedback Form**:
   - Located inside *Safe Haven -> Settings -> Tester Feedback*.
   - Automatically sanitizes metadata, strips IP address and device serials, and submits directly via encrypted Edge Function.
2. **Encrypted Web Form**:
   - Web link accessible from private browser tabs (e.g. `https://feedback.umkhuseli.org/uat-v2`).
3. **WhatsApp / Signal Audio Voice Notes**:
   - Dedicated secure coordinator number for community field workers who prefer verbal voice debriefs over written forms.
4. **Hard-Copy Paper Questionnaires**:
   - Distributed to community shelters and paralegal clinics for offline collection, sealed in tamper-evident envelopes.

---

## 8. UAT Sign-Off & Release Gate Criteria

The build (`v2.3.0`) will only be certified for public field rollout once the following acceptance thresholds are met:

- [ ] **Zero Critical Defects (P0):** 0 unresolved crashes or security/data leaks.
- [ ] **100% Panic Reliability:** 0ms camouflage restore succeeds in 100% of tested executions.
- [ ] **Biometric Hardware Isolation:** 100% passing rate across StrongBox and TEE fallback tests.
- [ ] **Offline Survivability:** 100% of queued offline SOS packets successfully transmitted upon network restoration.
- [ ] **System Usability Score (SUS):** Mean score of $\ge 82/100$ across all test cohorts.
- [ ] **Perceived Stealth Confidence:** $\ge 95\%$ of testers agree or strongly agree that the disguise protects them from discovery.
- [ ] **Legal Document Validation:** Verification and sign-off by accredited South African legal / NGO partner.

---

*Umkhuseli: The Protector — Safety Without Suspicion, Evidence Without Leakage.*
