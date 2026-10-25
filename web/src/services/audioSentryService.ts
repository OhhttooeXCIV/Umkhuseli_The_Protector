/**
 * Umkhuseli - Ambient Audio Sentry & Commuter Safe-Walk Sentinel
 * 
 * Provides:
 * 1. Audio distress analyzer (circular buffer, acoustic decibel spike >80dB, human scream/struggle signature).
 * 2. Safe-Walk corridor checkpoint timer with 60s deadman grace escalation.
 * 3. Township Taxi Rank rapid 3-tap panic trigger tagged with SA geofences.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TaxiRankGeofence {
  id: string;
  name: string;
  townshipOrArea: string;
  province: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  policeStationName: string;
  policeStationContact: string;
}

export interface AudioDistressFrame {
  timestamp: number;
  decibels: number;
  peakFrequencyHz: number;
  screamEnergyRatio: number;
  isDistressSignature: boolean;
}

export interface AudioSentryConfig {
  decibelThreshold?: number;           // default: 80 dB
  screamMinFrequencyHz?: number;       // default: 1500 Hz
  screamMaxFrequencyHz?: number;       // default: 4000 Hz
  consecutiveSustainedFrames?: number; // default: 3 consecutive frames
  sampleRate?: number;                 // default: 44100
  fftSize?: number;                    // default: 1024
  bufferSize?: number;                 // default: 30
}

export interface SafeWalkConfig {
  destinationName: string;
  totalDurationMinutes: number;         // e.g. 15 minutes
  checkpointIntervalMinutes: number;    // e.g. 5 minutes
  gracePeriodSeconds?: number;          // default: 60 seconds
  duressPin?: string;                   // default: "9999"
  startCoords?: Coordinates;
}

export type SafeWalkState = 
  | 'IDLE' 
  | 'WALKING' 
  | 'CHECKPOINT_PENDING' 
  | 'GRACE_PERIOD' 
  | 'ESCALATED_DISTRESS' 
  | 'COMPLETED';

export interface TaxiRankDistressPacket {
  alertId: string;
  timestamp: string;
  triggerType: 'RAPID_TAP_TAXI_RANK';
  tapCount: number;
  windowDurationMs: number;
  userCoords?: Coordinates;
  matchedTaxiRank?: TaxiRankGeofence;
  nearestDistanceMeters?: number;
  message: string;
  iceSmsText: string;
  dispatchPacket: {
    latitude?: number;
    longitude?: number;
    areaName: string;
    reason: string;
    isDuress: boolean;
  };
}

export interface SafeWalkEscalationPayload {
  alertId: string;
  timestamp: string;
  reason: 'MISSED_CHECKPOINT_GRACE_EXPIRED' | 'DURESS_PIN_SUBMITTED' | 'MANUAL_PANIC';
  destinationName: string;
  checkpointIndex: number;
  elapsedMinutes: number;
  lastKnownCoords?: Coordinates;
  iceSmsText: string;
  dispatchPacket: {
    latitude?: number;
    longitude?: number;
    areaName: string;
    reason: string;
    isDuress: boolean;
  };
}

// Major South African Township & Commuter Taxi Rank Geofences
export const SA_TOWNSHIP_TAXI_RANKS: TaxiRankGeofence[] = [
  {
    id: "jhb_bree_rank",
    name: "Bree Street Taxi Rank",
    townshipOrArea: "Johannesburg CBD",
    province: "Gauteng",
    latitude: -26.2001,
    longitude: 28.0378,
    radiusMeters: 600,
    policeStationName: "Johannesburg Central SAPS",
    policeStationContact: "0114977000"
  },
  {
    id: "jhb_noord_rank",
    name: "MTN Noord Taxi Rank",
    townshipOrArea: "Johannesburg CBD / Joubert Park",
    province: "Gauteng",
    latitude: -26.1972,
    longitude: 28.0436,
    radiusMeters: 600,
    policeStationName: "Hillbrow SAPS",
    policeStationContact: "0114886511"
  },
  {
    id: "jhb_bara_rank",
    name: "Baragwanath Taxi Rank",
    townshipOrArea: "Diepkloof / Soweto",
    province: "Gauteng",
    latitude: -26.2625,
    longitude: 27.9392,
    radiusMeters: 750,
    policeStationName: "Diepkloof SAPS",
    policeStationContact: "0119337400"
  },
  {
    id: "cpt_dunoon_rank",
    name: "Dunoon Taxi Rank",
    townshipOrArea: "Dunoon / Table View",
    province: "Western Cape",
    latitude: -33.8214,
    longitude: 18.5367,
    radiusMeters: 500,
    policeStationName: "Table View SAPS",
    policeStationContact: "0215214400"
  },
  {
    id: "cpt_khayelitsha_site_c",
    name: "Site C Taxi Rank",
    townshipOrArea: "Khayelitsha",
    province: "Western Cape",
    latitude: -34.0152,
    longitude: 18.6655,
    radiusMeters: 600,
    policeStationName: "Site B / Khayelitsha SAPS",
    policeStationContact: "0213602400"
  },
  {
    id: "dbn_umlazi_megacity",
    name: "Umlazi Mega City Taxi Rank",
    townshipOrArea: "Umlazi",
    province: "KwaZulu-Natal",
    latitude: -29.9678,
    longitude: 30.9385,
    radiusMeters: 700,
    policeStationName: "Umlazi SAPS",
    policeStationContact: "0319080034"
  },
  {
    id: "cpt_mitchells_plain",
    name: "Mitchells Plain Town Centre Taxi Rank",
    townshipOrArea: "Mitchells Plain",
    province: "Western Cape",
    latitude: -34.0504,
    longitude: 18.6258,
    radiusMeters: 650,
    policeStationName: "Mitchells Plain SAPS",
    policeStationContact: "0213701600"
  },
  {
    id: "pta_marabastad",
    name: "Marabastad Belle Ombre Taxi Rank",
    townshipOrArea: "Tshwane / Pretoria",
    province: "Gauteng",
    latitude: -25.7369,
    longitude: 28.1824,
    radiusMeters: 600,
    policeStationName: "Pretoria Central SAPS",
    policeStationContact: "0123534000"
  }
];

function haversineDistanceMeters(p1: Coordinates, p2: Coordinates): number {
  const R = 6371000;
  const phi1 = (p1.latitude * Math.PI) / 180;
  const phi2 = (p2.latitude * Math.PI) / 180;
  const dPhi = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dLam = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Audio Distress Analyzer
 * 
 * Samples mic input into a rolling circular buffer. Detects acoustic decibel spikes (>80dB)
 * combined with high-frequency pitch signatures (screaming/struggling: 1.5kHz - 4kHz).
 */
export class AudioDistressAnalyzer {
  private config: Required<AudioSentryConfig>;
  private circularBuffer: AudioDistressFrame[] = [];
  private consecutiveSpikes: number = 0;
  private isListeningActive: boolean = false;
  private isMicrophoneLive: boolean = false;

  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sampleIntervalId: ReturnType<typeof setInterval> | null = null;

  private distressListeners: Array<(frame: AudioDistressFrame, sustainedCount: number) => void> = [];

  constructor(config?: AudioSentryConfig) {
    this.config = {
      decibelThreshold: config?.decibelThreshold ?? 80,
      screamMinFrequencyHz: config?.screamMinFrequencyHz ?? 1500,
      screamMaxFrequencyHz: config?.screamMaxFrequencyHz ?? 4000,
      consecutiveSustainedFrames: config?.consecutiveSustainedFrames ?? 3,
      sampleRate: config?.sampleRate ?? 44100,
      fftSize: config?.fftSize ?? 1024,
      bufferSize: config?.bufferSize ?? 30
    };
  }

  public onDistressDetected(cb: (frame: AudioDistressFrame, sustainedCount: number) => void): () => void {
    this.distressListeners.push(cb);
    return () => {
      this.distressListeners = this.distressListeners.filter(l => l !== cb);
    };
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  public isMicActive(): boolean {
    return this.isMicrophoneLive;
  }

  public getRecentFrames(): AudioDistressFrame[] {
    return [...this.circularBuffer];
  }

  /**
   * Starts ambient acoustic monitoring. Gracefully falls back to simulation mode
   * if mic permission is denied or running in a test/mock environment.
   */
  public async startListening(): Promise<boolean> {
    if (this.isListeningActive) return true;
    this.isListeningActive = true;
    this.consecutiveSpikes = 0;

    try {
      if (
        typeof window !== 'undefined' &&
        navigator?.mediaDevices?.getUserMedia &&
        (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      ) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx();
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = this.config.fftSize;
        source.connect(this.analyserNode);

        this.isMicrophoneLive = true;

        const timeData = new Float32Array(this.analyserNode.fftSize);
        const freqData = new Uint8Array(this.analyserNode.frequencyBinCount);

        this.sampleIntervalId = setInterval(() => {
          if (!this.analyserNode) return;
          this.analyserNode.getFloatTimeDomainData(timeData);
          this.analyserNode.getByteFrequencyData(freqData);
          this.processAudioData(timeData, freqData);
        }, 100);

        return true;
      }
    } catch {
      // Microphone denied or AudioContext unavailable - fallback mock active
      this.isMicrophoneLive = false;
    }

    // Graceful fallback mode
    return false;
  }

  public stopListening(): void {
    if (this.sampleIntervalId) {
      clearInterval(this.sampleIntervalId);
      this.sampleIntervalId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch { /* noop */ }
      this.audioContext = null;
    }
    this.isListeningActive = false;
    this.isMicrophoneLive = false;
    this.consecutiveSpikes = 0;
  }

  /**
   * Processes time-domain and frequency data frame and computes RMS decibels
   * and scream frequency energy signature.
   */
  public processAudioData(timeData: Float32Array, freqData: Uint8Array): AudioDistressFrame {
    // 1. Calculate RMS and estimated decibels
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      sumSquares += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sumSquares / Math.max(1, timeData.length));
    // Calibrated dB estimation: silence ~30dB, shouting/screaming >80dB
    const decibels = Math.max(0, Math.min(130, Math.round(20 * Math.log10(rms + 1e-5) + 100)));

    // 2. Frequency analysis
    const binCount = freqData.length;
    const binWidth = (this.config.sampleRate / 2) / binCount;
    let maxVal = -1;
    let peakBin = 0;
    let screamEnergy = 0;
    let totalEnergy = 0;

    const minBin = Math.floor(this.config.screamMinFrequencyHz / binWidth);
    const maxBin = Math.ceil(this.config.screamMaxFrequencyHz / binWidth);

    for (let i = 0; i < binCount; i++) {
      const mag = freqData[i];
      totalEnergy += mag;
      if (mag > maxVal) {
        maxVal = mag;
        peakBin = i;
      }
      if (i >= minBin && i <= maxBin) {
        screamEnergy += mag;
      }
    }

    const peakFrequencyHz = Math.round(peakBin * binWidth);
    const screamEnergyRatio = totalEnergy > 0 ? screamEnergy / totalEnergy : 0;

    // Distress heuristic: decibels > 80dB AND high-frequency pitch spikes in scream band (1.5kHz - 4kHz)
    const isScreamSignature =
      decibels >= this.config.decibelThreshold &&
      (peakFrequencyHz >= this.config.screamMinFrequencyHz && peakFrequencyHz <= this.config.screamMaxFrequencyHz || screamEnergyRatio > 0.35);

    const frame: AudioDistressFrame = {
      timestamp: Date.now(),
      decibels,
      peakFrequencyHz,
      screamEnergyRatio: Math.round(screamEnergyRatio * 100) / 100,
      isDistressSignature: isScreamSignature
    };

    // Rolling circular buffer update
    this.circularBuffer.push(frame);
    if (this.circularBuffer.length > this.config.bufferSize) {
      this.circularBuffer.shift();
    }

    // Evaluate sustained spikes
    if (isScreamSignature) {
      this.consecutiveSpikes += 1;
      if (this.consecutiveSpikes >= this.config.consecutiveSustainedFrames) {
        this.notifyDistress(frame, this.consecutiveSpikes);
      }
    } else {
      this.consecutiveSpikes = 0;
    }

    return frame;
  }

  /**
   * Directly feeds a simulated audio frame for unit testing and deterministic checks.
   */
  public feedFrameForTesting(decibels: number, peakFrequencyHz: number): AudioDistressFrame {
    const isScream =
      decibels >= this.config.decibelThreshold &&
      peakFrequencyHz >= this.config.screamMinFrequencyHz &&
      peakFrequencyHz <= this.config.screamMaxFrequencyHz;

    const frame: AudioDistressFrame = {
      timestamp: Date.now(),
      decibels,
      peakFrequencyHz,
      screamEnergyRatio: isScream ? 0.65 : 0.1,
      isDistressSignature: isScream
    };

    this.circularBuffer.push(frame);
    if (this.circularBuffer.length > this.config.bufferSize) {
      this.circularBuffer.shift();
    }

    if (isScream) {
      this.consecutiveSpikes += 1;
      if (this.consecutiveSpikes >= this.config.consecutiveSustainedFrames) {
        this.notifyDistress(frame, this.consecutiveSpikes);
      }
    } else {
      this.consecutiveSpikes = 0;
    }

    return frame;
  }

  private notifyDistress(frame: AudioDistressFrame, count: number): void {
    for (const listener of this.distressListeners) {
      try { listener(frame, count); } catch { /* noop */ }
    }
  }
}

/**
 * Safe-Walk Corridor Checkpoint Timer
 * 
 * Protects commuters walking alone from taxi ranks or transit hubs to home.
 * Users set journey duration (e.g. 15 mins) and checkpoint cadence (e.g. every 5 mins).
 * Automated escalation triggers if checkpoint missed within 60s grace period.
 */
export class SafeWalkSentinel {
  private config: Required<SafeWalkConfig> | null = null;
  private state: SafeWalkState = 'IDLE';
  private currentCheckpointIndex: number = 0;
  private walkStartTime: number = 0;
  private lastKnownCoords: Coordinates | undefined = undefined;

  // Timers
  private checkpointTimerId: ReturnType<typeof setTimeout> | null = null;
  private graceIntervalId: ReturnType<typeof setInterval> | null = null;
  private remainingGraceSeconds: number = 60;

  // Listeners
  private stateListeners: Array<(state: SafeWalkState) => void> = [];
  private checkpointPendingListeners: Array<(checkpointIndex: number, graceSeconds: number) => void> = [];
  private graceTickListeners: Array<(remainingGraceSeconds: number) => void> = [];
  private escalationListeners: Array<(payload: SafeWalkEscalationPayload) => void> = [];

  public getState(): SafeWalkState {
    return this.state;
  }

  public getRemainingGraceSeconds(): number {
    return this.remainingGraceSeconds;
  }

  public getCheckpointIndex(): number {
    return this.currentCheckpointIndex;
  }

  public onStateChange(cb: (state: SafeWalkState) => void): () => void {
    this.stateListeners.push(cb);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== cb);
    };
  }

  public onCheckpointRequired(cb: (checkpointIndex: number, graceSeconds: number) => void): () => void {
    this.checkpointPendingListeners.push(cb);
    return () => {
      this.checkpointPendingListeners = this.checkpointPendingListeners.filter(l => l !== cb);
    };
  }

  public onGraceTick(cb: (remainingGraceSeconds: number) => void): () => void {
    this.graceTickListeners.push(cb);
    return () => {
      this.graceTickListeners = this.graceTickListeners.filter(l => l !== cb);
    };
  }

  public onDistressEscalation(cb: (payload: SafeWalkEscalationPayload) => void): () => void {
    this.escalationListeners.push(cb);
    return () => {
      this.escalationListeners = this.escalationListeners.filter(l => l !== cb);
    };
  }

  private setState(newState: SafeWalkState): void {
    if (this.state === newState) return;
    this.state = newState;
    for (const cb of this.stateListeners) {
      try { cb(newState); } catch { /* noop */ }
    }
  }

  /**
   * Starts a safe-walk journey session.
   */
  public startSafeWalk(config: SafeWalkConfig): void {
    this.config = {
      destinationName: config.destinationName,
      totalDurationMinutes: config.totalDurationMinutes,
      checkpointIntervalMinutes: config.checkpointIntervalMinutes,
      gracePeriodSeconds: config.gracePeriodSeconds ?? 60,
      duressPin: config.duressPin ?? "9999",
      startCoords: config.startCoords ?? { latitude: -26.2041, longitude: 28.0473 }
    };

    this.currentCheckpointIndex = 0;
    this.walkStartTime = Date.now();
    this.lastKnownCoords = this.config.startCoords;
    this.clearAllTimers();
    this.setState('WALKING');

    this.scheduleNextCheckpoint();
  }

  public updateCoordinates(coords: Coordinates): void {
    this.lastKnownCoords = coords;
  }

  private scheduleNextCheckpoint(): void {
    if (!this.config || this.state === 'IDLE' || this.state === 'COMPLETED') return;

    const intervalMs = this.config.checkpointIntervalMinutes * 60 * 1000;
    this.checkpointTimerId = setTimeout(() => {
      this.triggerCheckpointPrompt();
    }, intervalMs);
  }

  /**
   * Triggers checkpoint prompt and starts 60-second grace period countdown.
   */
  public triggerCheckpointPrompt(): void {
    if (!this.config) return;
    this.currentCheckpointIndex += 1;
    this.remainingGraceSeconds = this.config.gracePeriodSeconds;
    this.setState('CHECKPOINT_PENDING');
    this.setState('GRACE_PERIOD');

    for (const cb of this.checkpointPendingListeners) {
      try { cb(this.currentCheckpointIndex, this.remainingGraceSeconds); } catch { /* noop */ }
    }

    if (this.graceIntervalId) clearInterval(this.graceIntervalId);
    this.graceIntervalId = setInterval(() => {
      this.remainingGraceSeconds -= 1;
      for (const cb of this.graceTickListeners) {
        try { cb(this.remainingGraceSeconds); } catch { /* noop */ }
      }

      if (this.remainingGraceSeconds <= 0) {
        this.clearAllTimers();
        this.escalateDistress('MISSED_CHECKPOINT_GRACE_EXPIRED');
      }
    }, 1000);
  }

  /**
   * Confirms safe passage at the checkpoint.
   */
  public confirmCheckpoint(coords?: Coordinates): boolean {
    if (this.state !== 'CHECKPOINT_PENDING' && this.state !== 'GRACE_PERIOD') {
      return false;
    }
    if (coords) this.lastKnownCoords = coords;

    this.clearAllTimers();

    if (!this.config) {
      this.setState('IDLE');
      return true;
    }

    const elapsedMinutes = (Date.now() - this.walkStartTime) / (60 * 1000);
    if (elapsedMinutes >= this.config.totalDurationMinutes) {
      // Completed full journey
      this.setState('COMPLETED');
      return true;
    }

    this.setState('WALKING');
    this.scheduleNextCheckpoint();
    return true;
  }

  /**
   * User marks journey completed safely.
   */
  public completeSafeWalk(): void {
    this.clearAllTimers();
    this.setState('COMPLETED');
  }

  /**
   * Cancels walk. If user entered duress PIN (9999), immediately escalates silently!
   */
  public cancelSafeWalk(pin?: string): boolean {
    if (this.config && pin && pin === this.config.duressPin) {
      this.escalateDistress('DURESS_PIN_SUBMITTED');
      return false;
    }

    this.clearAllTimers();
    this.setState('IDLE');
    return true;
  }

  /**
   * Automated escalation when checkpoint is missed within 60s grace period.
   */
  public escalateDistress(
    reason: 'MISSED_CHECKPOINT_GRACE_EXPIRED' | 'DURESS_PIN_SUBMITTED' | 'MANUAL_PANIC' = 'MISSED_CHECKPOINT_GRACE_EXPIRED'
  ): SafeWalkEscalationPayload {
    this.clearAllTimers();
    this.setState('ESCALATED_DISTRESS');

    const destName = this.config?.destinationName || 'Home Transit Route';
    const elapsedMinutes = this.walkStartTime ? Math.round((Date.now() - this.walkStartTime) / (60 * 1000)) : 0;
    const isDuress = reason === 'DURESS_PIN_SUBMITTED';

    const coordsStr = this.lastKnownCoords
      ? `${this.lastKnownCoords.latitude.toFixed(6)}, ${this.lastKnownCoords.longitude.toFixed(6)}`
      : 'Coordinates unavailable';
    const mapsLink = this.lastKnownCoords
      ? `https://maps.google.com/?q=${this.lastKnownCoords.latitude},${this.lastKnownCoords.longitude}`
      : 'N/A';

    const iceSmsText = `[UMKHUSELI GBV SAFE-WALK SOS]\n` +
      `Commuter missed safety checkpoint #${this.currentCheckpointIndex} walking to ${destName}.\n` +
      `Grace period (60s) expired with NO safe response.\n` +
      `Elapsed Time: ${elapsedMinutes} mins.\n` +
      `Last Location: ${mapsLink}\n` +
      `Emergency dispatch initiated.`;

    const payload: SafeWalkEscalationPayload = {
      alertId: `SAFEWALK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      reason,
      destinationName: destName,
      checkpointIndex: this.currentCheckpointIndex,
      elapsedMinutes,
      lastKnownCoords: this.lastKnownCoords,
      iceSmsText,
      dispatchPacket: {
        latitude: this.lastKnownCoords?.latitude,
        longitude: this.lastKnownCoords?.longitude,
        areaName: destName,
        reason,
        isDuress
      }
    };

    for (const cb of this.escalationListeners) {
      try { cb(payload); } catch { /* noop */ }
    }

    return payload;
  }

  private clearAllTimers(): void {
    if (this.checkpointTimerId) {
      clearTimeout(this.checkpointTimerId);
      this.checkpointTimerId = null;
    }
    if (this.graceIntervalId) {
      clearInterval(this.graceIntervalId);
      this.graceIntervalId = null;
    }
  }
}

/**
 * Township Taxi Rank Rapid Trigger
 * 
 * 3 rapid taps within 2 seconds triggering immediate silent distress packet
 * tagged with taxi rank geofence metadata.
 */
export class TaxiRankRapidTrigger {
  private tapTimestamps: number[] = [];
  private readonly windowDurationMs: number = 2000;
  private readonly requiredTaps: number = 3;
  private taxiRanks: TaxiRankGeofence[] = SA_TOWNSHIP_TAXI_RANKS;

  private triggerListeners: Array<(packet: TaxiRankDistressPacket) => void> = [];

  constructor(customTaxiRanks?: TaxiRankGeofence[]) {
    if (customTaxiRanks && customTaxiRanks.length > 0) {
      this.taxiRanks = customTaxiRanks;
    }
  }

  public onRapidTrigger(cb: (packet: TaxiRankDistressPacket) => void): () => void {
    this.triggerListeners.push(cb);
    return () => {
      this.triggerListeners = this.triggerListeners.filter(l => l !== cb);
    };
  }

  public getRecentTapCount(): number {
    this.pruneOldTaps(Date.now());
    return this.tapTimestamps.length;
  }

  public reset(): void {
    this.tapTimestamps = [];
  }

  private pruneOldTaps(now: number): void {
    const cutoff = now - this.windowDurationMs;
    this.tapTimestamps = this.tapTimestamps.filter(t => t >= cutoff);
  }

  /**
   * Records a tap event. Returns distress packet if 3 rapid taps detected within 2 seconds.
   */
  public recordTap(userCoords?: Coordinates): {
    triggered: boolean;
    tapCount: number;
    distressPacket?: TaxiRankDistressPacket;
  } {
    const now = Date.now();
    this.pruneOldTaps(now);
    this.tapTimestamps.push(now);

    if (this.tapTimestamps.length >= this.requiredTaps) {
      const packet = this.buildDistressPacket(userCoords);
      this.tapTimestamps = []; // Reset after trigger

      for (const cb of this.triggerListeners) {
        try { cb(packet); } catch { /* noop */ }
      }

      return {
        triggered: true,
        tapCount: this.requiredTaps,
        distressPacket: packet
      };
    }

    return {
      triggered: false,
      tapCount: this.tapTimestamps.length
    };
  }

  /**
   * Locates nearest taxi rank geofence within range and constructs distress packet.
   */
  public buildDistressPacket(userCoords?: Coordinates): TaxiRankDistressPacket {
    let matchedRank: TaxiRankGeofence | undefined = undefined;
    let minDistance = Infinity;

    if (userCoords) {
      for (const rank of this.taxiRanks) {
        const dist = haversineDistanceMeters(userCoords, { latitude: rank.latitude, longitude: rank.longitude });
        if (dist <= rank.radiusMeters * 2 && dist < minDistance) {
          minDistance = dist;
          matchedRank = rank;
        }
      }
    }

    const rankTitle = matchedRank ? matchedRank.name : 'Township Commuter Transit Hub';
    const township = matchedRank ? `${matchedRank.townshipOrArea}, ${matchedRank.province}` : 'South Africa';
    const coordsStr = userCoords
      ? `${userCoords.latitude.toFixed(6)}, ${userCoords.longitude.toFixed(6)}`
      : 'GPS acquiring';
    const mapsLink = userCoords
      ? `https://maps.google.com/?q=${userCoords.latitude},${userCoords.longitude}`
      : 'N/A';

    const iceSmsText = `[UMKHUSELI SILENT PANIC: TAXI RANK RAPID-TRIGGER]\n` +
      `Emergency activated at ${rankTitle} (${township}).\n` +
      `3 rapid covert taps recorded.\n` +
      (matchedRank ? `Nearest SAPS: ${matchedRank.policeStationName} (${matchedRank.policeStationContact})\n` : '') +
      `Location: ${mapsLink}\n` +
      `Immediate armed escort or GBV patrol dispatched.`;

    const packet: TaxiRankDistressPacket = {
      alertId: `TAXIRANK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      triggerType: 'RAPID_TAP_TAXI_RANK',
      tapCount: this.requiredTaps,
      windowDurationMs: this.windowDurationMs,
      userCoords,
      matchedTaxiRank: matchedRank,
      nearestDistanceMeters: minDistance !== Infinity ? Math.round(minDistance) : undefined,
      message: `Silent taxi rank distress trigger activated at ${rankTitle}`,
      iceSmsText,
      dispatchPacket: {
        latitude: userCoords?.latitude,
        longitude: userCoords?.longitude,
        areaName: rankTitle,
        reason: 'TAXI_RANK_RAPID_TRIGGER',
        isDuress: true
      }
    };

    return packet;
  }
}
