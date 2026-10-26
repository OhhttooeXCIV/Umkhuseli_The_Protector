# Umkhuseli ("The Protector") - Planning, Architecture & Requirements Documentation & PDF Artifacts
## FNB App of the Year (FNBAOTY) 2026 Hackathon Final MVP Deliverable

This directory contains standardized, publication-grade documentation files and PDF artifacts derived from the project specifications, user journeys, system architecture, security framework, business canvas, agile kanban board, future epics, and the interactive web presentation deck ([`presentation-deck.html`](./presentation-deck.html) / [`presentation_deck.html`](./presentation_deck.html)).

---

## 📑 Final MVP Comprehensive Markdown Documentation

For detailed technical analysis, system blueprints, and legal compliance mappings, refer to the canonical Final MVP Markdown documentation:

1. **[`FINAL_MVP_DOCUMENTATION_INDEX.md`](./FINAL_MVP_DOCUMENTATION_INDEX.md)** — Master catalog, executive index, and judge navigation hub.
2. **[`USER_STORIES_AND_JOURNEYS_FINAL_MVP.md`](./USER_STORIES_AND_JOURNEYS_FINAL_MVP.md)** — 5 South African Personas, 5 end-to-end Mermaid journeys, and statutory Gherkin user stories.
3. **[`UML_AND_SYSTEM_ARCHITECTURE_FINAL_MVP.md`](./UML_AND_SYSTEM_ARCHITECTURE_FINAL_MVP.md)** — Clean Architecture, C4 diagrams, class models, sequence diagrams, state machine, and ERD.
4. **[`COMPLIANCE_AND_GOVERNANCE_FINAL_MVP.md`](./COMPLIANCE_AND_GOVERNANCE_FINAL_MVP.md)** — DVA Act 116/1998 & 14/2021 (Form 2 & Section 4(2) address shield), ECTA Section 15 hash chaining, POPIA 8 conditions, and OWASP Mobile Top 10.
5. **[`REQUIREMENTS_AND_USE_CASES_FINAL_MVP.md`](./REQUIREMENTS_AND_USE_CASES_FINAL_MVP.md)** — 15 Functional Requirements (FR-01 to FR-15), 10 Non-Functional Specifications (NFR-01 to NFR-10), and 8 Formal Use Cases (UC-01 to UC-08).
6. **[`KANBAN_BOARD_FINAL_MVP.md`](./KANBAN_BOARD_FINAL_MVP.md)** — Complete sprint delivery matrix (Sprints 1–6, 131 SP, 100% completed), 238/238 automated tests passing, and burndown chart.
7. **[`FUTURE_EPICS_AND_ROLLOUTS_FINAL_MVP.md`](./FUTURE_EPICS_AND_ROLLOUTS_FINAL_MVP.md)** — Post-Hackathon Roadmap (2026–2027) covering 7 Advanced Epics (E-Hailing Sentinel, Audio Sentry, OPRF Contact Discovery, Citizen First-Responders, Mesh Share, Carrier Airtime, Safe Haven Forum).
8. **[`LIMITATIONS_AND_RD_FINAL_MVP.md`](./LIMITATIONS_AND_RD_FINAL_MVP.md)** — In-depth analysis of Android Doze Mode, budget hardware enclaves, evidentiary corroboration, loadshedding tower blackouts, and active TinyML/mesh R&D.
9. **[`PRESENTATION_DECK_FINAL_MVP.md`](./PRESENTATION_DECK_FINAL_MVP.md)** — 8-Slide Executive Deck, mission statement, dual-persona disguise, production metrics, and 3-Minute Live Hackathon Demo Run-Sheet for judges.

---

## 📁 Artifact Catalog & Directory Structure (9 Final MVP PDFs)

All publication-ready PDFs are organized into modular, purpose-driven sub-folders within `/public`:

```
public/
├── FINAL_MVP_DOCUMENTATION_INDEX.md            # Master Markdown documentation index
├── presentation-deck.html                      # Interactive HTML5 presentation deck
├── presentation_deck.html                      # Canonical presentation deck copy
├── README_PDF_ARTIFACTS.md                     # This documentation catalog
│
├── user_journeys_and_stories/
│   └── Umkhuseli_User_Journeys_and_Stories_Final_MVP.pdf
│       - Target Personas: Naledi (IPV survivor), Zanele (Durban commuter), Lerato (ICE contact), Sister Dlamini (TCC), Sipho Ndlovu (Court Clerk)
│       - PowerCalc SA Camouflage: Municipal Prepaid Electricity & STS Token Calculator with Ekurhuleni & City Power tariffs
│       - Statutory User Stories mapped to SA Domestic Violence Act (Form 2) & ECTA Section 15
│       - 0-ms panic exit, 3-sec tactile SOS, and zero-airtime USSD (*120*7867#) workflows
│
├── requirements_and_use_cases/
│   └── Umkhuseli_Requirements_and_Use_Cases_Final_MVP.pdf
│       - Functional Requirements: FR-01 PowerCalc SA Camouflage to FR-15 Cross-Platform Vercel PWA
│       - Non-Functional Specifications: 0-ms latency, StrongBox AES-256-GCM, POPIA compliance, and zero-data availability
│       - Formal Use Cases: UC-01 Secret Unlock, UC-02 Armed SOS, UC-03 0-ms Panic Wipe, UC-04 Live Device UAT & Feedback
│
├── uml_and_architecture/
│   └── Umkhuseli_UML_and_System_Architecture_Final_MVP.pdf
│       - High-Level Clean Architecture Layering: Presentation (Jetpack Compose & React 19) / Domain (MVVM) / AppContainer DI / Data (Room & Dexie) / Security
│       - State Machine Specifications: SOS Signal Lifecycle with UAT Simulated Dispatch Intercept
│       - UML Sequence Flows: Biometric Decryption and 0-Millisecond Panic Scrub
│       - Entity Data Models: IncidentEntity, GuardianEntity, UserProfileEntity, and UatFeedbackEntity
│
├── security_and_ssdl/
│   └── Umkhuseli_SSDL_Security_Compliance_and_Governance_Final_MVP.pdf
│       - Threat Modeling against Physical Adversary in Possession (Coercion, Inspection, Duress)
│       - Cryptographic Hierarchy: AndroidKeyStore StrongBox/TEE + AES-256-GCM (12-byte IVs) + ECTA SHA-256 Hashes
│       - Statutory Compliance: POPIA Section 26 Special Personal Info, Section 4(2) safe address withholding, Cybercrimes Act 19/2020
│       - OWASP Mobile Top 10 & Vercel HTTPS Edge Hardening
│
├── business_plan_and_roadmap/
│   └── Umkhuseli_Lean_Business_Canvas_and_Roadmap_Final_MVP.pdf
│       - 9-Block Lean Business Model Canvas (GBV & community safety focus)
│       - Multi-Year Engineering Roadmap (2026 - 2027, Milestones 1 to 6)
│       - Current Milestones 1-5 100% Completed, with verified test suite of 238 automated tests
│
├── presentation_deck/
│   └── Umkhuseli_Executive_Presentation_Deck_Final_MVP.pdf
│       - 7-Slide Landscape Executive Presentation
│       - Slide 1: Title & Strategic Mission (PowerCalc SA Camouflage)
│       - Slide 2: Human-Centred Safety UX (The Survivor Journey)
│       - Slide 3: Multi-Platform Clean Architecture (Compose + React 19 + Vercel)
│       - Slide 4: Demo Accounts, Links, UAT Testing Mode & Trigger Codes
│       - Slide 5: Umkhuseli Lean Business Canvas & Public Benefit Strategy
│       - Slide 6: SSDL Security Architecture & Legal Rigor (Form 2 & POPIA)
│       - Slide 7: Verified Build Deliverables, 238/238 Tests & Release APK
│
├── kanban_board/
│   └── Umkhuseli_Kanban_Board_Final_MVP.pdf
│       - FNBAOTY Mentor Feedback Alignment Matrix (Scope Overload, Competitors, Traces, Legal Realism, AI Protection Orders)
│       - Agile Kanban Sprint Matrix: Done & Verified (100%), Code Review & QA (100%), In Progress (85%), Backlog
│       - Definition of Done (DoD) Verification Checklist and 238 Automated Tests Pass Scorecard
│
├── future_epics_and_rollouts/
│   └── Umkhuseli_Future_Epics_and_Rollouts_Final_MVP.pdf
│       - Horizon 1 (Phase 2): Safe Journey E-Hailing Sentinel, Audio Sentry Acoustic Distress Classifier, Direct Carrier VAS
│       - Horizon 2 (Phase 3): Curve25519 OPRF PSI Contact Discovery, 'Touched by an Angel' Citizen First-Responder KYC Network, P2P Wi-Fi Direct Mesh Share, Ward Safety Circles
│       - Milestone 6 (2027): National TCC Pilot (Baragwanath, Helen Joseph, Kalafong, Karl Bremer, Prince Mshiyeni), 11-Language Localization, DOJ e-Filing
│
└── limitations_and_rd/
    └── Umkhuseli_Limitations_and_RD_Final_MVP.pdf
        - Physical Coercion & Adversary in Possession Threat Boundaries
        - OS Sandboxing: Android 14+ Doze Mode GPS Throttling, Budget Chipset StrongBox Fallback, Samsung USSD # Stripping
        - South African Infrastructure: Stage 6 Loadshedding Base Station Blackouts & Airtime Depletion Mitigations
        - Legal Admissibility Realism (ECTA Sec 15 Contemporaneous Records vs Automatic Court Admissibility) & Ethical AI Guardrails
        - Active R&D Register: Curve25519 OPRF PSI, TinyML Acoustic Classifier, PostGIS Safety Mesh
```

---

## 🛠️ Automated PDF Generator Scripts

The PDF generator scripts are maintained under the [`pdf_generators/`](../pdf_generators/) directory and can be re-run at any time to regenerate all 9 artifacts:

- [`pdf_generators/generate_all_final_mvp_pdfs.py`](../pdf_generators/generate_all_final_mvp_pdfs.py) — **Master orchestrator script that generates all 9 Final MVP PDFs**
- [`pdf_generators/base_styles.py`](../pdf_generators/base_styles.py) — Design system styles, typography, dynamic `NumberedCanvas` (Page X of Y), and `PresentationCanvas`.
- [`pdf_generators/gen_01_user_journeys.py`](../pdf_generators/gen_01_user_journeys.py)
- [`pdf_generators/gen_02_requirements.py`](../pdf_generators/gen_02_requirements.py)
- [`pdf_generators/gen_03_uml_architecture.py`](../pdf_generators/gen_03_uml_architecture.py)
- [`pdf_generators/gen_04_security_ssdl.py`](../pdf_generators/gen_04_security_ssdl.py)
- [`pdf_generators/gen_05_business_canvas_roadmap.py`](../pdf_generators/gen_05_business_canvas_roadmap.py)
- [`pdf_generators/gen_06_presentation_deck.py`](../pdf_generators/gen_06_presentation_deck.py)
- [`pdf_generators/gen_07_kanban_board.py`](../pdf_generators/gen_07_kanban_board.py)
- [`pdf_generators/gen_08_future_epics.py`](../pdf_generators/gen_08_future_epics.py)
- [`pdf_generators/gen_09_limitations_rd.py`](../pdf_generators/gen_09_limitations_rd.py)

---

## 🎨 Design & Accessibility Standards
- **Camouflage Identity:** `PowerCalc SA` (Prepaid Electricity & STS Token Calculator) with City of Ekurhuleni (Boksburg / East Rand), City Power, Tshwane, Cape Town, and Eskom tariffs.
- **Cross-Platform Delivery:** Native Android APK (`Umkhuseli_Safe_latest.apk`) and Vercel-hosted Web PWA.
- **UAT Field Readiness:** Live device testing mode with simulated guardian intercept and in-app POPIA-compliant feedback form.
- **Brand Identity:** Deep Slate Navy (`#0A0B10`), Warm Gold (`#D4AF37`), Electric Cyan (`#00E5FF`), Alert Crimson (`#E63946`), and Safety Teal (`#2A9D8F`).
- **Legal Compliance:** Grounded in the South African Domestic Violence Act (Act 116 of 1998 as amended by Act 14 of 2021), POPIA (Act 4 of 2013), Cybercrimes Act (Act 19 of 2020), and ECTA (Act 25 of 2002 Section 15).
