class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isBeeping = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
  }

  public startBeep(frequency: number = 1000) {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isBeeping) {
      // Update frequency if already playing
      if (this.osc) {
        this.osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      }
      return;
    }

    try {
      this.osc = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      this.osc.type = 'square'; // Authentic piezo buzzer timbre
      this.osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime); // Safe pleasant volume

      this.osc.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.osc.start();
      this.isBeeping = true;
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  public stopBeep() {
    if (!this.isBeeping) return;
    try {
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.isBeeping = false;
    } catch (e) {
      console.warn('Audio stop error:', e);
    }
  }

  public playClickSound() {
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // ignore
    }
  }
}

export const audioSynth = new AudioSynthesizer();
