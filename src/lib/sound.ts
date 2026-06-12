interface WindowWithLegacyAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted = true;

  private initCtx() {
    if (!this.ctx) {
      const w = window as WindowWithLegacyAudio;
      const Ctor = window.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const playChord = (freqs: number[], type: OscillatorType, duration: number, delay: number = 0) => {
      const startTime = this.ctx!.currentTime + delay;
      freqs.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    // C Major chord
    playChord([523.25, 659.25, 783.99], 'sine', 1.5);
    // Add some sparkle
    playChord([1046.50, 1318.51], 'triangle', 2, 0.1);
  }
}

export const soundManager = new SoundManager();
