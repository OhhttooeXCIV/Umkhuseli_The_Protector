# Umkhuseli ("The Protector") - Planning, Architecture & Requirements PDF Artifacts

This directory contains standardized, publication-ready PDF artifacts derived from the project specifications, user journeys, system architecture, security framework, business canvas, and the interactive web presentation deck ([`presentation-deck.html`](./presentation-deck.html) / [`presentation_deck.html`](./presentation_deck.html)).

---

## 📁 Artifact Catalog & Directory Structure

All PDFs are organized into modular, purpose-driven sub-folders within `/public`:

```
public/
├── presentation-deck.html                      # Interactive HTML5 presentation deck (PowerCalc SA & UAT scope)
├── presentation_deck.html                      # Canonical presentation deck copy
├── README_PDF_ARTIFACTS.md                     # This documentation catalog
│
├── user_journeys_and_stories/
│   └── Umkhuseli_User_Journeys_and_Stories.pdf
│       - Target Personas: Annatjie/Naledi (IPV survivor, Boksburg/Soweto), Zanele (Durban commuter), Lerato (ICE contact), Sister Dlamini (TCC), and UAT Field Evaluator
│       - PowerCalc SA Camouflage: Municipal Prepaid Electricity & STS Token Calculator with Ekurhuleni & City Power tariffs
│       - Statutory User Stories mapped to SA Domestic Violence Act (Form 2) & ECTA Section 15
│       - 0-ms panic exit, 3-sec tactile SOS, and zero-airtime USSD (*120*7867#) workflows
│
├── requirements_and_use_cases/
│   └── Umkhuseli_Requirements_and_Use_Cases.pdf
│       - Functional Requirements: FR-01 PowerCalc SA Camouflage to FR-13 Cross-Platform Vercel PWA
│       - Non-Functional Specifications: 0-ms latency, StrongBox AES-256-GCM, POPIA compliance, and zero-data availability
│       - Formal Use Cases: UC-01 Secret Unlock, UC-02 Armed SOS, UC-03 0-ms Panic Wipe, UC-04 Live Device UAT & Feedback
│
├── uml_and_architecture/
│   └── Umkhuseli_UML_and_System_Architecture.pdf
│       - High-Level Clean Architecture Layering: Presentation (Jetpack Compose & React 19) / Domain (MVVM) / AppContainer DI / Data (Room & Dexie) / Security
│       - State Machine Specifications: SOS Signal Lifecycle with UAT Simulated Dispatch Intercept
│       - UML Sequence Flows: Biometric Decryption and 0-Millisecond Panic Scrub
│       - Entity Data Models: IncidentEntity, GuardianEntity, UserProfileEntity, and UatFeedbackEntity
│
├── security_and_ssdl/
│   └── Umkhuseli_SSDL_Security_and_POPIA_Compliance.pdf
│       - Threat Modeling against Physical Adversary in Possession (Coercion, Inspection, Duress)
│       - Cryptographic Hierarchy: AndroidKeyStore StrongBox/TEE + AES-256-GCM (12-byte IVs) + ECTA SHA-256 Hashes
│       - POPIA Compliance: Local-first zero telemetry, Section 4(2) safe address withholding, and anonymous UAT feedback
│       - OWASP Mobile Top 10 & Vercel HTTPS Edge Hardening
│
├── business_plan_and_roadmap/
│   └── Umkhuseli_Lean_Business_Canvas_and_Roadmap.pdf
│       - 9-Block Lean Business Model Canvas (GBV & community safety focus)
│       - Multi-Year Engineering Roadmap (2026 - 2027, Milestones 1 to 6)
│       - Current Milestones 1-5 100% Completed, with verified test suite of 238 automated tests
│
└── presentation_deck/
    └── Umkhuseli_Executive_Presentation_Deck.pdf
        - 7-Slide Landscape Executive Presentation
        - Slide 1: Title & Strategic Mission (PowerCalc SA Camouflage)
        - Slide 2: Human-Centred Safety UX (The Survivor Journey)
        - Slide 3: Multi-Platform Clean Architecture (Compose + React 19 + Vercel)
        - Slide 4: Demo Accounts, Links, UAT Testing Mode & Trigger Codes
        - Slide 5: Umkhuseli Lean Business Canvas & Public Benefit Strategy
        - Slide 6: SSDL Security Architecture & Legal Rigor (Form 2 & POPIA)
        - Slide 7: Verified Build Deliverables, 238/238 Tests & Release APK
```

---

## 🛠️ Automated PDF Generator Scripts

The PDF generator scripts are maintained under the [`pdf_generators/`](../pdf_generators/) directory and can be re-run at any time to regenerate the artifacts:

- [`pdf_generators/base_styles.py`](../pdf_generators/base_styles.py) - Design system styles, typography, dynamic `NumberedCanvas` (Page X of Y), and `PresentationCanvas`.
- [`pdf_generators/gen_01_user_journeys.py`](../pdf_generators/gen_01_user_journeys.py)
- [`pdf_generators/gen_02_requirements.py`](../pdf_generators/gen_02_requirements.py)
- [`pdf_generators/gen_03_uml_architecture.py`](../pdf_generators/gen_03_uml_architecture.py)
- [`pdf_generators/gen_04_security_ssdl.py`](../pdf_generators/gen_04_security_ssdl.py)
- [`pdf_generators/gen_05_business_canvas_roadmap.py`](../pdf_generators/gen_05_business_canvas_roadmap.py)
- [`pdf_generators/gen_06_presentation_deck.py`](../pdf_generators/gen_06_presentation_deck.py)

---

## 🎨 Design & Accessibility Standards
- **Camouflage Identity:** `PowerCalc SA` (Prepaid Electricity & STS Token Calculator) with City of Ekurhuleni (Boksburg / East Rand), City Power, Tshwane, Cape Town, and Eskom tariffs.
- **Cross-Platform Delivery:** Native Android APK (`web/public/downloads/Umkhuseli_Safe_latest.apk`) and Vercel-hosted Web PWA.
- **UAT Field Readiness:** Live device testing mode with simulated guardian intercept and in-app POPIA-compliant feedback form.
- **Brand Identity:** Deep Slate Navy (`#0A0B10`), Warm Gold (`#D4AF37`), Electric Cyan (`#00E5FF`), Alert Crimson (`#E63946`), and Safety Teal (`#2A9D8F`).
- **Legal Compliance:** Grounded in the South African Domestic Violence Act (Act 116 of 1998 as amended by Act 14 of 2021), POPIA (Act 4 of 2013), and ECTA (Act 25 of 2002 Section 15).
