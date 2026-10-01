/**
 * Real-time Audio Analysis
 * Connects to HTML5 Audio element and provides frequency/energy data
 * Uses Web Audio API for FFT analysis
 */

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private connected = false;

  /**
   * Connect to an HTML5 Audio element
   */
  connect(audioElement: HTMLAudioElement): void {
    if (this.connected) {
      console.log('[AudioAnalyzer] Already connected, skipping');
      return;
    }

    try {
      console.log('[AudioAnalyzer] Connecting to audio element...');

      // Create AudioContext
      this.audioContext = new AudioContext();
      console.log('[AudioAnalyzer] AudioContext created, state:', this.audioContext.state);

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256; // Small FFT for performance (128 frequency bins)
      this.analyser.smoothingTimeConstant = 0.75; // Less smoothing for more responsiveness

      console.log('[AudioAnalyzer] Analyser created, bins:', this.analyser.frequencyBinCount);

      // Create source from audio element
      this.source = this.audioContext.createMediaElementSource(audioElement);
      console.log('[AudioAnalyzer] Media source created from audio element');

      // Connect: source -> analyser -> destination
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      console.log('[AudioAnalyzer] Audio graph connected: source -> analyser -> destination');

      // Create data array for frequency data
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;

      this.connected = true;
      console.log('[AudioAnalyzer] ✓ Successfully connected to audio element');
    } catch (error) {
      console.error('[AudioAnalyzer] ✗ Failed to connect:', error);
      if (error instanceof Error) {
        console.error('[AudioAnalyzer] Error details:', error.message, error.stack);
      }
    }
  }

  /**
   * Get overall audio energy (0-1)
   * Average amplitude across all frequencies
   */
  getEnergy(): number {
    if (!this.analyser || !this.dataArray) {
      console.warn('[AudioAnalyzer] getEnergy called but not ready:', {
        hasAnalyser: !!this.analyser,
        hasDataArray: !!this.dataArray,
        connected: this.connected
      });
      return 0;
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average amplitude
    let sum = 0;
    let maxVal = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
      maxVal = Math.max(maxVal, this.dataArray[i]);
    }

    // Log raw data occasionally for debugging
    if (Math.random() < 0.01) {
      console.log('[AudioAnalyzer] Raw FFT data:', {
        avgValue: (sum / this.dataArray.length).toFixed(1),
        maxValue: maxVal,
        sampleValues: Array.from(this.dataArray.slice(0, 10))
      });
    }

    // Normalize to 0-1 range (byte values are 0-255)
    const energy = (sum / this.dataArray.length) / 255;

    // Boost the response curve for more dramatic visuals
    return Math.pow(energy, 0.7); // Power curve makes quiet parts quieter, loud parts louder
  }

  /**
   * Get bass energy (0-1)
   * Low frequencies (roughly 20-250 Hz)
   */
  getBass(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Bass is roughly first 15% of spectrum
    const bassEnd = Math.floor(this.dataArray.length * 0.15);
    let sum = 0;
    for (let i = 0; i < bassEnd; i++) {
      sum += this.dataArray[i];
    }

    const bass = (sum / bassEnd) / 255;
    // Bass hits should be VERY dramatic
    return Math.pow(bass, 0.6);
  }

  /**
   * Get mid-range energy (0-1)
   * Mid frequencies (roughly 250-2000 Hz)
   */
  getMid(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Mids are roughly 15-50% of spectrum
    const midStart = Math.floor(this.dataArray.length * 0.15);
    const midEnd = Math.floor(this.dataArray.length * 0.5);
    let sum = 0;
    for (let i = midStart; i < midEnd; i++) {
      sum += this.dataArray[i];
    }

    const mid = (sum / (midEnd - midStart)) / 255;
    return Math.pow(mid, 0.7);
  }

  /**
   * Get treble energy (0-1)
   * High frequencies (roughly 2000+ Hz)
   */
  getTreble(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Treble is roughly 50-100% of spectrum
    const trebleStart = Math.floor(this.dataArray.length * 0.5);
    let sum = 0;
    for (let i = trebleStart; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }

    const treble = (sum / (this.dataArray.length - trebleStart)) / 255;
    return Math.pow(treble, 0.8);
  }

  /**
   * Get raw frequency data (for custom visualization)
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;

    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  /**
   * Resume AudioContext if suspended (needed for autoplay restrictions)
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[AudioAnalyzer] AudioContext resumed');
    }
  }

  /**
   * Clean up resources
   */
  disconnect(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.dataArray = null;
    this.connected = false;
    console.log('[AudioAnalyzer] Disconnected');
  }
}

// Singleton instance
let analyzerInstance: AudioAnalyzer | null = null;

export function getAudioAnalyzer(): AudioAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new AudioAnalyzer();
  }
  return analyzerInstance;
}
