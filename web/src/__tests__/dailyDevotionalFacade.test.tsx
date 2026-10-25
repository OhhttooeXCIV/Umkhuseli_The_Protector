import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { DailyDevotionalFacade } from '../components/DailyDevotionalFacade';

describe('DailyDevotionalFacade Component (Step 1 Camouflage Facade)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentic devotional scripture facade in English by default', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<DailyDevotionalFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    expect(screen.getByText('Daily Verse SA')).toBeInTheDocument();
    expect(screen.getAllByText(/Psalm 23:1-4/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('The Lord is My Shepherd').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/The Lord is my shepherd; I shall not want/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Psalms & Proverbs Library/i)).toBeInTheDocument();
  });

  it('switches between English, isiZulu (IBhayibheli Elingcwele), and Sesotho (Bibele)', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<DailyDevotionalFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    // Switch to isiZulu
    const zuluBtn = screen.getByRole('button', { name: /isiZulu/i });
    fireEvent.click(zuluBtn);

    expect(screen.getAllByText('AmaHubo 23:1-4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('UJehova Ungumalusi Wami').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/UJehova ungumalusi wami; angiyikuswela/i).length).toBeGreaterThanOrEqual(1);

    // Switch to Sesotho
    const sothoBtn = screen.getByRole('button', { name: /Sesotho/i });
    fireEvent.click(sothoBtn);

    expect(screen.getAllByText('Pesaleme 23:1-4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Jehova ke Modisa wa Ka').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Jehova ke modisa wa ka, nke ke ka hloka letho/i).length).toBeGreaterThanOrEqual(1);
  });

  it('allows reading different offline scripture chapters', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<DailyDevotionalFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    // Click Psalm 91 in offline library
    const psalm91Button = screen.getByRole('button', { name: /Psalm 91:1-4/i });
    fireEvent.click(psalm91Button);

    expect(screen.getAllByText('Abiding Under the Shadow of the Almighty').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/refuge and my fortress/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles bookmarks and increments/decrements saved counter', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<DailyDevotionalFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    // Default 1 bookmark
    expect(screen.getByTitle('Saved verses')).toHaveTextContent('1');

    // Click bookmark button on current verse to remove it
    const bookmarkBtn = screen.getByLabelText(/Remove bookmark/i);
    fireEvent.click(bookmarkBtn);
    expect(screen.getByTitle('Saved verses')).toHaveTextContent('0');

    // Re-add bookmark
    const addBtn = screen.getByLabelText(/Bookmark verse/i);
    fireEvent.click(addBtn);
    expect(screen.getByTitle('Saved verses')).toHaveTextContent('1');
  });

  it('unlocks Safe Haven when secret PIN 8426 is entered in scripture search', () => {
    const onUnlockSafeHaven = vi.fn();
    const onDuressTrigger = vi.fn();

    render(
      <DailyDevotionalFacade
        onUnlockSafeHaven={onUnlockSafeHaven}
        onDuressTrigger={onDuressTrigger}
      />
    );

    const searchInput = screen.getByLabelText(/Scripture Search/i);
    fireEvent.change(searchInput, { target: { value: '8426' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(onUnlockSafeHaven).toHaveBeenCalledTimes(1);
    expect(onDuressTrigger).not.toHaveBeenCalled();
  });

  it('triggers duress SOS silently when duress PIN 9999 is entered', () => {
    const onUnlockSafeHaven = vi.fn();
    const onDuressTrigger = vi.fn();

    render(
      <DailyDevotionalFacade
        onUnlockSafeHaven={onUnlockSafeHaven}
        onDuressTrigger={onDuressTrigger}
      />
    );

    const searchInput = screen.getByLabelText(/Scripture Search/i);
    fireEvent.change(searchInput, { target: { value: '9999' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(onDuressTrigger).toHaveBeenCalledTimes(1);
    expect(onUnlockSafeHaven).not.toHaveBeenCalled();
  });

  it('unlocks Safe Haven with covert 4-tap gesture on the Cross emblem within 1000ms', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<DailyDevotionalFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    const crossEmblem = screen.getByTestId('devotional-cross-emblem');

    // 4 rapid taps
    fireEvent.click(crossEmblem);
    fireEvent.click(crossEmblem);
    fireEvent.click(crossEmblem);
    fireEvent.click(crossEmblem);

    expect(onUnlockSafeHaven).toHaveBeenCalledTimes(1);
  });

  it('unlocks Safe Haven via Concordance Keypad modal using PIN 8426', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<DailyDevotionalFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    // Open Concordance Lookup modal
    const lookupBtn = screen.getByLabelText(/Study Reference Lookup/i);
    fireEvent.click(lookupBtn);

    expect(screen.getByText('Scripture Concordance Lookup')).toBeInTheDocument();

    // Click keypad: 8 - 4 - 2 - 6
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '6' }));

    expect(onUnlockSafeHaven).toHaveBeenCalledTimes(1);
  });
});
