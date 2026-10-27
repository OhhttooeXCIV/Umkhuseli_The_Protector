import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { CocoBongoMusicFacade } from '../components/CocoBongoMusicFacade';

describe('CocoBongoMusicFacade Component (Face 2: Music-Centered Camouflage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentic music streaming player with track details and playlists', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<CocoBongoMusicFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    expect(screen.getByText('COCO BONGO BEATS')).toBeInTheDocument();
    expect(screen.getByText(/Edge City Soundworks • Mzansi Edition/i)).toBeInTheDocument();
    expect(screen.getAllByText('Banyana Bafana (Summer Groove)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('DJ Edge City ft. Coco Bongo All-Stars').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/48 Tracks Cached/i)).toBeInTheDocument();
    expect(screen.getByText('Playlist Queue')).toBeInTheDocument();
  });

  it('toggles playback state between play and pause', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<CocoBongoMusicFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    const playPauseBtn = screen.getByTestId('play-pause-button');
    expect(screen.getByLabelText('Play music')).toBeInTheDocument();

    fireEvent.click(playPauseBtn);
    expect(screen.getByLabelText('Pause music')).toBeInTheDocument();

    fireEvent.click(playPauseBtn);
    expect(screen.getByLabelText('Play music')).toBeInTheDocument();
  });

  it('filters playlist tracks by South African genre pills', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<CocoBongoMusicFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    // Filter by Gospel
    const gospelBtn = screen.getByRole('button', { name: 'Gospel' });
    fireEvent.click(gospelBtn);

    expect(screen.getByText('Siyabonga Baba (Praise Refrain)')).toBeInTheDocument();
    expect(screen.queryByText('Durban Deep Ocean Sunset')).not.toBeInTheDocument();

    // Filter by Afro House
    const afroHouseBtn = screen.getByRole('button', { name: 'Afro House' });
    fireEvent.click(afroHouseBtn);

    expect(screen.getByText('Durban Deep Ocean Sunset')).toBeInTheDocument();
    expect(screen.queryByText('Siyabonga Baba (Praise Refrain)')).not.toBeInTheDocument();
  });

  it('unlocks Safe Haven when secret PIN 8426 is submitted in search bar', () => {
    const onUnlockSafeHaven = vi.fn();
    const onDuressTrigger = vi.fn();

    render(
      <CocoBongoMusicFacade
        onUnlockSafeHaven={onUnlockSafeHaven}
        onDuressTrigger={onDuressTrigger}
      />
    );

    const searchInput = screen.getByLabelText('Search music catalog');
    fireEvent.change(searchInput, { target: { value: '8426' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(onUnlockSafeHaven).toHaveBeenCalledTimes(1);
    expect(onDuressTrigger).not.toHaveBeenCalled();
  });

  it('triggers silent Duress SOS when duress PIN 9999 is submitted in search bar', () => {
    const onUnlockSafeHaven = vi.fn();
    const onDuressTrigger = vi.fn();

    render(
      <CocoBongoMusicFacade
        onUnlockSafeHaven={onUnlockSafeHaven}
        onDuressTrigger={onDuressTrigger}
      />
    );

    const searchInput = screen.getByLabelText('Search music catalog');
    fireEvent.change(searchInput, { target: { value: '9999' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(onDuressTrigger).toHaveBeenCalledTimes(1);
    expect(onUnlockSafeHaven).not.toHaveBeenCalled();
    expect(screen.getByText(/Loading offline audio cache for station #9999/i)).toBeInTheDocument();
  });

  it('unlocks Safe Haven via covert 3-tap gesture on the Album Art sensor', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<CocoBongoMusicFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    const albumSensor = screen.getByTestId('album-art-sensor');

    // 3 rapid taps within 800ms
    fireEvent.click(albumSensor);
    fireEvent.click(albumSensor);
    fireEvent.click(albumSensor);

    expect(onUnlockSafeHaven).toHaveBeenCalledTimes(1);
  });

  it('unlocks Safe Haven when clicking secret timestamp duration (08:42)', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<CocoBongoMusicFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    const secretTimestamp = screen.getByTestId('secret-scrubber-timestamp');
    fireEvent.click(secretTimestamp);

    expect(onUnlockSafeHaven).toHaveBeenCalledTimes(1);
  });

  it('triggers silent Duress SOS on covert long-press of the Favorite Heart', () => {
    vi.useFakeTimers();
    const onUnlockSafeHaven = vi.fn();
    const onDuressTrigger = vi.fn();

    render(
      <CocoBongoMusicFacade
        onUnlockSafeHaven={onUnlockSafeHaven}
        onDuressTrigger={onDuressTrigger}
      />
    );

    const heartBtn = screen.getByTestId('favorite-heart-button');

    // Start long-press pointer down
    fireEvent.pointerDown(heartBtn);

    // Fast-forward 3.6 seconds
    act(() => {
      vi.advanceTimersByTime(3600);
    });

    expect(onDuressTrigger).toHaveBeenCalledTimes(1);

    fireEvent.pointerUp(heartBtn);
    vi.useRealTimers();
  });

  it('toggles track in favorites when clicked normally', () => {
    const onUnlockSafeHaven = vi.fn();
    render(<CocoBongoMusicFacade onUnlockSafeHaven={onUnlockSafeHaven} />);

    const heartBtn = screen.getByTestId('favorite-heart-button');
    expect(screen.getByLabelText('Unlike track')).toBeInTheDocument();

    fireEvent.click(heartBtn);
    expect(screen.getByLabelText('Like track')).toBeInTheDocument();

    fireEvent.click(heartBtn);
    expect(screen.getByLabelText('Unlike track')).toBeInTheDocument();
  });
});
