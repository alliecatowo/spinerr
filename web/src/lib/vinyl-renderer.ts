/**
 * Global Vinyl Renderer Singleton
 * Keeps p5 canvas alive across navigation for better performance
 */

import type p5 from 'p5';
import { createVinylSketch, type VinylSketchInstance } from './vinyl-sketch';

class VinylRenderer {
  private static instance: VinylRenderer;
  private p5Instance: p5 | null = null;
  private sketchInstance: VinylSketchInstance | null = null;
  private currentContainer: HTMLElement | null = null;

  private constructor() {
    console.log('[VinylRenderer] Singleton instance created');
  }

  static getInstance(): VinylRenderer {
    if (!VinylRenderer.instance) {
      VinylRenderer.instance = new VinylRenderer();
    }
    return VinylRenderer.instance;
  }

  async initialize(
    container: HTMLElement,
    trackId: string,
    albumColor: string,
    artworkUrl: string | undefined,
    isPlaying: boolean,
    progress: number
  ): Promise<void> {
    // If already initialized with same container, just update params
    if (this.p5Instance && this.currentContainer === container) {
      console.log('[VinylRenderer] Reusing existing p5 instance, updating params');
      this.updateParams({
        trackId,
        albumColor,
        artworkUrl,
        isPlaying,
        progress,
      });
      return;
    }

    // Clean up old instance if container changed
    if (this.p5Instance && this.currentContainer !== container) {
      console.log('[VinylRenderer] Container changed, recreating sketch');
      this.cleanup();
    }

    // Load p5.js if not already loaded
    if (!(window as any).p5) {
      console.log('[VinylRenderer] Loading p5.js module...');
      const p5Module = await import('p5');
      (window as any).p5 = p5Module.default;
      console.log('[VinylRenderer] p5.js loaded');
    }

    // Wait a frame for container dimensions
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Create sketch
    console.log('[VinylRenderer] Creating vinyl sketch');
    this.sketchInstance = createVinylSketch(
      container,
      trackId,
      albumColor,
      artworkUrl,
      isPlaying,
      progress,
      undefined
    );

    this.p5Instance = this.sketchInstance.p5Instance;
    this.currentContainer = container;
    console.log('[VinylRenderer] Sketch created successfully');
  }

  updateParams(params: {
    trackId: string;
    albumColor: string;
    artworkUrl?: string;
    isPlaying: boolean;
    progress: number;
  }): void {
    if (!this.p5Instance) {
      console.warn('[VinylRenderer] Cannot update params - no p5 instance');
      return;
    }

    // Call updateParams on the p5 instance
    if (typeof (this.p5Instance as any).updateParams === 'function') {
      (this.p5Instance as any).updateParams({
        trackId: params.trackId,
        albumColor: params.albumColor,
        artworkUrl: params.artworkUrl,
        isPlaying: params.isPlaying,
        progress: params.progress,
        onSeek: undefined,
      });
    }
  }

  isInitialized(): boolean {
    return this.p5Instance !== null;
  }

  getContainer(): HTMLElement | null {
    return this.currentContainer;
  }

  cleanup(): void {
    console.log('[VinylRenderer] Cleaning up sketch');
    if (this.sketchInstance?.cleanup) {
      this.sketchInstance.cleanup();
    }
    this.p5Instance = null;
    this.sketchInstance = null;
    this.currentContainer = null;
  }

  // Don't cleanup on component unmount - keep instance alive
  // Only cleanup when explicitly requested (e.g., track change to different album)
}

export const vinylRenderer = VinylRenderer.getInstance();
