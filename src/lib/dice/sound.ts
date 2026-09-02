let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!audioCtx || audioCtx.state === "closed") {
    try {
      audioCtx = new AudioCtxClass();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => undefined);
  }
  return audioCtx;
}

/**
 * Play a procedural acoustic dice tumble sound or haptic bump.
 * Zero external audio files or network requests.
 */
export function playDiceRollSound(opts?: { isCrit?: boolean; isFumble?: boolean }) {
  if (typeof window === "undefined") return;

  // Haptic feedback if supported (mobile)
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      if (opts?.isCrit) {
        navigator.vibrate([35, 40, 50]);
      } else if (opts?.isFumble) {
        navigator.vibrate([60, 40, 60]);
      } else {
        navigator.vibrate(25);
      }
    } catch {
      // ignore haptic restrictions
    }
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Simulate 3 to 5 rapid dice clacks/tumbles on felt
    const clackCount = 4;
    for (let i = 0; i < clackCount; i++) {
      const startTime = now + i * 0.055 + (Math.random() * 0.02);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sharp transient descending pitch (die striking felt)
      const baseFreq = 300 + Math.random() * 250;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.04);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.05);
    }

    // High harmonic chime on Natural 20 / Max face
    if (opts?.isCrit) {
      const chimeTime = now + 0.22;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, chimeTime + idx * 0.04);

        gain.gain.setValueAtTime(0.06, chimeTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chimeTime + idx * 0.04);
        osc.stop(chimeTime + idx * 0.04 + 0.4);
      });
    }

    // Hollow low thud on Natural 1 / Fumble
    if (opts?.isFumble) {
      const thudTime = now + 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(120, thudTime);
      osc.frequency.exponentialRampToValueAtTime(45, thudTime + 0.2);

      gain.gain.setValueAtTime(0.08, thudTime);
      gain.gain.exponentialRampToValueAtTime(0.001, thudTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(thudTime);
      osc.stop(thudTime + 0.25);
    }
  } catch {
    // Gracefully ignore audio synthesis errors
  }
}
