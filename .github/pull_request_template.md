## Pull Request Checklist

### Description of Changes
<!-- Provide a concise description of the motivation and changes made in this PR -->

### Safety & Threat Model Verification
- [ ] **Camouflage Invariance**: Verified that no secret Haven UI elements or safe state leak into the Facade launcher.
- [ ] **Zero-Trace Memory Scrubbing**: Verified that pressing the panic trigger or hardware Back wipes in-memory sensitive state.
- [ ] **Cryptographic Protection**: Confirmed that any new user data fields are encrypted with AES-256-GCM before persistent storage.
- [ ] **No Plaintext Logging**: Verified that `Log.d`, `Log.i`, or `println` never emit victim names, coordinates, pins, or notes.
- [ ] **POPIA Compliance**: Verified that no telemetry, third-party analytics, or tracking SDKs have been introduced.

### Test Coverage & Build Verification
- [ ] Android unit tests pass (`./gradlew testDebugUnitTest`)
- [ ] Web PWA unit tests pass (`npm test` in `/web`)
- [ ] Code formatting & lint checks pass
