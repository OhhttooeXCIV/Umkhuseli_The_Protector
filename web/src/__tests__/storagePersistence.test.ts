import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requestPersistentStorage,
  checkStorageStatus,
} from "../services/storagePersistence";

describe("Storage Persistence & Eviction Shield", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true immediately if storage is already persisted", async () => {
    (navigator as any).storage = {
      persisted: vi.fn().mockResolvedValue(true),
      persist: vi.fn(),
    };

    const persisted = await requestPersistentStorage();
    expect(persisted).toBe(true);
    expect((navigator as any).storage.persist).not.toHaveBeenCalled();
  });

  it("calls persist() if not already persisted", async () => {
    (navigator as any).storage = {
      persisted: vi.fn().mockResolvedValue(false),
      persist: vi.fn().mockResolvedValue(true),
    };

    const persisted = await requestPersistentStorage();
    expect(persisted).toBe(true);
    expect((navigator as any).storage.persist).toHaveBeenCalled();
  });

  it("checks storage status and estimates quota", async () => {
    (navigator as any).storage = {
      persisted: vi.fn().mockResolvedValue(true),
      persist: vi.fn().mockResolvedValue(true),
      estimate: vi.fn().mockResolvedValue({ quota: 1000000000, usage: 50000 }),
    };

    const status = await checkStorageStatus();
    expect(status.isSupported).toBe(true);
    expect(status.isPersistent).toBe(true);
    expect(status.quotaBytes).toBe(1000000000);
    expect(status.usageBytes).toBe(50000);
  });
});
