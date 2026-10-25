/**
 * Umkhuseli: The Protector (Sankofa Safe)
 * Storage Persistence & Eviction Shield
 *
 * Safari WebKit has a 7-day storage eviction cap for script-writable storage
 * (IndexedDB & LocalStorage) on websites that have not received recent interaction.
 * For installed PWAs and apps requesting `navigator.storage.persist()`, WebKit marks
 * the origin as persistent and immune to background storage purges.
 */

export interface StorageStatus {
  isPersistent: boolean;
  isSupported: boolean;
  quotaBytes?: number;
  usageBytes?: number;
}

/**
 * Requests persistent storage from the browser to safeguard the offline evidence vault.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.persist) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
      return true;
    }
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/**
 * Checks current storage durability and quota allocation
 */
export async function checkStorageStatus(): Promise<StorageStatus> {
  if (typeof navigator === "undefined" || !navigator.storage) {
    return { isPersistent: false, isSupported: false };
  }

  try {
    const isSupported = typeof navigator.storage.persist === "function";
    const isPersistent = typeof navigator.storage.persisted === "function"
      ? await navigator.storage.persisted()
      : false;

    let quotaBytes: number | undefined;
    let usageBytes: number | undefined;

    if (typeof navigator.storage.estimate === "function") {
      const estimate = await navigator.storage.estimate();
      quotaBytes = estimate.quota;
      usageBytes = estimate.usage;
    }

    return {
      isPersistent,
      isSupported,
      quotaBytes,
      usageBytes,
    };
  } catch {
    return { isPersistent: false, isSupported: true };
  }
}
