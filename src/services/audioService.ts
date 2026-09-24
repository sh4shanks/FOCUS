/**
 * Web Audio API based ambient sound generator and timer chimes
 * 100% self-contained, no external mp3 or asset dependencies
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isPlayingAmbient = false;
  private currentMode: 'rain' | 'whitenoise' | 'drone' | 'off' = 'off';

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a clean, Apple-like meditation bell / completion chime
   */
  public playChime(type: 'success' | 'step' | 'click' = 'success') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        return;
      }

      if (type === 'step') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
        return;
      }

      // Success major triad chord chime
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        const startTime = now + index * 0.08;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.7);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Start soothing ambient focus sound
   */
  public startAmbient(mode: 'rain' | 'whitenoise' | 'drone', volume = 0.15) {
    try {
      this.stopAmbient();
      const ctx = this.getContext();
      this.currentMode = mode;
      this.isPlayingAmbient = true;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      if (mode === 'drone') {
        // Deep binaural meditative drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(114, ctx.currentTime); // Slight binaural beat (4Hz theta)

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.5, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(subGain);
        subGain.connect(masterGain);

        osc1.start();
        osc2.start();
        this.ambientSource = subGain;
      } else {
        // White or Pink Noise buffer for rain/whitenoise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (mode === 'rain') {
            // Filtered pink noise simulating rainfall
            lastOut = (lastOut * 0.95) + (white * 0.05);
            data[i] = lastOut * 3;
          } else {
            // Soft white noise
            data[i] = white * 0.5;
          }
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = mode === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(mode === 'rain' ? 600 : 1000, ctx.currentTime);

        noiseNode.connect(filter);
        filter.connect(masterGain);

        noiseNode.start();
        this.ambientSource = noiseNode;
      }
    } catch {
      // Audio context policy
    }
  }

  public setVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stopAmbient() {
    this.isPlayingAmbient = false;
    this.currentMode = 'off';
    if (this.ambientSource) {
      try {
        if ('stop' in this.ambientSource && typeof (this.ambientSource as AudioScheduledSourceNode).stop === 'function') {
          (this.ambientSource as AudioScheduledSourceNode).stop();
        }
        this.ambientSource.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      this.ambientSource = null;
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlayingAmbient,
      mode: this.currentMode,
    };
  }
}

export const soundEngine = new SoundEngine();
