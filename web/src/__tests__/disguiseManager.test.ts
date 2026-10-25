import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getActiveDisguise,
  setActiveDisguise,
  getDisguiseMetadata,
  getAllDisguises,
  resetDisguise,
  DISGUISE_STORAGE_KEY,
  DISGUISE_EVENT_NAME,
} from '../services/disguiseManager';

describe('Chameleon Disguise Architecture - Disguise Manager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('defaults to MUNICIPAL_PREPAID if no disguise is stored', () => {
    expect(getActiveDisguise()).toBe('MUNICIPAL_PREPAID');
  });

  it('sets and retrieves DAILY_DEVOTIONAL disguise accurately', () => {
    const meta = setActiveDisguise('DAILY_DEVOTIONAL');
    expect(meta.id).toBe('DAILY_DEVOTIONAL');
    expect(meta.name).toBe('Daily Verse SA');
    expect(localStorage.getItem(DISGUISE_STORAGE_KEY)).toBe('DAILY_DEVOTIONAL');
    expect(getActiveDisguise()).toBe('DAILY_DEVOTIONAL');
  });

  it('switches back to MUNICIPAL_PREPAID and persists correctly', () => {
    setActiveDisguise('DAILY_DEVOTIONAL');
    expect(getActiveDisguise()).toBe('DAILY_DEVOTIONAL');

    const meta = setActiveDisguise('MUNICIPAL_PREPAID');
    expect(meta.id).toBe('MUNICIPAL_PREPAID');
    expect(meta.name).toBe('PowerCalc SA');
    expect(localStorage.getItem(DISGUISE_STORAGE_KEY)).toBe('MUNICIPAL_PREPAID');
    expect(getActiveDisguise()).toBe('MUNICIPAL_PREPAID');
  });

  it('dispatches a custom event when active disguise changes', () => {
    const handler = vi.fn();
    window.addEventListener(DISGUISE_EVENT_NAME, handler);

    setActiveDisguise('DAILY_DEVOTIONAL');
    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener(DISGUISE_EVENT_NAME, handler);
  });

  it('returns comprehensive metadata for MUNICIPAL_PREPAID', () => {
    const meta = getDisguiseMetadata('MUNICIPAL_PREPAID');
    expect(meta.title).toBe('Prepaid Electricity Portal');
    expect(meta.icon).toBe('Zap');
    expect(meta.themeColor).toBe('#0F172A');
  });

  it('returns comprehensive metadata for DAILY_DEVOTIONAL', () => {
    const meta = getDisguiseMetadata('DAILY_DEVOTIONAL');
    expect(meta.title).toBe('Daily Scripture & Devotional');
    expect(meta.icon).toBe('BookOpen');
    expect(meta.themeColor).toBe('#1E1B4B');
  });

  it('returns all supported disguise configurations', () => {
    const all = getAllDisguises();
    expect(all).toHaveLength(2);
    expect(all.map((d) => d.id)).toEqual(['MUNICIPAL_PREPAID', 'DAILY_DEVOTIONAL']);
  });

  it('resets disguise state back to MUNICIPAL_PREPAID', () => {
    setActiveDisguise('DAILY_DEVOTIONAL');
    resetDisguise();
    expect(localStorage.getItem(DISGUISE_STORAGE_KEY)).toBeNull();
    expect(getActiveDisguise()).toBe('MUNICIPAL_PREPAID');
  });
});
