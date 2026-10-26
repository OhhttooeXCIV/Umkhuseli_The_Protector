/**
 * Umkhuseli - Audible Deterrent Siren Service
 * 
 * Uses the Web Audio API to synthesize a high-decibel, alternating two-tone siren (800 Hz - 1200 Hz sweep)
 * designed to disorient physical assailants and alert bystanders in immediate proximity.
 */

let activeAudioContext: AudioContext | null = null;
let activeOscillator: OscillatorNode | null = null;
let activeGain: GainNode | null = null;
let sirenInterval: any = null;

export function isSirenActive(): boolean {
  return activeOscillator !== null;
}

export function startAudibleSiren(): () => void {
  stopAudibleSiren();

  if (typeof window === "undefined") {
    return () => {};
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    console.warn("Web Audio API not supported on this device.");
    return () => {};
  }

  try {
    const ctx = new AudioCtx();
    activeAudioContext = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(850, ctx.currentTime);

    // Initial loud volume
    gain.gain.setValueAtTime(0.8, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    activeOscillator = osc;
    activeGain = gain;

    // Sweeping two-tone alternating emergency siren effect
    let highTone = true;
    sirenInterval = setInterval(() => {
      if (!activeOscillator || !activeAudioContext) return;
      try {
        const targetFreq = highTone ? 1250 : 800;
        activeOscillator.frequency.cancelScheduledValues(activeAudioContext.currentTime);
        activeOscillator.frequency.linearRampToValueAtTime(
          targetFreq,
          activeAudioContext.currentTime + 0.25
        );
        highTone = !highTone;
      } catch {}
    }, 280);

    return stopAudibleSiren;
  } catch (err) {
    console.warn("Could not start audible siren:", err);
    return () => {};
  }
}

export function stopAudibleSiren(): void {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }

  if (activeOscillator) {
    try {
      activeOscillator.stop();
      activeOscillator.disconnect();
    } catch {}
    activeOscillator = null;
  }

  if (activeGain) {
    try {
      activeGain.disconnect();
    } catch {}
    activeGain = null;
  }

  if (activeAudioContext) {
    try {
      activeAudioContext.close();
    } catch {}
    activeAudioContext = null;
  }
}
