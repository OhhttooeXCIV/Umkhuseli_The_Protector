/**
 * Umkhuseli: The Protector (Sankofa Safe)
 * Theme Manager - Light & Dark Mode Controller
 *
 * Persists user theme preference ('dark' | 'light') in localStorage,
 * synchronizes with document.documentElement.classList, and dispatches
 * dynamic theme update events.
 */

export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'umkhuseli_theme_mode';
export const THEME_CHANGE_EVENT = 'umkhuseli_theme_change';

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    /* localStorage inaccessible */
  }
  // Default to dark mode for authentic camouflage and low-light stealth
  return 'dark';
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage fallback */
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
  }
}

export function toggleTheme(): ThemeMode {
  const current = getInitialTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
