# Umkhuseli_The_Protector (Sankofa Safe)

> **Discreet, low-data GBV emergency response application for South Africa.**

Features a stealth camouflage launcher UI, encrypted local-first evidence vault with biometric protection, offline SOS dispatch (SMS & direct dial), emergency beacon generation, and comprehensive directory coverage for Thuthuzela Care Centres across all 9 provinces.

---

## Key Features & Architecture

- **Camouflage Facade**: Disguised as an innocent launcher with proverb daily reflections and app launcher drawer; triple-tap / secure PIN unlocks the Safe Haven in 0 ms.
- **Biometric Evidence Vault**: Hardware-backed AES-256-GCM encryption with Android BiometricPrompt (fingerprint, face, or secure credential) for incident logging, photos, impact statements, and witness notes.
- **State-driven SOS Emergency Dispatch**: Configurable armed grace countdown with haptic feedback, SMS broadcasting with 72-hour tracker link, and one-tap emergency calling to SAPS (10111) and National GBV Command Centre (0800 428 428).
- **Thuthuzela Care Centres (TCC)**: Complete database across all 9 South African provinces with 24/7 helpline dialing, USSD callback support, and offline guidance.
- **Clean Architecture & Manual DI**: Centralized `AppContainer` providing injectable singletons across `ViewModelFactory`, Room DAOs, and Android services.
- **Bundle & Performance Optimization**: R8 code shrinking and resource shrinking enabled with tuned ProGuard rules to ensure minimal APK footprint.

---

## Run Locally

**Prerequisites:** Android Studio, JDK 21, Android SDK (API 24 to 36).

1. Clone repository:
   ```bash
   git clone https://github.com/OhhttooeXCIV/Umkhuseli_The_Protector.git
   cd Umkhuseli_The_Protector
   ```
2. Build debug APK using Gradle wrapper:
   ```bash
   ./gradlew assembleDebug
   ```
3. Run tests:
   ```bash
   ./gradlew test
   ```
