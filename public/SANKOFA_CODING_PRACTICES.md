# Sankofa Coding Practices: Institutional Engineering Guidelines for Enterprise Resilience, Modularity & Scalability

---

## 🏛️ Executive Directive & Engineering Mandate

> *"Safety without suspicion; evidence without leakage; architecture without bloat."*

This document formalizes the **Sankofa Coding Practices** adopted by **Sankofa Digital Studio** across all production codebases, including **Umkhuseli: The Protector (*Sankofa Safe*)**. 

As our solutions scale from hackathon baselines (**v2.5.0**) into sovereign public safety infrastructure and enterprise commercial deployments (**v2.6.0+**), adherence to these software development lifecycle (SSDL) principles is mandatory for all engineering teams, contributors, and subagents.

---

## 📜 The 7 Golden Commandments of Sankofa Digital

### 1. Single Responsibility Principle (SRP) & File Size Limits
* **Maximum Line Count Rule**: No single source file (`.tsx`, `.ts`, `.kt`) shall exceed **350 lines of code**.
* **Zero God Components**: Screen shells must serve only as thin layout orchestrators ($\sim 100\text{--}150$ lines). Business logic, mathematical formulas, and complex UI modals must be decoupled into:
  - **Domain Services**: Pure, framework-agnostic algorithms (e.g., `MunicipalTariffEngine.ts`, `StsTokenGenerator.ts`).
  - **Custom React Hooks / Android UseCases**: State and lifecycle managers (e.g., `useSosCountdown.ts`, `useHttpToasts.ts`).
  - **Leaf Presentational Components**: Focused, memoized sub-views (e.g., `SosEmergencySection.tsx`, `StsError30Terminal.tsx`).
  - **Domain DTOs & Models**: Explicit TypeScript interfaces and Kotlin `@Immutable` data classes.

### 2. Anti-Forensic Memory & Zero-Trace Hardening
* **0-Millisecond Panic Scrub**: Invoking emergency camouflage (hardware Back key, Escape key, or screen flip) must execute a synchronous atomic memory scrub.
* Decrypted plaintext, trauma records, and cryptographic keys must be instantly zeroed in RAM.
* Task-switcher snapshots must be sanitized or obscured (`Window.FLAG_SECURE` on Android, blur overlay on Web PWA).
* Local storage keys must be de-identified (prefixed with `_sys_cfg_*` or `pcalc_*` with zero plain text references to "GBV", "Victim", or "Vault").

### 3. Stage 6 Loadshedding & Zero-Data Offline First
* **Offline Outbox Guarantee**: Every remote network transaction (distress dispatch, evidence sync, feedback reporting) must operate seamlessly when cellular towers collapse during power outages or when a survivor has a R0.00 data balance.
* All payloads must be encrypted client-side with AES-256-GCM before entering the local offline queue.
* The application must listen to the window `online` event to automatically drain queued payloads as soon as base stations regain power.
* Critical safety directories (e.g. 9-Province Thuthuzela Care Centres) must be preloaded locally.

### 4. ECTA Section 15 & Cryptographic Rigor
* **Storage Encryption**: Storage encryption must utilize AES-256-GCM (Galois/Counter Mode) without padding.
* **Initialization Vector (IV) Freshness**: Every cryptographic operation must generate a cryptographically random, non-repeating 12-byte IV (`SecureRandom` or `crypto.getRandomValues`).
* **Cryptographic Hash Chaining**: Every incident record must compute an immutable SHA-256 hash incorporating the previous record's hash, timestamp, and ciphertext to satisfy Section 15 of South Africa's Electronic Communications and Transactions Act (Act 25 of 2002).

### 5. Clean Architecture & High-Performance Compilation
* **Compile-Time Avoidance**:
  - In React/Vite: Decouple secondary modals using `React.lazy()` to ensure the critical render path bundle remains under $120\text{ KB}$. Hot Module Replacement (HMR) must complete in $<30\text{ ms}$.
  - In Android/Kotlin Compose: Avoid large composable trees with deeply nested anonymous lambdas that degrade Kotlin Symbol Processing (KSP). State models must be annotated with `@Immutable` / `@Stable` to allow Compose compiler smart skipping.
* **Pure Strategy Patterns**: Mathematical models (such as municipal stepped tariffs) must be structured as Strategy classes, enabling unit testing with zero DOM or framework mocks.

### 6. Progressive Disclosure & Zero Dead CTAs
* **Accordion & Expanding Card Architecture**: To prevent cognitive overload during acute trauma or high-stress domestic violence situations, secondary information (educational tips, legal rights, solar audits, go-bag lists) must be packaged into clean, expandable accordion cards. The primary emergency executionable tasks (SOS dispatch, incident logging, care centre lookup) must remain immediate and uncluttered.
* **Zero Dead Buttons**: Every interactive element (`<button>`, `<a>`, or clickable card) must trigger an active handler with visible UI feedback. Never deploy `href="#"` or unhandled empty lambdas (`onClick={() => {}}`).
* **Standardized HTTP & Operation Feedback**: All network requests, local storage commits, and offline fallbacks must present standardized feedback banners (Success: Green HTTP 200, Failed: Red HTTP 4xx/5xx, Warning: Amber Offline Fallback).

### 7. 100% Automated Test Matrix
* Code changes are strictly disallowed without corresponding unit or integration tests.
* Both happy paths (HTTP 200, online sync) and catastrophic failure modes (Stage 6 loadshedding, zero airtime, destroyed handset) must be covered with automated regression tests.

---

## 📊 Benchmark Targets for Engineering Velocity

| Metric Category | Target Standard | Enforcement Gate |
|---|---|:---:|
| **Component File Size** | $< 350$ lines of code | Pre-commit linter check |
| **Vite Hot Module Replacement (HMR)** | $< 30 \text{ ms}$ | CI/CD build performance monitor |
| **Initial Web Bundle Payload** | $< 120 \text{ KB}$ | Vite rollup visualizer threshold |
| **Android Incremental Compilation** | $< 8 \text{ seconds}$ | Gradle configuration cache validation |
| **Unit Test Coverage** | $100\%$ green passing status | GitHub Actions CI matrix |
| **0ms Camouflage Scrub Latency** | $< 10 \text{ ms}$ | Vitest panic trigger benchmark |

---

<div align="center">
<sub>Adopted as Official Engineering Standard by Sankofa Digital Studio.<br>© 2026 Sankofa Digital Studio. All Rights Reserved.</sub>
</div>
