// Web Audio API helper for file playback, microphone input, demo sound generation, and frequency analysis

export interface AudioAnalysis {
  bass: number;     // 0 to 1
  mid: number;      // 0 to 1
  treble: number;   // 0 to 1
  volume: number;   // 0 to 1
  beat: boolean;    // true if beat detected
  rawFrequencyData: Uint8Array;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | OscillatorNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private isMic: boolean = false;
  private isDemoSynth: boolean = false;
  private synthOscillator: OscillatorNode | null = null;
  private synthGain: GainNode | null = null;
  private demoInterval: number | null = null;
  private beatHistory: number[] = [];

  public isPlaying: boolean = false;
  public audioName: string = 'Tidak ada audio';
  public duration: number = 0;
  public currentTime: number = 0;
  public volumeLevel: number = 1.0;
  public audioBuffer: AudioBuffer | null = null;
  private audioDestNode: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    // Lazy init AudioContext on user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      // 0.45 provides instant, punchy reaction to beats without sluggish lag
      this.analyser.smoothingTimeConstant = 0.45;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (!this.audioDestNode && this.ctx && this.analyser) {
      try {
        this.audioDestNode = this.ctx.createMediaStreamDestination();
        this.analyser.connect(this.audioDestNode);
      } catch (e) {
        console.warn('Audio destination init warning:', e);
      }
    }
  }

  // Connect HTML Audio Element or File URL and decode AudioBuffer for studio-quality offline render
  public loadFile(file: File | string, name?: string): Promise<HTMLAudioElement> {
    return new Promise(async (resolve, reject) => {
      this.stopAll();
      this.initCtx();

      // Attempt to decode ArrayBuffer for studio frame-accurate export
      try {
        let arrayBuffer: ArrayBuffer;
        if (typeof file === 'string') {
          const res = await fetch(file);
          arrayBuffer = await res.arrayBuffer();
        } else {
          arrayBuffer = await file.arrayBuffer();
        }
        if (this.ctx) {
          this.ctx.decodeAudioData(arrayBuffer.slice(0), (decoded) => {
            this.audioBuffer = decoded;
          }, (err) => console.warn('AudioBuffer decode error:', err));
        }
      } catch (err) {
        console.warn('Could not pre-decode AudioBuffer for offline render:', err);
      }

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      
      if (typeof file === 'string') {
        audio.src = file;
        this.audioName = name || 'Demo Audio';
      } else {
        audio.src = URL.createObjectURL(file);
        this.audioName = name || file.name;
      }

      audio.onloadedmetadata = () => {
        this.duration = audio.duration;
        this.audioEl = audio;
        
        if (this.ctx && this.analyser) {
          try {
            const source = this.ctx.createMediaElementSource(audio);
            source.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);
            this.mediaSourceNode = source;
          } catch (e) {
            console.warn('Source already connected or reset:', e);
          }
        }
        this.isMic = false;
        this.isDemoSynth = false;
        resolve(audio);
      };

      audio.onerror = (e) => reject(e);
      audio.load();
    });
  }

  // Connect Microphone Input
  public async connectMicrophone(): Promise<void> {
    this.stopAll();
    this.initCtx();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.mediaStream = stream;
      if (this.ctx && this.analyser) {
        const source = this.ctx.createMediaStreamSource(stream);
        source.connect(this.analyser);
        this.mediaSourceNode = source;
      }
      this.isMic = true;
      this.audioName = 'Mikrofon Langsung (Live Voice)';
      this.isPlaying = true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      throw new Error('Akses mikrofon ditolak atau tidak tersedia.');
    }
  }

  // Demo AI Voice Synth Sound Generator
  public startDemoSynth(): void {
    this.stopAll();
    this.initCtx();

    if (!this.ctx || !this.analyser) return;

    this.isDemoSynth = true;
    this.audioName = 'Simulasi Voice AI (Demo)';
    this.isPlaying = true;

    // Create dynamic modulation for voice simulation
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    osc.start();
    this.synthOscillator = osc;
    this.synthGain = gain;

    let step = 0;
    this.demoInterval = window.setInterval(() => {
      if (!this.ctx || !this.synthOscillator || !this.synthGain) return;
      step++;
      const time = this.ctx.currentTime;
      // Speech-like formant patterns
      const freq = 180 + Math.sin(step * 0.2) * 120 + Math.cos(step * 0.5) * 80;
      const vol = 0.15 + (Math.sin(step * 0.3) > 0 ? 0.2 : 0) + Math.random() * 0.1;
      
      this.synthOscillator.frequency.setTargetAtTime(freq, time, 0.05);
      this.synthGain.gain.setTargetAtTime(vol, time, 0.05);
    }, 120);
  }

  public play() {
    if (this.audioEl && !this.isMic) {
      this.initCtx();
      this.audioEl.play();
      this.isPlaying = true;
    }
  }

  public pause() {
    if (this.audioEl && !this.isMic) {
      this.audioEl.pause();
      this.isPlaying = false;
    }
  }

  public seek(time: number) {
    if (this.audioEl && !this.isMic) {
      this.audioEl.currentTime = time;
    }
  }

  public setVolume(val: number) {
    this.volumeLevel = val;
    if (this.audioEl) {
      this.audioEl.volume = val;
    }
  }

  public stopAll() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.synthOscillator) {
      try { this.synthOscillator.stop(); } catch {}
      this.synthOscillator = null;
    }
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    this.isPlaying = false;
    this.isMic = false;
    this.isDemoSynth = false;
  }

  // Get current audio frequency breakdown
  public getAnalysis(sensitivity: number = 1.0): AudioAnalysis {
    if (!this.analyser) {
      return { bass: 0, mid: 0, treble: 0, volume: 0, beat: false, rawFrequencyData: new Uint8Array(0) };
    }

    this.analyser.getByteFrequencyData(this.frequencyData as any);
    const length = this.frequencyData.length;

    if (length === 0) {
      return { bass: 0, mid: 0, treble: 0, volume: 0, beat: false, rawFrequencyData: this.frequencyData };
    }

    // Split frequency spectrum into bands
    const bassEnd = Math.floor(length * 0.15);
    const midEnd = Math.floor(length * 0.6);

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;
    let totalSum = 0;

    for (let i = 0; i < length; i++) {
      const val = this.frequencyData[i];
      totalSum += val;
      if (i <= bassEnd) {
        bassSum += val;
      } else if (i <= midEnd) {
        midSum += val;
      } else {
        trebleSum += val;
      }
    }

    const bassAvg = (bassSum / (bassEnd + 1)) / 255;
    const midAvg = (midSum / (midEnd - bassEnd)) / 255;
    const trebleAvg = (trebleSum / (length - midEnd)) / 255;
    const volumeAvg = (totalSum / length) / 255;

    // Apply sensitivity multiplier
    const bass = Math.min(1.0, bassAvg * sensitivity);
    const mid = Math.min(1.0, midAvg * sensitivity);
    const treble = Math.min(1.0, trebleAvg * sensitivity);
    const volume = Math.min(1.0, volumeAvg * sensitivity);

    // Simple beat detection
    this.beatHistory.push(bass);
    if (this.beatHistory.length > 20) this.beatHistory.shift();

    const historyAvg = this.beatHistory.reduce((a, b) => a + b, 0) / (this.beatHistory.length || 1);
    const beat = bass > historyAvg * 1.35 && bass > 0.2;

    if (this.audioEl) {
      this.currentTime = this.audioEl.currentTime;
      this.duration = this.audioEl.duration || 0;
    }

    return {
      bass,
      mid,
      treble,
      volume,
      beat,
      rawFrequencyData: this.frequencyData
    };
  }

  // Get audio stream for video recording
  public getAudioStream(): MediaStream | null {
    if (this.mediaStream) {
      return this.mediaStream;
    }
    if (this.ctx && this.analyser) {
      try {
        if (!this.audioDestNode) {
          this.audioDestNode = this.ctx.createMediaStreamDestination();
          this.analyser.connect(this.audioDestNode);
        }
        return this.audioDestNode.stream;
      } catch (e) {
        console.warn('Could not create MediaStreamDestination for audio:', e);
      }
    }
    return null;
  }
}
