/**
 * Umkhuseli - E-Hailing Route Corridor Sentinel
 * 
 * Provides real-time journey corridor deviation detection, high-hazard zone monitoring,
 * deadman timer escalation, synthesized fake incoming call generator, and emergency ICE broadcast payload formatting.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface VehicleTelemetry {
  latitude: number;
  longitude: number;
  heading?: number;      // degrees 0-360
  speed?: number;        // meters per second (m/s)
  accuracy?: number;     // meters
  timestamp: number;     // epoch ms
}

export interface HazardZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  riskLevel: 'HIGH' | 'CRITICAL';
  description?: string;
}

export type SentinelState = 
  | 'IDLE' 
  | 'MONITORING' 
  | 'DEVIATION_ALERT' 
  | 'DEADMAN_GRACE' 
  | 'DISPATCH_EMERGENCY';

export interface SentinelConfig {
  deviationDistanceThresholdMeters?: number; // default: 300 meters
  deviationTimeThresholdSeconds?: number;    // default: 60 seconds
  stationarySpeedThresholdMps?: number;     // default: 0.5 m/s (~1.8 km/h)
  hazardStopThresholdSeconds?: number;       // default: 120 seconds
  deadmanGraceSeconds?: number;              // default: 45 seconds
  autoTriggerFakeCall?: boolean;             // default: true
  hazardZones?: HazardZone[];
  duressPin?: string;                        // default: "9999"
  safePin?: string;                          // default: "8426"
}

export interface EmergencyDispatchPayload {
  alertId: string;
  timestamp: string;
  eventType: 'ROUTE_DEVIATION_EMERGENCY' | 'HAZARD_STOP_EMERGENCY' | 'DEADMAN_EXPIRED' | 'MANUAL_SOS' | 'DURESS_TRIGGER';
  origin: Coordinates;
  destination: Coordinates;
  currentLocation: Coordinates;
  telemetry: VehicleTelemetry;
  crossTrackErrorMeters: number;
  deviationDurationSeconds: number;
  inHazardZone: boolean;
  hazardZone?: HazardZone;
  googleMapsUrl: string;
  iceSmsText: string;
  dispatchPacket: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speedMps?: number;
    headingDeg?: number;
    areaName?: string;
    reason: string;
    isDuress: boolean;
    routeDeviationMeters: number;
  };
}

export const EARTH_RADIUS_METERS = 6371000;

// High-hazard hotspot zones across major SA urban centers
export const DEFAULT_SA_HAZARD_ZONES: HazardZone[] = [
  {
    id: "cpt_nyanga_transit",
    name: "Nyanga Transit Corridor",
    latitude: -33.9912,
    longitude: 18.5873,
    radiusMeters: 1200,
    riskLevel: "CRITICAL",
    description: "High-risk hijacking and route extortion hotspot."
  },
  {
    id: "cpt_borcherds_quarry",
    name: "N2 Borcherds Quarry Interchange",
    latitude: -33.9745,
    longitude: 18.5794,
    radiusMeters: 1000,
    riskLevel: "CRITICAL",
    description: "Identified stone-throwing and targeted ambush bypass."
  },
  {
    id: "jhb_m2_hostel_corridor",
    name: "M2 Cleveland / George Goch Hostel Corridor",
    latitude: -26.2163,
    longitude: 28.0931,
    radiusMeters: 1500,
    riskLevel: "HIGH",
    description: "Frequent stranded-commuter robbery hotspot."
  },
  {
    id: "jhb_golden_highway",
    name: "Golden Highway / Devland Intersection",
    latitude: -26.2844,
    longitude: 27.9171,
    radiusMeters: 1100,
    riskLevel: "HIGH",
    description: "Night-time forced off-road stopping zone."
  },
  {
    id: "dbn_berea_station_precinct",
    name: "Berea Station Outer Perimeter",
    latitude: -29.8542,
    longitude: 31.0118,
    radiusMeters: 800,
    riskLevel: "HIGH",
    description: "High-density opportunistic mugging and detour zone."
  }
];

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates great-circle distance between two coordinates in meters (Haversine formula).
 */
export function calculateDistanceMeters(p1: Coordinates, p2: Coordinates): number {
  const phi1 = toRadians(p1.latitude);
  const phi2 = toRadians(p2.latitude);
  const deltaPhi = toRadians(p2.latitude - p1.latitude);
  const deltaLambda = toRadians(p2.longitude - p1.longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates initial great-circle bearing from point 1 to point 2 in radians.
 */
export function calculateBearingRadians(p1: Coordinates, p2: Coordinates): number {
  const phi1 = toRadians(p1.latitude);
  const phi2 = toRadians(p2.latitude);
  const deltaLambda = toRadians(p2.longitude - p1.longitude);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return Math.atan2(y, x);
}

/**
 * Cross-Track Error (XTE) mathematical function:
 * 
 *   XTE = arcsin(sin(d13 / R) * sin(theta13 - theta12)) * R
 * 
 * Where:
 *   R = Earth's mean radius (6,371,000 meters)
 *   d13 = distance from origin (Point 1) to vehicle (Point 3)
 *   theta13 = bearing from origin (Point 1) to vehicle (Point 3)
 *   theta12 = bearing from origin (Point 1) to destination (Point 2)
 * 
 * Returns signed cross-track distance in meters:
 *   Positive = vehicle is to the right of the path
 *   Negative = vehicle is to the left of the path
 */
export function calculateCrossTrackError(
  origin: Coordinates,
  destination: Coordinates,
  vehicle: Coordinates
): number {
  const d13 = calculateDistanceMeters(origin, vehicle);
  const delta13 = d13 / EARTH_RADIUS_METERS; // angular distance in radians

  const theta13 = calculateBearingRadians(origin, vehicle);
  const theta12 = calculateBearingRadians(origin, destination);

  const sinXte = Math.sin(delta13) * Math.sin(theta13 - theta12);
  // Clamping to [-1, 1] to prevent NaN due to floating-point rounding
  const clampedSinXte = Math.max(-1, Math.min(1, sinXte));
  const xteRadians = Math.asin(clampedSinXte);

  return xteRadians * EARTH_RADIUS_METERS;
}

/**
 * WebAudio Synthesized Fake Incoming Call Generator
 * 
 * Creates an escape pretext for commuters in distress by generating:
 * 1. WebAudio dual-tone synthesized incoming call ringtone (440Hz + 480Hz cadence).
 * 2. Synthesized incoming voice dialog ("Hey, I see your ride pulling up, my brother and I are waiting at the gate for you").
 */
export class FakeCallGenerator {
  private audioContext: AudioContext | null = null;
  private ringOscillator1: OscillatorNode | null = null;
  private ringOscillator2: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private ringIntervalId: ReturnType<typeof setInterval> | null = null;
  private isRingingActive: boolean = false;
  private isCallConnected: boolean = false;

  public readonly dialogScript: string =
    "Hey, I see your ride pulling up, my brother and I are waiting at the gate for you.";

  private stateChangeListeners: Array<(state: 'IDLE' | 'RINGING' | 'CONNECTED' | 'ENDED') => void> = [];

  public onStateChange(listener: (state: 'IDLE' | 'RINGING' | 'CONNECTED' | 'ENDED') => void): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyState(state: 'IDLE' | 'RINGING' | 'CONNECTED' | 'ENDED') {
    for (const listener of this.stateChangeListeners) {
      try {
        listener(state);
      } catch {
        // Prevent listener failures from breaking state flow
      }
    }
  }

  public isRinging(): boolean {
    return this.isRingingActive;
  }

  public isInCall(): boolean {
    return this.isCallConnected;
  }

  /**
   * Starts synthesized fake incoming phone ringtone.
   */
  public startIncomingCall(): void {
    if (this.isRingingActive || this.isCallConnected) return;
    this.isRingingActive = true;
    this.notifyState('RINGING');

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.startRingtoneBeats();
      }
    } catch {
      // AudioContext unavailable or restricted by browser autoplay policy; state remains RINGING for UI
    }
  }

  private startRingtoneBeats(): void {
    if (!this.audioContext) return;

    const playBurst = () => {
      if (!this.audioContext || !this.isRingingActive) return;
      try {
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, this.audioContext.currentTime); // Standard US/SA dial/ring tone 1
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, this.audioContext.currentTime); // Tone 2

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 1.8);
        osc2.stop(this.audioContext.currentTime + 1.8);
      } catch {
        // Ignore audio playback error
      }
    };

    playBurst();
    this.ringIntervalId = setInterval(playBurst, 3500);
  }

  private stopRingtoneAudio(): void {
    if (this.ringIntervalId) {
      clearInterval(this.ringIntervalId);
      this.ringIntervalId = null;
    }
    if (this.ringOscillator1) {
      try { this.ringOscillator1.stop(); } catch { /* noop */ }
      this.ringOscillator1 = null;
    }
    if (this.ringOscillator2) {
      try { this.ringOscillator2.stop(); } catch { /* noop */ }
      this.ringOscillator2 = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch { /* noop */ }
      this.audioContext = null;
    }
  }

  /**
   * Accepts the fake incoming call and synthesizes/speaks the safety dialog.
   */
  public acceptCall(): void {
    if (!this.isRingingActive) return;
    this.stopRingtoneAudio();
    this.isRingingActive = false;
    this.isCallConnected = true;
    this.notifyState('CONNECTED');

    // Synthesize voice via SpeechSynthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(this.dialogScript);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          this.endCall();
        };
        utterance.onerror = () => {
          this.endCall();
        };
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback: auto end call after 6s
        setTimeout(() => this.endCall(), 6000);
      }
    } else {
      setTimeout(() => this.endCall(), 6000);
    }
  }

  /**
   * Declines or ends the fake call.
   */
  public declineCall(): void {
    this.stopRingtoneAudio();
    this.isRingingActive = false;
    this.isCallConnected = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    }
    this.notifyState('ENDED');
    this.notifyState('IDLE');
  }

  public endCall(): void {
    this.declineCall();
  }
}

/**
 * Route Corridor Sentinel Service
 * 
 * Manages journey monitoring, deviation detection, deadman escalation, and emergency payload generation.
 */
export class RouteCorridorSentinel {
  private origin: Coordinates | null = null;
  private destination: Coordinates | null = null;
  private state: SentinelState = 'IDLE';
  private config: Required<SentinelConfig>;
  private fakeCallGenerator: FakeCallGenerator;

  private lastTelemetry: VehicleTelemetry | null = null;
  private currentXteMeters: number = 0;

  // Timers and tracking timestamps
  private deviationStartTime: number | null = null;
  private hazardStopStartTime: number | null = null;
  private deadmanTimerId: ReturnType<typeof setTimeout> | null = null;
  private deadmanRemainingSeconds: number = 0;
  private deadmanIntervalId: ReturnType<typeof setInterval> | null = null;

  // Listeners
  private stateListeners: Array<(state: SentinelState) => void> = [];
  private alertListeners: Array<(alertType: string, message: string) => void> = [];
  private dispatchListeners: Array<(payload: EmergencyDispatchPayload) => void> = [];
  private deadmanTickListeners: Array<(secondsRemaining: number) => void> = [];

  constructor(config?: SentinelConfig) {
    this.config = {
      deviationDistanceThresholdMeters: config?.deviationDistanceThresholdMeters ?? 300,
      deviationTimeThresholdSeconds: config?.deviationTimeThresholdSeconds ?? 60,
      stationarySpeedThresholdMps: config?.stationarySpeedThresholdMps ?? 0.5,
      hazardStopThresholdSeconds: config?.hazardStopThresholdSeconds ?? 120,
      deadmanGraceSeconds: config?.deadmanGraceSeconds ?? 45,
      autoTriggerFakeCall: config?.autoTriggerFakeCall ?? true,
      hazardZones: config?.hazardZones ?? DEFAULT_SA_HAZARD_ZONES,
      duressPin: config?.duressPin ?? "9999",
      safePin: config?.safePin ?? "8426"
    };

    this.fakeCallGenerator = new FakeCallGenerator();
  }

  public getFakeCallGenerator(): FakeCallGenerator {
    return this.fakeCallGenerator;
  }

  public getState(): SentinelState {
    return this.state;
  }

  public getCurrentXte(): number {
    return this.currentXteMeters;
  }

  public getLastTelemetry(): VehicleTelemetry | null {
    return this.lastTelemetry;
  }

  public getDeadmanRemainingSeconds(): number {
    return this.deadmanRemainingSeconds;
  }

  public onStateChange(cb: (state: SentinelState) => void): () => void {
    this.stateListeners.push(cb);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== cb);
    };
  }

  public onAlert(cb: (alertType: string, message: string) => void): () => void {
    this.alertListeners.push(cb);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== cb);
    };
  }

  public onEmergencyDispatch(cb: (payload: EmergencyDispatchPayload) => void): () => void {
    this.dispatchListeners.push(cb);
    return () => {
      this.dispatchListeners = this.dispatchListeners.filter(l => l !== cb);
    };
  }

  public onDeadmanTick(cb: (secondsRemaining: number) => void): () => void {
    this.deadmanTickListeners.push(cb);
    return () => {
      this.deadmanTickListeners = this.deadmanTickListeners.filter(l => l !== cb);
    };
  }

  private setState(newState: SentinelState): void {
    if (this.state === newState) return;
    this.state = newState;
    for (const cb of this.stateListeners) {
      try { cb(newState); } catch { /* noop */ }
    }
  }

  private notifyAlert(alertType: string, message: string): void {
    for (const cb of this.alertListeners) {
      try { cb(alertType, message); } catch { /* noop */ }
    }
  }

  private notifyDispatch(payload: EmergencyDispatchPayload): void {
    for (const cb of this.dispatchListeners) {
      try { cb(payload); } catch { /* noop */ }
    }
  }

  /**
   * Starts route corridor monitoring from origin to destination.
   */
  public startJourney(origin: Coordinates, destination: Coordinates): void {
    this.origin = origin;
    this.destination = destination;
    this.deviationStartTime = null;
    this.hazardStopStartTime = null;
    this.clearDeadmanTimer();
    this.setState('MONITORING');
  }

  /**
   * Stops the active journey and returns sentinel to IDLE.
   */
  public stopJourney(): void {
    this.origin = null;
    this.destination = null;
    this.lastTelemetry = null;
    this.deviationStartTime = null;
    this.hazardStopStartTime = null;
    this.clearDeadmanTimer();
    this.fakeCallGenerator.endCall();
    this.setState('IDLE');
  }

  /**
   * Ingests real-time vehicle telemetry and performs XTE and hazard zone deviation checks.
   */
  public updateTelemetry(telemetry: VehicleTelemetry): {
    xteMeters: number;
    state: SentinelState;
    inHazardZone: boolean;
    hazardZone?: HazardZone;
  } {
    this.lastTelemetry = telemetry;

    if (this.state === 'IDLE' || !this.origin || !this.destination) {
      return { xteMeters: 0, state: this.state, inHazardZone: false };
    }

    // 1. Calculate XTE
    const xte = calculateCrossTrackError(this.origin, this.destination, {
      latitude: telemetry.latitude,
      longitude: telemetry.longitude
    });
    this.currentXteMeters = xte;
    const absDeviation = Math.abs(xte);

    // 2. Identify hazard zone proximity
    const matchedHazardZone = this.config.hazardZones.find(hz => {
      const dist = calculateDistanceMeters(
        { latitude: telemetry.latitude, longitude: telemetry.longitude },
        { latitude: hz.latitude, longitude: hz.longitude }
      );
      return dist <= hz.radiusMeters;
    });

    const inHazardZone = !!matchedHazardZone;

    // Only evaluate triggers if in MONITORING state
    if (this.state === 'MONITORING') {
      // Check 1: Route corridor deviation > 300m for > 60s
      if (absDeviation > this.config.deviationDistanceThresholdMeters) {
        if (!this.deviationStartTime) {
          this.deviationStartTime = telemetry.timestamp;
        } else {
          const durationSeconds = (telemetry.timestamp - this.deviationStartTime) / 1000;
          if (durationSeconds >= this.config.deviationTimeThresholdSeconds) {
            this.triggerDeviationAlert(
              'ROUTE_DEVIATION',
              `Vehicle deviated ${Math.round(absDeviation)}m from authorized corridor for ${Math.round(durationSeconds)}s.`
            );
            return { xteMeters: xte, state: this.state, inHazardZone, hazardZone: matchedHazardZone };
          }
        }
      } else {
        // Recovered back to corridor within threshold
        this.deviationStartTime = null;
      }

      // Check 2: Stationary stop in high-hazard zone > 120s
      if (inHazardZone) {
        const isStationary = telemetry.speed !== undefined
          ? telemetry.speed <= this.config.stationarySpeedThresholdMps
          : false;

        if (isStationary) {
          if (!this.hazardStopStartTime) {
            this.hazardStopStartTime = telemetry.timestamp;
          } else {
            const stopSeconds = (telemetry.timestamp - this.hazardStopStartTime) / 1000;
            if (stopSeconds >= this.config.hazardStopThresholdSeconds) {
              this.triggerDeviationAlert(
                'HAZARD_STOP',
                `Vehicle stationary in high-hazard zone (${matchedHazardZone.name}) for ${Math.round(stopSeconds)}s.`
              );
              return { xteMeters: xte, state: this.state, inHazardZone, hazardZone: matchedHazardZone };
            }
          }
        } else {
          this.hazardStopStartTime = null;
        }
      } else {
        this.hazardStopStartTime = null;
      }
    }

    return { xteMeters: xte, state: this.state, inHazardZone, hazardZone: matchedHazardZone };
  }

  /**
   * Triggers DEVIATION_ALERT and transitions immediately to DEADMAN_GRACE (45s).
   */
  public triggerDeviationAlert(alertType: string, message: string): void {
    this.setState('DEVIATION_ALERT');
    this.notifyAlert(alertType, message);

    if (this.config.autoTriggerFakeCall) {
      this.fakeCallGenerator.startIncomingCall();
    }

    // Automatically transition to DEADMAN_GRACE countdown
    this.startDeadmanGrace();
  }

  /**
   * Starts the 45-second deadman grace countdown before emergency dispatch.
   */
  public startDeadmanGrace(): void {
    this.clearDeadmanTimer();
    this.setState('DEADMAN_GRACE');
    this.deadmanRemainingSeconds = this.config.deadmanGraceSeconds;

    for (const cb of this.deadmanTickListeners) {
      try { cb(this.deadmanRemainingSeconds); } catch { /* noop */ }
    }

    this.deadmanIntervalId = setInterval(() => {
      this.deadmanRemainingSeconds -= 1;
      for (const cb of this.deadmanTickListeners) {
        try { cb(this.deadmanRemainingSeconds); } catch { /* noop */ }
      }

      if (this.deadmanRemainingSeconds <= 0) {
        this.clearDeadmanTimer();
        this.dispatchEmergency('DEADMAN_EXPIRED');
      }
    }, 1000);
  }

  private clearDeadmanTimer(): void {
    if (this.deadmanIntervalId) {
      clearInterval(this.deadmanIntervalId);
      this.deadmanIntervalId = null;
    }
    if (this.deadmanTimerId) {
      clearTimeout(this.deadmanTimerId);
      this.deadmanTimerId = null;
    }
    this.deadmanRemainingSeconds = 0;
  }

  /**
   * User acknowledges safety or enters PIN.
   * If duress PIN is entered, silently triggers immediate dispatch!
   */
  public acknowledgeSafe(pin?: string): boolean {
    if (pin && pin === this.config.duressPin) {
      // Duress PIN entered: deceptive dispatch
      this.dispatchEmergency('DURESS_TRIGGER');
      return false;
    }

    // Clear alert and return to monitoring
    this.clearDeadmanTimer();
    this.deviationStartTime = null;
    this.hazardStopStartTime = null;
    this.fakeCallGenerator.endCall();
    this.setState('MONITORING');
    return true;
  }

  /**
   * Manually dispatches emergency broadcast (e.g. SOS panic).
   */
  public manualPanic(): void {
    this.dispatchEmergency('MANUAL_SOS');
  }

  /**
   * Escalates to DISPATCH_EMERGENCY and generates formatted distress broadcast payload.
   */
  public dispatchEmergency(
    reason: 'ROUTE_DEVIATION_EMERGENCY' | 'HAZARD_STOP_EMERGENCY' | 'DEADMAN_EXPIRED' | 'MANUAL_SOS' | 'DURESS_TRIGGER' = 'DEADMAN_EXPIRED'
  ): EmergencyDispatchPayload {
    this.clearDeadmanTimer();
    this.fakeCallGenerator.endCall();
    this.setState('DISPATCH_EMERGENCY');

    const payload = this.generateDistressPayload(reason);
    this.notifyDispatch(payload);
    return payload;
  }

  /**
   * Distress Payload Generator:
   * Generates formatted emergency payload containing vehicle telemetry, deviation offset, and GPS coordinates ready for ICE broadcast.
   */
  public generateDistressPayload(
    eventType: 'ROUTE_DEVIATION_EMERGENCY' | 'HAZARD_STOP_EMERGENCY' | 'DEADMAN_EXPIRED' | 'MANUAL_SOS' | 'DURESS_TRIGGER' = 'DEADMAN_EXPIRED'
  ): EmergencyDispatchPayload {
    const defaultCoords: Coordinates = { latitude: -26.2041, longitude: 28.0473 }; // Johannesburg central fallback
    const originCoords = this.origin || defaultCoords;
    const destCoords = this.destination || defaultCoords;
    const currentCoords: Coordinates = this.lastTelemetry
      ? { latitude: this.lastTelemetry.latitude, longitude: this.lastTelemetry.longitude }
      : destCoords;

    const matchedHazardZone = this.config.hazardZones.find(hz => {
      const dist = calculateDistanceMeters(currentCoords, { latitude: hz.latitude, longitude: hz.longitude });
      return dist <= hz.radiusMeters;
    });

    const lat = currentCoords.latitude.toFixed(6);
    const lon = currentCoords.longitude.toFixed(6);
    const googleMapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
    const xteRounded = Math.round(Math.abs(this.currentXteMeters));
    const speedKmh = this.lastTelemetry?.speed ? Math.round(this.lastTelemetry.speed * 3.6) : 0;
    const isDuress = eventType === 'DURESS_TRIGGER';

    const iceSmsText = `[UMKHUSELI GBV/SOS ALERT] Urgent: Route Corridor Breached!\n` +
      `Deviation: ${xteRounded}m off track.\n` +
      `Speed: ${speedKmh} km/h | Heading: ${this.lastTelemetry?.heading ?? 'N/A'}°.\n` +
      (matchedHazardZone ? `HAZARD ZONE: ${matchedHazardZone.name} (${matchedHazardZone.riskLevel})\n` : '') +
      `Live Location: ${googleMapsUrl}\n` +
      `Status: E-Hailing Passenger Deadman Expired. Police Ob Requested.`;

    const payload: EmergencyDispatchPayload = {
      alertId: `SENTINEL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      eventType,
      origin: originCoords,
      destination: destCoords,
      currentLocation: currentCoords,
      telemetry: this.lastTelemetry || {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        timestamp: Date.now()
      },
      crossTrackErrorMeters: this.currentXteMeters,
      deviationDurationSeconds: this.deviationStartTime
        ? Math.round((Date.now() - this.deviationStartTime) / 1000)
        : 0,
      inHazardZone: !!matchedHazardZone,
      hazardZone: matchedHazardZone,
      googleMapsUrl,
      iceSmsText,
      dispatchPacket: {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        accuracy: this.lastTelemetry?.accuracy,
        speedMps: this.lastTelemetry?.speed,
        headingDeg: this.lastTelemetry?.heading,
        areaName: matchedHazardZone?.name || 'Urban Transit Corridor',
        reason: eventType,
        isDuress,
        routeDeviationMeters: xteRounded
      }
    };

    return payload;
  }
}
