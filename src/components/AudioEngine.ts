/**
 * Retro Synth sound generator using the Web Audio API
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialize and resume AudioContext on first user interaction anywhere
    if (typeof window !== 'undefined') {
      const resumeAudio = () => {
        if (this.enabled) {
          this.initCtx();
        }
        // Remove listeners once context is active successfully
        if (this.ctx && this.ctx.state === 'running') {
          document.removeEventListener('click', resumeAudio);
          document.removeEventListener('keydown', resumeAudio);
          document.removeEventListener('touchstart', resumeAudio);
        }
      };
      document.addEventListener('click', resumeAudio, { passive: true });
      document.addEventListener('keydown', resumeAudio, { passive: true });
      document.addEventListener('touchstart', resumeAudio, { passive: true });

      // Warm up Speech Synthesis voices cache (crucial for Chrome/Safari)
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
          };
        }
      }
    }
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.initCtx();
    }
  }

  public playEngineRev() {
    if (!this.enabled) return;
    this.initCtx();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // V12 racing rev sound using standard sawtooth
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.35);
    osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.5);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.82);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  }

  public playEatTurbo() {
    if (!this.enabled) return;
    this.initCtx();
    const ctx = this.ctx!;
    
    // Spark and turbo beep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    // double-beep
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  public playCollectGasCan() {
    if (!this.enabled) return;
    this.initCtx();
    const ctx = this.ctx!;
    
    // Combustion engine throttle-opening rev scream
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(380, ctx.currentTime + 0.1);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(142, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(385, ctx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1210, ctx.currentTime + 0.35);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(70, ctx.currentTime);
    subOsc.frequency.linearRampToValueAtTime(190, ctx.currentTime + 0.15);
    subOsc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    subOsc.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    subOsc.start();
    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
    subOsc.stop(ctx.currentTime + 0.4);
  }

  public playEatLuce() {
    if (!this.enabled) return;
    this.initCtx();
    const ctx = this.ctx!;
    
    // Heavy combustion engine roar & spark short-circuit crossover
    const roarOsc = ctx.createOscillator();
    const roarOsc2 = ctx.createOscillator();
    const sparkOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Aggressive double-saw V12 sound simulating cylinder exhaust pulses
    roarOsc.type = 'sawtooth';
    roarOsc.frequency.setValueAtTime(80, ctx.currentTime);
    roarOsc.frequency.linearRampToValueAtTime(550, ctx.currentTime + 0.15);
    roarOsc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.45);

    roarOsc2.type = 'sawtooth';
    roarOsc2.frequency.setValueAtTime(82, ctx.currentTime);
    roarOsc2.frequency.linearRampToValueAtTime(556, ctx.currentTime + 0.15);
    roarOsc2.frequency.exponentialRampToValueAtTime(910, ctx.currentTime + 0.45);

    // Electric disintegration spark zap overlay
    sparkOsc.type = 'triangle';
    sparkOsc.frequency.setValueAtTime(2000, ctx.currentTime);
    sparkOsc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.24, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.02, ctx.currentTime + 0.22); // pulsing gear cut
    gain.gain.setValueAtTime(0.18, ctx.currentTime + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.5);

    roarOsc.connect(gain);
    roarOsc2.connect(gain);
    sparkOsc.connect(gain);
    gain.connect(ctx.destination);

    roarOsc.start();
    roarOsc2.start();
    sparkOsc.start();

    roarOsc.stop(ctx.currentTime + 0.52);
    roarOsc2.stop(ctx.currentTime + 0.52);
    sparkOsc.stop(ctx.currentTime + 0.52);
  }

  public playCrash() {
    if (!this.enabled) return;
    this.initCtx();
    const ctx = this.ctx!;
    
    // Exploding heavy-metal impact sound using complex FM & low frequency pitches
    const lowOsc = ctx.createOscillator();
    const midOsc = ctx.createOscillator();
    const whiteNoiseOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    lowOsc.type = 'sawtooth';
    lowOsc.frequency.setValueAtTime(180, ctx.currentTime);
    lowOsc.frequency.linearRampToValueAtTime(25, ctx.currentTime + 0.7);

    midOsc.type = 'triangle';
    midOsc.frequency.setValueAtTime(320, ctx.currentTime);
    midOsc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.5);

    // Dynamic metallic friction crunch
    whiteNoiseOsc.type = 'sawtooth';
    whiteNoiseOsc.frequency.setValueAtTime(900, ctx.currentTime);
    whiteNoiseOsc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.75);

    lowOsc.connect(gain);
    midOsc.connect(gain);
    whiteNoiseOsc.connect(gain);
    gain.connect(ctx.destination);

    lowOsc.start();
    midOsc.start();
    whiteNoiseOsc.start();

    lowOsc.stop(ctx.currentTime + 0.8);
    midOsc.stop(ctx.currentTime + 0.8);
    whiteNoiseOsc.stop(ctx.currentTime + 0.8);
  }

  public speakEnzo(text: string) {
    if (!this.enabled) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        
        // Trim brackets or non-pronounceable markers
        const cleanText = text.replace(/["'”📌🔍⭐💡🏁⚡🔋⛽🕹️—]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Look up Italian or elegant older male voice for Sir Enzo Ferrari
        const voices = window.speechSynthesis.getVoices();
        
        // Select an old, firm, mature voice.
        // We prioritize English male voices with rich tones because the quotes are written in English (with passionate Italian phrases).
        // This ensures crisp pronunciation, while the pitch modifies the voice to sound like a gruff older gentleman.
        let selectedVoice = null;
        
        // Priority 1: High-quality mature/older male voices (or premium local voices)
        const priorityNames = [
          'microsoft david', 'david', 'google uk english male', 'google us english male', 
          'premium', 'daniel', 'oliver', 'luca', 'cosimo', 'piero', 'giorgio'
        ];
        
        for (const pName of priorityNames) {
          const found = voices.find(v => v.name.toLowerCase().includes(pName));
          if (found) {
            selectedVoice = found;
            break;
          }
        }
        
        if (!selectedVoice) {
          // Priority 2: Any English male voice
          selectedVoice = voices.find(v => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return lang.startsWith('en') && name.includes('male');
          });
        }
        
        if (!selectedVoice) {
          // Priority 3: Any Italian male voice
          selectedVoice = voices.find(v => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return lang.startsWith('it') && (name.includes('male') || name.includes('luca') || name.includes('piero') || name.includes('cosimo') || name.includes('giorgio'));
          });
        }
        
        if (!selectedVoice && voices.length > 0) {
          // Priority 4: Any male voice
          selectedVoice = voices.find(v => v.name.toLowerCase().includes('male'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Apply a firm, rugged, extra deep voice cadence for a formidable old Italian patriarch
        utterance.pitch = 0.65; // Extra deep, firm baritone/bass throat register for a grizzled elder
        utterance.rate = 0.78;  // Very slow, proud, highly deliberate, authoritative speech cadence
        utterance.volume = 1.0;
        
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis fail:', err);
      }
    }
  }

  public playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    const ctx = this.ctx!;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.28);
    });
  }

  public playDefeat() {
    if (!this.enabled) return;
    this.initCtx();
    const ctx = this.ctx!;
    const notes = [392.00, 349.23, 311.13, 261.63, 246.94, 196.00]; // descending minor scale style sadness
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.15);
      osc.stop(ctx.currentTime + idx * 0.15 + 0.38);
    });
  }
}

export const sfx = new AudioEngine();
