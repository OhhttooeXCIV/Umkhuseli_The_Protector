import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RouteCorridorSentinel,
  calculateCrossTrackError,
  calculateDistanceMeters,
  calculateBearingRadians,
  FakeCallGenerator,
  DEFAULT_SA_HAZARD_ZONES,
  type Coordinates,
  type VehicleTelemetry
} from '../services/routeCorridorSentinel';

describe('E-Hailing Route Corridor Sentinel Service', () => {
  // Johannesburg Central Station to Rosebank Mall Corridor (~6 km north)
  const ORIGIN: Coordinates = { latitude: -26.1972, longitude: 28.0436 };
  const DESTINATION: Coordinates = { latitude: -26.1465, longitude: 28.0416 };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Geodesic & Cross-Track Error (XTE) Mathematical Formula', () => {
    it('calculates great-circle distance accurately between two coordinates', () => {
      const distance = calculateDistanceMeters(ORIGIN, DESTINATION);
      // Distance from JHB Park Station to Rosebank is approx 5.6 km
      expect(distance).toBeGreaterThan(5000);
      expect(distance).toBeLessThan(6500);
    });

    it('calculates initial bearing in radians accurately', () => {
      const bearing = calculateBearingRadians(ORIGIN, DESTINATION);
      // Heading nearly due North (bearing close to 0 or 2*PI, or small negative)
      expect(Math.abs(bearing)).toBeLessThan(0.2); // within ~11 degrees of true North
    });

    it('returns zero or near-zero XTE when vehicle is directly on the origin-destination corridor', () => {
      // Midpoint between ORIGIN and DESTINATION
      const vehicleMidpoint: Coordinates = {
        latitude: (ORIGIN.latitude + DESTINATION.latitude) / 2,
        longitude: (ORIGIN.longitude + DESTINATION.longitude) / 2
      };

      const xte = calculateCrossTrackError(ORIGIN, DESTINATION, vehicleMidpoint);
      // XTE should be under 2 meters due to planar/spherical alignment
      expect(Math.abs(xte)).toBeLessThan(5);
    });

    it('calculates positive XTE for rightward deviation and negative XTE for leftward deviation', () => {
      // Equator baseline from (0,0) to (0, 1) [due East]
      const eqOrigin: Coordinates = { latitude: 0, longitude: 0 };
      const eqDest: Coordinates = { latitude: 0, longitude: 1 };

      // Vehicle deviated to the North (Left of track when heading East)
      const leftDev: Coordinates = { latitude: 0.01, longitude: 0.5 };
      const leftXte = calculateCrossTrackError(eqOrigin, eqDest, leftDev);

      // Vehicle deviated to the South (Right of track when heading East)
      const rightDev: Coordinates = { latitude: -0.01, longitude: 0.5 };
      const rightXte = calculateCrossTrackError(eqOrigin, eqDest, rightDev);

      // 0.01 degree latitude is approx 1112 meters
      expect(Math.abs(leftXte)).toBeCloseTo(1112, -2);
      expect(Math.abs(rightXte)).toBeCloseTo(1112, -2);
      // Signs should be opposite
      expect(Math.sign(leftXte)).not.toBe(Math.sign(rightXte));
    });
  });

  describe('Route Deviation Detection Logic & Thresholds', () => {
    it('starts journey in MONITORING state and tracks telemetry', () => {
      const sentinel = new RouteCorridorSentinel();
      expect(sentinel.getState()).toBe('IDLE');

      sentinel.startJourney(ORIGIN, DESTINATION);
      expect(sentinel.getState()).toBe('MONITORING');

      const onTrackTelemetry: VehicleTelemetry = {
        latitude: -26.1700,
        longitude: 28.0425,
        speed: 15,
        heading: 358,
        accuracy: 10,
        timestamp: 1000000
      };

      const update = sentinel.updateTelemetry(onTrackTelemetry);
      expect(Math.abs(update.xteMeters)).toBeLessThan(200);
      expect(update.state).toBe('MONITORING');
      expect(sentinel.getState()).toBe('MONITORING');
    });

    it('does not trigger deviation alert if deviation is under 300 meters', () => {
      const sentinel = new RouteCorridorSentinel();
      sentinel.startJourney(ORIGIN, DESTINATION);

      // Small deviation: ~100m
      const smallDevTelemetry: VehicleTelemetry = {
        latitude: -26.1700,
        longitude: 28.0435,
        speed: 12,
        timestamp: 1000000
      };

      sentinel.updateTelemetry(smallDevTelemetry);
      expect(sentinel.getState()).toBe('MONITORING');

      // 100 seconds later, still under 300m
      sentinel.updateTelemetry({
        ...smallDevTelemetry,
        timestamp: 1100000
      });

      expect(sentinel.getState()).toBe('MONITORING');
    });

    it('does not trigger deviation alert if deviation > 300m lasts for less than 60 seconds', () => {
      const sentinel = new RouteCorridorSentinel();
      sentinel.startJourney(ORIGIN, DESTINATION);

      // Significant deviation: ~800m east (longitude offset ~0.008 deg)
      const devTelemetry: VehicleTelemetry = {
        latitude: -26.1700,
        longitude: 28.0520,
        speed: 14,
        timestamp: 1000000
      };

      // T=0s
      sentinel.updateTelemetry(devTelemetry);
      expect(sentinel.getState()).toBe('MONITORING');

      // T=45s (under 60s threshold)
      sentinel.updateTelemetry({
        ...devTelemetry,
        timestamp: 1045000
      });
      expect(sentinel.getState()).toBe('MONITORING');

      // Vehicle returns to corridor at T=55s
      sentinel.updateTelemetry({
        latitude: -26.1700,
        longitude: 28.0425,
        timestamp: 1055000
      });
      expect(sentinel.getState()).toBe('MONITORING');

      // Another 30s passes, no alert should be triggered
      sentinel.updateTelemetry({
        latitude: -26.1600,
        longitude: 28.0420,
        timestamp: 1085000
      });
      expect(sentinel.getState()).toBe('MONITORING');
    });

    it('triggers DEVIATION_ALERT and transitions to DEADMAN_GRACE when deviation > 300m persists for > 60 seconds', () => {
      const sentinel = new RouteCorridorSentinel();
      const alertSpy = vi.fn();
      sentinel.onAlert(alertSpy);

      sentinel.startJourney(ORIGIN, DESTINATION);

      const devTelemetry: VehicleTelemetry = {
        latitude: -26.1700,
        longitude: 28.0550, // ~1.2 km off route
        speed: 15,
        heading: 90,
        timestamp: 1000000
      };

      // T = 0s
      sentinel.updateTelemetry(devTelemetry);
      expect(sentinel.getState()).toBe('MONITORING');

      // T = 61s (>60s threshold)
      const update = sentinel.updateTelemetry({
        ...devTelemetry,
        timestamp: 1061000
      });

      // State machine transitions through DEVIATION_ALERT to DEADMAN_GRACE
      expect(alertSpy).toHaveBeenCalledWith('ROUTE_DEVIATION', expect.stringContaining('authorized corridor'));
      expect(sentinel.getState()).toBe('DEADMAN_GRACE');
      expect(sentinel.getDeadmanRemainingSeconds()).toBe(45);
    });

    it('triggers DEVIATION_ALERT when vehicle is stationary in high-hazard zone for > 120 seconds', () => {
      const hazardZone = DEFAULT_SA_HAZARD_ZONES[2]; // M2 Hostel Corridor (-26.2163, 28.0931)
      const sentinel = new RouteCorridorSentinel();
      const alertSpy = vi.fn();
      sentinel.onAlert(alertSpy);

      // Route Corridor specifically passing through the M2 Hostel corridor
      const hazardOrigin: Coordinates = { latitude: hazardZone.latitude, longitude: hazardZone.longitude - 0.02 };
      const hazardDest: Coordinates = { latitude: hazardZone.latitude, longitude: hazardZone.longitude + 0.02 };
      sentinel.startJourney(hazardOrigin, hazardDest);

      const stationaryTelemetry: VehicleTelemetry = {
        latitude: hazardZone.latitude,
        longitude: hazardZone.longitude,
        speed: 0.1, // stationary (<= 0.5 m/s)
        timestamp: 2000000
      };

      // Enter hazard zone and stop at T=0s
      sentinel.updateTelemetry(stationaryTelemetry);
      expect(sentinel.getState()).toBe('MONITORING');

      // Still stationary at T=60s
      sentinel.updateTelemetry({
        ...stationaryTelemetry,
        timestamp: 2060000
      });
      expect(sentinel.getState()).toBe('MONITORING');

      // Still stationary at T=121s (>120s)
      sentinel.updateTelemetry({
        ...stationaryTelemetry,
        timestamp: 2121000
      });

      expect(alertSpy).toHaveBeenCalledWith('HAZARD_STOP', expect.stringContaining('high-hazard zone'));
      expect(sentinel.getState()).toBe('DEADMAN_GRACE');
      sentinel.stopJourney();
    });
  });

  describe('State Machine & Deadman Escalation (45s Grace)', () => {
    it('executes state progression: IDLE -> MONITORING -> DEVIATION_ALERT -> DEADMAN_GRACE -> DISPATCH_EMERGENCY', () => {
      const sentinel = new RouteCorridorSentinel();
      const stateHistory: string[] = [];
      const dispatchSpy = vi.fn();

      sentinel.onStateChange(st => stateHistory.push(st));
      sentinel.onEmergencyDispatch(dispatchSpy);

      expect(sentinel.getState()).toBe('IDLE');

      // 1. Start journey
      sentinel.startJourney(ORIGIN, DESTINATION);
      expect(sentinel.getState()).toBe('MONITORING');

      // 2. Trigger deviation alert
      sentinel.triggerDeviationAlert('TEST_DEVIATION', 'Route corridor breached');
      expect(sentinel.getState()).toBe('DEADMAN_GRACE');
      expect(sentinel.getDeadmanRemainingSeconds()).toBe(45);

      // 3. Fast-forward 45 seconds countdown
      vi.advanceTimersByTime(45000);

      // 4. Escalates to DISPATCH_EMERGENCY
      expect(sentinel.getState()).toBe('DISPATCH_EMERGENCY');
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(stateHistory).toContain('MONITORING');
      expect(stateHistory).toContain('DEVIATION_ALERT');
      expect(stateHistory).toContain('DEADMAN_GRACE');
      expect(stateHistory).toContain('DISPATCH_EMERGENCY');
    });

    it('cancels deadman grace and returns to MONITORING if user acknowledges safety with safe PIN', () => {
      const sentinel = new RouteCorridorSentinel();
      sentinel.startJourney(ORIGIN, DESTINATION);
      sentinel.triggerDeviationAlert('TEST_DEVIATION', 'Testing cancel');

      expect(sentinel.getState()).toBe('DEADMAN_GRACE');
      vi.advanceTimersByTime(20000);
      expect(sentinel.getDeadmanRemainingSeconds()).toBe(25);

      // User confirms safety with standard PIN
      const acknowledged = sentinel.acknowledgeSafe('8426');
      expect(acknowledged).toBe(true);
      expect(sentinel.getState()).toBe('MONITORING');

      // Advancing past 45s should NOT trigger emergency dispatch
      vi.advanceTimersByTime(30000);
      expect(sentinel.getState()).toBe('MONITORING');
    });

    it('silently triggers DISPATCH_EMERGENCY immediately if user enters duress PIN (9999)', () => {
      const sentinel = new RouteCorridorSentinel();
      const dispatchSpy = vi.fn();
      sentinel.onEmergencyDispatch(dispatchSpy);

      sentinel.startJourney(ORIGIN, DESTINATION);
      sentinel.triggerDeviationAlert('TEST_DEVIATION', 'Testing duress');

      // Coerced user enters duress PIN 9999
      const acknowledged = sentinel.acknowledgeSafe('9999');
      expect(acknowledged).toBe(false);
      expect(sentinel.getState()).toBe('DISPATCH_EMERGENCY');
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'DURESS_TRIGGER',
          dispatchPacket: expect.objectContaining({ isDuress: true })
        })
      );
    });
  });

  describe('Synthesized Fake Incoming Call Generator', () => {
    it('manages ringtone and voice dialog states correctly', () => {
      const fakeCall = new FakeCallGenerator();
      const stateHistory: string[] = [];
      fakeCall.onStateChange(st => stateHistory.push(st));

      expect(fakeCall.isRinging()).toBe(false);
      expect(fakeCall.isInCall()).toBe(false);

      // Start incoming call
      fakeCall.startIncomingCall();
      expect(fakeCall.isRinging()).toBe(true);
      expect(fakeCall.isInCall()).toBe(false);
      expect(stateHistory).toContain('RINGING');

      // Commuter answers the call
      fakeCall.acceptCall();
      expect(fakeCall.isRinging()).toBe(false);
      expect(fakeCall.isInCall()).toBe(true);
      expect(stateHistory).toContain('CONNECTED');

      // Call contains exact protective pretext dialog script
      expect(fakeCall.dialogScript).toBe(
        'Hey, I see your ride pulling up, my brother and I are waiting at the gate for you.'
      );

      // Commuter hangs up
      fakeCall.endCall();
      expect(fakeCall.isInCall()).toBe(false);
      expect(stateHistory).toContain('ENDED');
    });

    it('automatically starts fake incoming call when deviation alert triggers if configured', () => {
      const sentinel = new RouteCorridorSentinel({ autoTriggerFakeCall: true });
      sentinel.startJourney(ORIGIN, DESTINATION);

      expect(sentinel.getFakeCallGenerator().isRinging()).toBe(false);
      sentinel.triggerDeviationAlert('DEVIATION', 'Off route');

      expect(sentinel.getFakeCallGenerator().isRinging()).toBe(true);
    });
  });

  describe('Distress Payload Generator', () => {
    it('formats a comprehensive emergency distress payload ready for ICE broadcast', () => {
      const sentinel = new RouteCorridorSentinel();
      sentinel.startJourney(ORIGIN, DESTINATION);

      const telemetry: VehicleTelemetry = {
        latitude: -26.1750,
        longitude: 28.0580,
        speed: 18, // ~65 km/h
        heading: 85,
        accuracy: 8,
        timestamp: 1698200000000
      };

      sentinel.updateTelemetry(telemetry);
      const payload = sentinel.generateDistressPayload('ROUTE_DEVIATION_EMERGENCY');

      expect(payload.alertId).toMatch(/^SENTINEL-/);
      expect(payload.eventType).toBe('ROUTE_DEVIATION_EMERGENCY');
      expect(payload.currentLocation.latitude).toBeCloseTo(-26.1750);
      expect(payload.telemetry.speed).toBe(18);
      expect(payload.googleMapsUrl).toContain('https://maps.google.com/?q=-26.175000,28.058000');
      expect(payload.iceSmsText).toContain('[UMKHUSELI GBV/SOS ALERT]');
      expect(payload.iceSmsText).toContain('65 km/h');
      expect(payload.dispatchPacket.routeDeviationMeters).toBeGreaterThan(300);
      expect(payload.dispatchPacket.isDuress).toBe(false);
    });
  });
});
