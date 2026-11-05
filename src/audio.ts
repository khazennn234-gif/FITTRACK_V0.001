// FitTrack — Web Audio API Sound Synthesizer
// Zero external sound assets needed, lightweight and immediate

import { getSettings } from './storage';

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private getVolume(): number {
    const settings = getSettings();
    return Math.max(0, Math.min(1, (settings.soundVolume ?? 80) / 100));
  }

  // Play a simple frequency tone
  playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.2): void {
    const ctx = this.getAudioContext();
    const volume = this.getVolume();
    if (!ctx || volume <= 0) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const targetGain = gainVal * volume;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Rep counted chime (ascending pleasant double-tone)
  playRepChime(): void {
    const ctx = this.getAudioContext();
    const volume = this.getVolume();
    if (!ctx || volume <= 0) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

      gain.gain.setValueAtTime(0.25 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  // Countdown tick (3, 2, 1)
  playCountdownTick(): void {
    this.playTone(440, 0.12, 'sine', 0.2); // A4
  }

  // Countdown GO! (cheerful chord)
  playCountdownGo(): void {
    const ctx = this.getAudioContext();
    const volume = this.getVolume();
    if (!ctx || volume <= 0) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.35, 'triangle', 0.25);
      }, idx * 60);
    });
  }

  // Warning feedback for improper form
  playWarning(): void {
    const ctx = this.getAudioContext();
    const volume = this.getVolume();
    if (!ctx || volume <= 0) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.2);

      gain.gain.setValueAtTime(0.18 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  // Workout completed celebration fanfare
  playCompletionFanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, 'triangle', 0.3);
      }, i * 150);
    });
  }
}

export const sound = new SoundEffects();
