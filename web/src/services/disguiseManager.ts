/**
 * Chameleon Disguise Architecture - Disguise Manager
 * Manages active facade configuration between Municipal Utility Calculator
 * and Authentic Daily Devotional Scripture Reader with persistent localStorage.
 */

export type DisguiseType = 'MUNICIPAL_PREPAID' | 'DAILY_DEVOTIONAL';

export interface DisguiseMetadata {
  id: DisguiseType;
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  themeColor: string;
}

export const DISGUISE_STORAGE_KEY = 'umkhuseli_active_disguise';
export const DISGUISE_EVENT_NAME = 'umkhuseli_disguise_change';

export const DISGUISE_CATALOG: Record<DisguiseType, DisguiseMetadata> = {
  MUNICIPAL_PREPAID: {
    id: 'MUNICIPAL_PREPAID',
    name: 'PowerCalc SA',
    title: 'Prepaid Electricity Portal',
    subtitle: 'Municipal Utility Token Management & Tariff Calculator',
    icon: 'Zap',
    description: 'South African municipal prepaid electricity calculator & token manager.',
    themeColor: '#0F172A',
  },
  DAILY_DEVOTIONAL: {
    id: 'DAILY_DEVOTIONAL',
    name: 'Daily Verse SA',
    title: 'Daily Scripture & Devotional',
    subtitle: 'IBhayibheli Elingcwele & Daily Reflections',
    icon: 'BookOpen',
    description: 'Daily scripture reader featuring Psalms and Proverbs in English, isiZulu, and Sesotho.',
    themeColor: '#1E1B4B',
  },
};

/**
 * Retrieves the currently active disguise facade from storage or returns default.
 */
export function getActiveDisguise(): DisguiseType {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(DISGUISE_STORAGE_KEY);
      if (stored === 'MUNICIPAL_PREPAID' || stored === 'DAILY_DEVOTIONAL') {
        return stored;
      }
    } catch {
      // Ignore private browsing / sandbox restrictions
    }
  }
  return 'MUNICIPAL_PREPAID';
}

/**
 * Persists and activates a new disguise facade, returning its metadata.
 */
export function setActiveDisguise(disguise: DisguiseType): DisguiseMetadata {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(DISGUISE_STORAGE_KEY, disguise);
      window.dispatchEvent(
        new CustomEvent(DISGUISE_EVENT_NAME, { detail: disguise })
      );
    } catch {
      // Ignore storage errors
    }
  }
  return getDisguiseMetadata(disguise);
}

/**
 * Returns metadata for the given disguise or the currently active disguise.
 */
export function getDisguiseMetadata(disguise?: DisguiseType): DisguiseMetadata {
  const target = disguise || getActiveDisguise();
  return DISGUISE_CATALOG[target] || DISGUISE_CATALOG.MUNICIPAL_PREPAID;
}

/**
 * Returns all supported disguise configurations.
 */
export function getAllDisguises(): DisguiseMetadata[] {
  return Object.values(DISGUISE_CATALOG);
}

/**
 * Resets the disguise back to the default municipal prepaid calculator facade.
 */
export function resetDisguise(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(DISGUISE_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent(DISGUISE_EVENT_NAME, { detail: 'MUNICIPAL_PREPAID' })
      );
    } catch {
      // Ignore
    }
  }
}
