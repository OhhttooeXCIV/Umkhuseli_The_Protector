# Umkhuseli ("The Protector") - Planning, Architecture & Requirements PDF Artifacts

This directory contains standardized, publication-ready PDF artifacts derived from the project specifications, user journeys, system architecture, security framework, business canvas, and the interactive web presentation deck ([`presentation-deck.html`](./presentation-deck.html) / [`presentation_deck.html`](./presentation_deck.html)).

---

## 📁 Artifact Catalog & Directory Structure

All PDFs are organized into modular, purpose-driven sub-folders within `/public`:

```
public/
├── presentation-deck.html                      # Interactive HTML5 presentation deck
├── presentation_deck.html                      # Canonical presentation deck copy
├── README_PDF_ARTIFACTS.md                     # This documentation catalog
│
├── user_journeys_and_stories/
│   └── Umkhuseli_User_Journeys_and_Stories.pdf
│       - Persona Profiles (Survivor/Primary User, Support Specialist, Legal/Law Enforcement Officer)
│       - Statutory User Stories mapped to SA Domestic Violence Act (Form 2)
│       - End-to-end Emergency & Safe Evidence Journey Maps
│       - Offline-first degraded connectivity recovery workflows
│
├── requirements_and_use_cases/
│   └── Umkhuseli_Requirements_and_Use_Cases.pdf
│       - Functional Requirements (UC-01 Panic Beacon to UC-06 Safe Address Redaction)
│       - Non-Functional Specifications (POPIA compliance, AES-256 latency, offline queueing)
│       - Complete Use Case Specification Matrix with Pre/Post-conditions and Edge Cases
│
├── uml_and_architecture/
│   └── Umkhuseli_UML_and_System_Architecture.pdf
│       - High-Level Clean Architecture Layering (UI / Domain / Data / Room / Hardware)
│       - Component & Structural Architecture Diagram
│       - UML Sequence Diagram: Silent Emergency Dispatch & 72-Hour Beacon Pipeline
│       - UML State Machine Diagram: Evidence Lifecycle (Draft -> Encrypted -> Synced -> Court Admissible)
│       - Entity-Relationship Data Model (UserProfile, Incident, SafeVaultKey, AuditLog)
│
├── security_and_ssdl/
│   └── Umkhuseli_SSDL_Security_and_POPIA_Compliance.pdf
│       - Secure Software Development Lifecycle (SSDL) Gates (Threat Modeling to Post-Deploy)
│       - POPIA & Constitutional Data Privacy Safeguards (Section 4(2) safe address withholding)
│       - Hardware-Backed Cryptographic Hierarchy (Android KeyStore StrongBox + Master Key + AES-256-GCM)
│       - Tamper-Evident Forensic Audit Logging (HMAC-SHA256 chained hashing)
│
├── business_plan_and_roadmap/
│   └── Umkhuseli_Lean_Business_Canvas_and_Roadmap.pdf
│       - 9-Block Lean Business Model Canvas (GBV & community safety focus)
│       - Phased Engineering & Deployment Roadmap (Phase 1 MVP to Phase 4 Pan-African Scaling)
│       - Impact & Key Performance Indicators (Time-to-dispatch, court admissibility rate)
│
└── presentation_deck/
    └── Umkhuseli_Executive_Presentation_Deck.pdf
        - 7-Slide Landscape Executive Presentation
        - Slide 1: Title & Strategic Mission
        - Slide 2: The Critical Crisis & Problem Statement
        - Slide 3: The Umkhuseli Solution & Innovation
        - Slide 4: System Architecture & Cryptographic Fortress
        - Slide 5: Statutory Compliance & Legal Protection (DVA Form 2 & POPIA)
        - Slide 6: Engineering Milestones & Operational Roadmap
        - Slide 7: Call to Action & Strategic Partnerships
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
- **Typography:** Clean Helvetica / Helvetica-Bold hierarchy with strict tabular and callout formatting.
- **Brand Identity:** Sankofa Deep Navy (`#1B1E2B`), Sankofa Warm Gold (`#D4AF37`), Alert Crimson (`#E63946`), and Safety Teal (`#2A9D8F`).
- **Legal Compliance:** Grounded in the South African Domestic Violence Act (Act 116 of 1998 as amended) and Protection of Personal Information Act (POPIA Act 4 of 2013).
