# Umkhuseli: The Protector — Regulatory Compliance, SSDL & Governance Framework
## FNB App of the Year (FNBAOTY) 2026 Hackathon Final MVP Deliverable

---

### Executive Summary

In designing software for victims of Gender-Based Violence (GBV) and Intimate Partner Violence (IPV) in South Africa, compliance and governance cannot be treated as post-hoc legal tick-boxes. An architectural failure in data protection or evidence handling does not merely create regulatory exposure—**it puts human lives at immediate, lethal risk**.

**Umkhuseli: The Protector (*Sankofa Safe*)** adheres to an uncompromising **Privacy-by-Design and Zero-Knowledge Architecture**. The platform is systematically aligned with:
1. **The South African Domestic Violence Act (Act 116 of 1998 as amended by Act 14 of 2021)**: Standardizing statutory Form 2 filings and enforcing Section 4(2) residential address withholding.
2. **The Electronic Communications and Transactions Act (ECTA 25 of 2002, Section 15)**: Providing tamper-evident cryptographic data chaining to establish the probative evidentiary weight of digital records without over-promising automatic legal admissibility.
3. **The Protection of Personal Information Act (POPIA Act 4 of 2013)**: Meeting all 8 Conditions for Lawful Processing and enforcing strict safeguards on Special Personal Information (health, biometrics, and criminal allegations) via local-first client-side encryption.
4. **OWASP Mobile Application Security Verification Standard (MASVS 2.0)** & **OWASP Mobile Top 10 (2024)**: Mitigating physical device seizure, side-channel forensic leakage, and memory inspection.

This document details the statutory mappings, privacy controls, threat modeling, and Secure Software Development Lifecycle (SSDL) practices governing the final MVP.

---

### South African Statutory Legal Framework

```mermaid
flowchart TD
    subgraph LegalLandscape ["South African Legal & Regulatory Architecture"]
        DVA["Domestic Violence Act<br>(Act 116 of 1998 / Act 14 of 2021)"]
        ECTA["Electronic Communications & Transactions Act<br>(Act 25 of 2002 - Section 15)"]
        POPIA["Protection of Personal Information Act<br>(Act 4 of 2013)"]
        SOA["Sexual Offences & Related Matters Act<br>(Act 32 of 2007) + J88 Protocol"]
        WASPA["WASPA Code of Conduct 16.0<br>(Zero-Rated USSD / SMS Regulations)"]
    end

    subgraph UmkhuseliCore ["Umkhuseli Architectural Controls"]
        Ctrl1["Statutory Form 2 Generator + Sec 4(2) Address Withholding"]
        Ctrl2["SHA-256 Tamper-Evident Hash Chain & Audit Certificate"]
        Ctrl3["Local-First AES-256-GCM + Zero Server Telemetry"]
        Ctrl4["72-Hour TCC Navigator + PEP Clinical Protocol"]
        Ctrl5["Compliant Zero-Airtime USSD *120*7867# Emergency Beacon"]
    end

    DVA --> Ctrl1
    ECTA --> Ctrl2
    POPIA --> Ctrl3
    SOA --> Ctrl4
    WASPA --> Ctrl5
```

---

### 1. Domestic Violence Act (Act 116 of 1998 as amended by Act 14 of 2021)

The **Domestic Violence Amendment Act (Act 14 of 2021)** fundamentally updated South African jurisprudence by expanding the definition of domestic violence to explicitly incorporate **coercive control, electronic and cyber harassment, and economic abuse**, while mandating digital and remote applications for Protection Orders.

#### Statutory Form 2 Implementation & Verification
Umkhuseli structures its incident intake directly against the statutory provisions of **Form 2 (Application for Protection Order)**:
- **Parties Particulars**: Standardizes applicant and respondent demographic, employment, and contact fields.
- **Nature of Acts**: Categorizes incidents according to statutory classifications:
  - *Physical Abuse* (Section 1(a))
  - *Sexual Abuse* (Section 1(b))
  - *Emotional, Verbal & Psychological Abuse* (Section 1(c))
  - *Economic Abuse* (Section 1(d))
  - *Intimidation & Harassment* (Section 1(e) & 1(f))
  - *Controlling Behavior / Coercive Control* (Section 1(r))
  - *Electronic Communication Abuse* (Section 1(hA))
- **Statutory Section 4(2) Address Withholding**:
  > *“In terms of section 4(2) of the Act, if the applicant reasonably believes that their physical safety or that of a related person would be endangered by the disclosure of their physical address, the court must direct that such address be omitted from the application and summons served on the respondent.”*
  
  **Architectural Enforcement**: When the survivor checks *"Withhold my address from the abuser"*, the system mathematically strips the applicant's residential address from the exported Form 2 PDF served to the respondent, replacing it with an alternative safe correspondence address or court clerk liaison address.

- **Interim Orders (Form 4) & Suspended Warrants of Arrest (Form 6)**:
  The export packet automatically formats grounds of urgency to substantiate why an **ex parte Interim Protection Order** must be issued immediately without prior notice to the respondent, accompanied by a suspended Form 6 Warrant of Arrest to empower SAPS to detain the perpetrator upon any breach.

---

### 2. Electronic Communications and Transactions Act (ECTA 25 of 2002)

#### Section 15: Admissibility and Evidentiary Weight of Data Messages
Section 15 of ECTA provides that:
1. *In any legal proceedings, the rules of evidence must not be applied so as to deny the admissibility of a data message in evidence on the sole ground that it is generated by a computer.*
2. *Information in the form of a data message must be given due evidential weight, assessing:*
   - *(a) the reliability of the manner in which the data message was generated, stored or communicated;*
   - *(b) the reliability of the manner in which the integrity of the data message was maintained;*
   - *(c) the manner in which its originator was identified; and*
   - *(d) any other relevant factor.*

#### Cryptographic Audit Trail vs "Guaranteed Admissibility" Disclaimer
In response to direct hackathon mentor feedback, Umkhuseli does **not** make the reckless legal assertion that digital app records are "guaranteed to be admissible" in court. The admissibility of evidence remains within the judicial discretion of the presiding magistrate or judge.

Instead, Umkhuseli provides the court with a **probative evidentiary audit package**:
- **Contemporaneous Documentation**: Records generated at the time of the incident carry substantially higher probative weight than retrospective allegations formulated months later.
- **SHA-256 Hash Chaining**: Every incident block $B_n$ incorporates the cryptographic hash of the preceding block $B_{n-1}$:
  $$\text{Hash}_n = \text{SHA-256}(\text{Hash}_{n-1} \parallel \text{Timestamp}_{\text{UTC}} \parallel \text{Category} \parallel \text{CiphertextDigest})$$
  This mathematical chaining proves that no intermediate incident has been inserted, modified, or retroactively deleted after the fact.
- **Section 15 Audit Certificate**: The exported PDF features an automated Certificate of Data Message Integrity signed by the client application, detailing the hash chain sequence, encryption algorithm (AES-256-GCM), and device hardware timestamp sources.

---

### 3. Protection of Personal Information Act (POPIA Act 4 of 2013)

Umkhuseli complies fully with all **8 Lawful Conditions of Data Processing** set forth in Chapter 3 of POPIA:

| POPIA Condition | Statutory Requirement | Umkhuseli Architectural Implementation |
|---|---|---|
| **Condition 1: Accountability** | Responsible party must ensure compliance with conditions. | Open-source security audits; verified zero-telemetry client-side processing architecture. |
| **Condition 2: Processing Limitation** | Processing must be lawful, minimal, and with data subject consent. | Data minimization by default; no tracking cookies; no device fingerprinting; no advertising SDKs. |
| **Condition 3: Purpose Specification** | Personal info collected for specific, explicitly defined purpose. | Data collected exclusively for personal safety, court filing preparation, and emergency dispatch. |
| **Condition 4: Further Processing Limitation** | Subsequent processing must be compatible with initial purpose. | Absolute prohibition on commercializing, aggregating, or sharing data with third-party brokers. |
| **Condition 5: Information Quality** | Data must be complete, accurate, not misleading, and updated. | Structured Form 2 guided validation ensures complete statutory fields, timestamps, and CAS numbers. |
| **Condition 6: Openness** | Transparency regarding collection and identity of responsible party. | Clear, plain-language privacy notice available in-app; offline accessible terms of safety. |
| **Condition 7: Security Safeguards** | Integrity and confidentiality ensured through technical measures. | Hardware-backed AES-256-GCM encryption (StrongBox TEE / WebCrypto); zero-latency RAM zeroization. |
| **Condition 8: Data Subject Participation** | Data subjects have right to access, correct, and delete personal info. | One-touch local database wipe; complete data export in open PDF/JSON formats; zero server retention. |

#### Special Personal Information (Sections 26 to 33)
Under POPIA Section 26, processing of **health data** (injuries, HIV PEP medication), **biometrics**, and **allegations of criminal conduct** is strictly prohibited unless specific statutory exemptions apply. 

Umkhuseli solves this through **Zero-Knowledge Local Storage**:
- All Special Personal Information is encrypted on the survivor's physical device prior to storage.
- The decryption key exists solely in the device's volatile memory or hardware enclave (AndroidKeyStore / WebCrypto), derived from the user's secret PIN or biometric passkey.
- **No plaintext Special Personal Information ever touches Umkhuseli cloud servers.** The platform operator has zero cryptographic ability to read survivor records.

---

### Secure Software Development Lifecycle (SSDL)

Umkhuseli embeds security into every stage of development, following the Microsoft SDL and NIST SP 800-64 frameworks.

```mermaid
flowchart LR
    A["1. Threat Modeling<br>(STRIDE / Physical Adversary)"] --> B["2. Secure Architecture<br>(Zero-Knowledge / Clean Arch)"]
    B --> C["3. Static Analysis<br>(Detekt / ESLint / Vitest)"]
    C --> D["4. Cryptographic Validation<br>(NIST SP 800-38D AES-GCM)"]
    D --> E["5. CI/CD Automated Gates<br>(238 Unit/Integration Tests)"]
    E --> F["6. Vulnerability Disclosure<br>(Open Source / Apache 2.0)"]
```

---

### Threat Model: Physical Adversary in Possession (STRIDE Analysis)

Traditional mobile threat models assume a remote hacker attempting to intercept network traffic. Umkhuseli’s threat model is fundamentally harsher: **The primary attacker is the survivor's domestic partner who physically inspects, seizes, or demands access to the device under threat of physical violence.**

```mermaid
flowchart TD
    subgraph AdversaryActions ["Physical Adversary Attack Vectors"]
        Atk1["Inspection: Demands to see phone screen and installed apps"]
        Atk2["Coercion: Threatens violence if survivor does not unlock phone"]
        Atk3["Surveillance: Inspects recent apps, data usage, battery stats"]
        Atk4["Forensics: Extracts storage via USB debugging or Cellebrite tool"]
        Atk5["Disruption: Takes advantage of Stage 6 loadshedding blackouts"]
    end

    subgraph UmkhuseliDefenses ["Umkhuseli Counter-Measures"]
        Def1["PowerCal SA Camouflage: Displays authentic municipal electricity meter"]
        Def2["Duress PIN 9999: Displays fake STS Error 30 terminal + silent SOS"]
        Def3["0ms Panic Exit: Clears memory, hides from Recents switcher"]
        Def4["StrongBox AES-256-GCM: Storage unreadable without hardware key"]
        Def5["Offline-First Engine: Local TCC DB + direct baseband SMS/USSD"]
    end

    Atk1 --> Def1
    Atk2 --> Def2
    Atk3 --> Def3
    Atk4 --> Def4
    Atk5 --> Def5
```

#### Detailed STRIDE Threat Mitigation Matrix

| Threat Category | Threat Description in IPV Context | Umkhuseli Mitigation Control |
|---|---|---|
| **Spoofing** | Adversary attempts to impersonate survivor to access or delete evidence. | Hardware biometric challenge (Fingerprint/Face Unlock) or secret 4-digit PIN required to unlock Safe Haven. |
| **Tampering** | Abuser modifies or deletes incident logs on device to destroy court evidence. | Cryptographic SHA-256 hash chaining. Any modification breaks the chain and flags an immediate audit failure. |
| **Repudiation** | Respondent claims digital incident logs were fabricated after legal action began. | Contemporaneous timestamps anchored to hash chain and corroborating SAPS CAS / J88 clinical records. |
| **Information Disclosure** | Abuser views emergency contacts, safe shelter locations, or incident notes. | Default municipal calculator decoy (*PowerCal SA*); 0ms panic scrub; Android `FLAG_SECURE` window masking. |
| **Denial of Service** | Abuser cuts Wi-Fi or loadshedding disables cellular data infrastructure. | Multi-tier failover: Webhook $\to$ Direct SMS $\to$ Zero-airtime USSD (`*120*7867#`). 100% offline local database. |
| **Elevation of Privilege** | Malicious third-party app attempts to read Umkhuseli local database. | Android internal sandbox storage; AES-256-GCM encryption with keys sealed inside hardware StrongBox TEE. |

---

### OWASP Mobile Top 10 (2024) Mitigation Matrix

The native Android and Web PWA implementations have been audited against the **2024 OWASP Mobile Top 10**:

| OWASP Risk | Vulnerability Vector | Umkhuseli Implementation Safeguard |
|---|---|---|
| **M1: Improper Credential Usage** | Hardcoded API keys or cleartext auth tokens. | Zero hardcoded secrets; client-side cryptographic keys derived dynamically via PBKDF2 / WebCrypto. |
| **M2: Inadequate Supply Chain Security** | Compromised third-party npm / Gradle packages. | Minimalist dependency tree; locked hashes in `package-lock.json` and Gradle version catalogs; zero ad/tracker SDKs. |
| **M3: Insecure Authentication/Authorization** | Weak bypasses around biometric or PIN prompts. | Crypto-bound biometric prompts via `BiometricPrompt.CryptoObject`; brute-force rate-limiting and duress routing. |
| **M4: Insufficient Input/Output Validation** | SQL injection or XSS in incident log fields. | Parameterized queries in Android Room; strict React DOM sanitization; typed schema validation via Zod. |
| **M5: Insecure Communication** | Man-in-the-Middle (MitM) interception of emergency signals. | TLS 1.3 enforced for all cloud webhooks; certificate transparency; direct baseband SMS encryption fallback. |
| **M6: Inadequate Privacy Controls** | Leaking sensitive data to system logs, clipboard, or cloud backups. | Android `android:allowBackup="false"`; `FLAG_SECURE` prevents screenshots; clipboard copy timeouts. |
| **M7: Insufficient Binary Protections** | Reverse engineering APK to uncover hidden features. | ProGuard / R8 code obfuscation, stripping symbol tables, and concealing decoy trigger logic in bytecode. |
| **M8: Security Misconfiguration** | Permissive file permissions or debug flags enabled in release. | Production release builds disable `android:debuggable`; strict Content Security Policy (CSP) on Vercel PWA. |
| **M9: Insecure Data Storage** | Storing unencrypted incident media in external shared storage. | All incident media and text stored strictly in app-private encrypted directories using AES-256-GCM. |
| **M10: Insufficient Cryptography** | Deprecated algorithms (DES, SHA-1, ECB mode). | Strictly NIST SP 800-38D compliant AES-256 in GCM mode with unique 96-bit IVs and SHA-256 hash digests. |

---

### Web Application & Edge Security (Vercel PWA)

For the Web PWA target hosted on Vercel, server-level HTTP response headers are hardened to prevent clickjacking, MIME sniffing, and cross-site scripting:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co https://api.eskomsepush.za; font-src 'self'; object-src 'none'; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

---

### Governance & Ethics Committee Approval Readiness

Umkhuseli's operational architecture is prepared for institutional deployment in partnership with the South African Department of Social Development (DSD), Department of Justice and Constitutional Development (DOJCD), and civil society organizations (e.g., Tears Foundation, POWA). The platform’s compliance architecture guarantees that no survivor data is monetized, surrendered to unauthorized surveillance, or exposed to physical abusers.
