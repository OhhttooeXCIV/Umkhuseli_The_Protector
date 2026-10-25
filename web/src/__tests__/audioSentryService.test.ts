import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AudioDistressAnalyzer,
  SafeWalkSentinel,
  TaxiRankRapidTrigger,
  SA_TOWNSHIP_TAXI_RANKS,
  type Coordinates
} from '../services/audioSentryService';

describe('Ambient Audio Sentry & Commuter Safe-Walk Sentinel Service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Audio Distress Analyzer (Circular Buffer & Acoustic Spike Detection)', () => {
    it('maintains a rolling circular buffer of recent audio frames', () => {
      const analyzer = new AudioDistressAnalyzer({ bufferSize: 5 });

      // Feed 7 frames
      for (let i = 1; i <= 7; i++) {
        analyzer.feedFrameForTesting(50 + i, 500);
      }

      const frames = analyzer.getRecentFrames();
      // Should cap at max buffer size (5)
      expect(frames.length).toBe(5);
      // Most recent frame should have highest decibels
      expect(frames[frames.length - 1].decibels).toBe(57);
    });

    it('does not trigger distress on normal ambient conversation or background noise (under 80 dB)', () => {
      const analyzer = new AudioDistressAnalyzer();
      const distressSpy = vi.fn();
      analyzer.onDistressDetected(distressSpy);

      // Normal conversation ~60dB, 400Hz
      for (let i = 0; i < 5; i++) {
        analyzer.feedFrameForTesting(60, 400);
      }

      expect(distressSpy).not.toHaveBeenCalled();
    });

    it('does not trigger distress on loud low-frequency thuds/bass rumble (e.g. truck engine, 90 dB @ 150 Hz)', () => {
      const analyzer = new AudioDistressAnalyzer();
      const distressSpy = vi.fn();
      analyzer.onDistressDetected(distressSpy);

      // Loud bass rumble: high dB but low pitch
      for (let i = 0; i < 5; i++) {
        analyzer.feedFrameForTesting(90, 150);
      }

      expect(distressSpy).not.toHaveBeenCalled();
    });

    it('does not trigger distress on an isolated single momentary spike under sustained count', () => {
      const analyzer = new AudioDistressAnalyzer({ consecutiveSustainedFrames: 3 });
      const distressSpy = vi.fn();
      analyzer.onDistressDetected(distressSpy);

      // Frame 1: Screaming signature (>80dB, 2500Hz)
      analyzer.feedFrameForTesting(88, 2500);
      expect(distressSpy).not.toHaveBeenCalled();

      // Frame 2: Back to quiet
      analyzer.feedFrameForTesting(50, 400);
      expect(distressSpy).not.toHaveBeenCalled();
    });

    it('triggers silent distress alert when sudden sustained decibel jump (>80dB) and high-frequency scream pitch (1.5-4kHz) persist for 3 frames', () => {
      const analyzer = new AudioDistressAnalyzer({
        decibelThreshold: 80,
        screamMinFrequencyHz: 1500,
        screamMaxFrequencyHz: 4000,
        consecutiveSustainedFrames: 3
      });
      const distressSpy = vi.fn();
      analyzer.onDistressDetected(distressSpy);

      // 1st scream frame (e.g. 85dB at 2800Hz)
      analyzer.feedFrameForTesting(85, 2800);
      expect(distressSpy).not.toHaveBeenCalled();

      // 2nd scream frame
      analyzer.feedFrameForTesting(89, 3100);
      expect(distressSpy).not.toHaveBeenCalled();

      // 3rd scream frame -> threshold met!
      const frame3 = analyzer.feedFrameForTesting(92, 2600);
      expect(distressSpy).toHaveBeenCalledTimes(1);
      expect(distressSpy).toHaveBeenCalledWith(frame3, 3);
    });

    it('falls back gracefully without throwing error when microphone permission is denied or unavailable', async () => {
      const analyzer = new AudioDistressAnalyzer();
      // JSDOM environment does not have real microphone hardware
      const result = await analyzer.startListening();
      expect(result).toBe(false);
      expect(analyzer.isMicActive()).toBe(false);

      // Stopping listening cleans up without error
      expect(() => analyzer.stopListening()).not.toThrow();
    });
  });

  describe('Safe-Walk Corridor Checkpoint Timer', () => {
    const WALK_CONFIG = {
      destinationName: 'Khayelitsha Site B Home',
      totalDurationMinutes: 15,
      checkpointIntervalMinutes: 5,
      gracePeriodSeconds: 60,
      startCoords: { latitude: -34.0152, longitude: 18.6655 }
    };

    it('initializes safe-walk in WALKING state and schedules first checkpoint', () => {
      const sentry = new SafeWalkSentinel();
      expect(sentry.getState()).toBe('IDLE');

      sentry.startSafeWalk(WALK_CONFIG);
      expect(sentry.getState()).toBe('WALKING');
    });

    it('prompts for checkpoint after cadence interval (5 mins) and starts 60s grace countdown', () => {
      const sentry = new SafeWalkSentinel();
      const promptSpy = vi.fn();
      sentry.onCheckpointRequired(promptSpy);

      sentry.startSafeWalk(WALK_CONFIG);
      expect(sentry.getState()).toBe('WALKING');

      // Fast-forward 5 minutes (300,000 ms)
      vi.advanceTimersByTime(300000);

      expect(sentry.getState()).toBe('GRACE_PERIOD');
      expect(sentry.getCheckpointIndex()).toBe(1);
      expect(sentry.getRemainingGraceSeconds()).toBe(60);
      expect(promptSpy).toHaveBeenCalledWith(1, 60);
    });

    it('resets cadence and returns to WALKING when user confirms checkpoint within grace period', () => {
      const sentry = new SafeWalkSentinel();
      sentry.startSafeWalk(WALK_CONFIG);

      // Fast forward 5 minutes to trigger checkpoint #1
      vi.advanceTimersByTime(300000);
      expect(sentry.getState()).toBe('GRACE_PERIOD');

      // 20s into grace period, user taps confirm
      vi.advanceTimersByTime(20000);
      expect(sentry.getRemainingGraceSeconds()).toBe(40);

      const confirmed = sentry.confirmCheckpoint({ latitude: -34.0180, longitude: 18.6670 });
      expect(confirmed).toBe(true);
      expect(sentry.getState()).toBe('WALKING');

      // Another 5 minutes later, checkpoint #2 is triggered
      vi.advanceTimersByTime(300000);
      expect(sentry.getState()).toBe('GRACE_PERIOD');
      expect(sentry.getCheckpointIndex()).toBe(2);
    });

    it('automatically escalates to emergency distress if 60s grace period expires without confirmation', () => {
      const sentry = new SafeWalkSentinel();
      const escalationSpy = vi.fn();
      sentry.onDistressEscalation(escalationSpy);

      sentry.startSafeWalk(WALK_CONFIG);

      // Fast forward to checkpoint trigger
      vi.advanceTimersByTime(300000);
      expect(sentry.getState()).toBe('GRACE_PERIOD');

      // 60 seconds of grace period elapse without tap
      vi.advanceTimersByTime(60000);

      expect(sentry.getState()).toBe('ESCALATED_DISTRESS');
      expect(escalationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'MISSED_CHECKPOINT_GRACE_EXPIRED',
          checkpointIndex: 1,
          destinationName: 'Khayelitsha Site B Home',
          iceSmsText: expect.stringContaining('Grace period (60s) expired with NO safe response')
        })
      );
    });

    it('silently escalates to emergency distress if user enters duress PIN (9999) when cancelling', () => {
      const sentry = new SafeWalkSentinel();
      const escalationSpy = vi.fn();
      sentry.onDistressEscalation(escalationSpy);

      sentry.startSafeWalk(WALK_CONFIG);
      const cancelled = sentry.cancelSafeWalk('9999');

      expect(cancelled).toBe(false);
      expect(sentry.getState()).toBe('ESCALATED_DISTRESS');
      expect(escalationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'DURESS_PIN_SUBMITTED',
          dispatchPacket: expect.objectContaining({ isDuress: true })
        })
      );
    });

    it('transitions to COMPLETED when user safely finishes journey', () => {
      const sentry = new SafeWalkSentinel();
      sentry.startSafeWalk(WALK_CONFIG);
      sentry.completeSafeWalk();
      expect(sentry.getState()).toBe('COMPLETED');
    });
  });

  describe('Township Taxi Rank Rapid Trigger', () => {
    // Bree Street Taxi Rank (JHB CBD)
    const BREE_COORDS: Coordinates = { latitude: -26.2001, longitude: 28.0378 };

    it('triggers immediate silent distress packet on 3 rapid taps within 2 seconds', () => {
      const trigger = new TaxiRankRapidTrigger();
      const triggerSpy = vi.fn();
      trigger.onRapidTrigger(triggerSpy);

      // Tap 1
      const res1 = trigger.recordTap(BREE_COORDS);
      expect(res1.triggered).toBe(false);
      expect(res1.tapCount).toBe(1);

      // Tap 2 (400ms later)
      vi.advanceTimersByTime(400);
      const res2 = trigger.recordTap(BREE_COORDS);
      expect(res2.triggered).toBe(false);
      expect(res2.tapCount).toBe(2);

      // Tap 3 (500ms later -> total 900ms <= 2000ms window)
      vi.advanceTimersByTime(500);
      const res3 = trigger.recordTap(BREE_COORDS);
      expect(res3.triggered).toBe(true);
      expect(res3.distressPacket).toBeDefined();
      expect(triggerSpy).toHaveBeenCalledTimes(1);

      // Check distress packet content
      const packet = res3.distressPacket!;
      expect(packet.triggerType).toBe('RAPID_TAP_TAXI_RANK');
      expect(packet.matchedTaxiRank?.id).toBe('jhb_bree_rank');
      expect(packet.matchedTaxiRank?.name).toBe('Bree Street Taxi Rank');
      expect(packet.matchedTaxiRank?.policeStationName).toBe('Johannesburg Central SAPS');
      expect(packet.iceSmsText).toContain('Bree Street Taxi Rank');
      expect(packet.iceSmsText).toContain('Johannesburg Central SAPS');
    });

    it('tags distress packet correctly for Baragwanath Taxi Rank in Soweto', () => {
      const trigger = new TaxiRankRapidTrigger();
      const BARA_COORDS: Coordinates = { latitude: -26.2625, longitude: 27.9392 };

      trigger.recordTap(BARA_COORDS);
      vi.advanceTimersByTime(200);
      trigger.recordTap(BARA_COORDS);
      vi.advanceTimersByTime(200);
      const res = trigger.recordTap(BARA_COORDS);

      expect(res.triggered).toBe(true);
      expect(res.distressPacket?.matchedTaxiRank?.id).toBe('jhb_bara_rank');
      expect(res.distressPacket?.matchedTaxiRank?.policeStationName).toBe('Diepkloof SAPS');
    });

    it('does NOT trigger distress if 3 taps are spaced out over more than 2 seconds', () => {
      const trigger = new TaxiRankRapidTrigger();

      // Tap 1 at T=0
      trigger.recordTap(BREE_COORDS);
      // Tap 2 at T=1500ms
      vi.advanceTimersByTime(1500);
      trigger.recordTap(BREE_COORDS);
      // Tap 3 at T=3000ms (window between Tap 1 and Tap 3 is 3000ms > 2000ms)
      vi.advanceTimersByTime(1500);
      const res = trigger.recordTap(BREE_COORDS);

      // Only 2 taps remain in current window
      expect(res.triggered).toBe(false);
      expect(res.tapCount).toBe(2);
    });

    it('allows manual reset of rapid tap counter', () => {
      const trigger = new TaxiRankRapidTrigger();
      trigger.recordTap(BREE_COORDS);
      trigger.recordTap(BREE_COORDS);
      expect(trigger.getRecentTapCount()).toBe(2);

      trigger.reset();
      expect(trigger.getRecentTapCount()).toBe(0);
    });
  });
});
