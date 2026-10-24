import '@testing-library/jest-dom/vitest';
import { webcrypto } from 'node:crypto';

// Ensure Web Crypto API is fully available in JSDOM environment
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true
  });
}
