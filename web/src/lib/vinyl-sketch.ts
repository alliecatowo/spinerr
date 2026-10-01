/**
 * Sonic Grooves - Music-Reactive Vinyl Visualization
 *
 * Real-time generative art where sound sculpts visual form.
 * Each track generates unique patterns through seeded randomness,
 * while live audio analysis drives reactive displacement and color.
 * Optimized for 60fps butter-smooth performance.
 */

import type p5 from 'p5';
import { getAudioAnalyzer } from './audio-analyzer';

interface VinylSketchParams {
  trackId: string;
  albumColor: string;
  artworkUrl?: string;
  isPlaying: boolean;
  progress: number;
  onSeek?: (progress: number) => void;
}

interface GrooveRing {
  radius: number;
  noiseOffset: number;
  shimmerPhase: number;
  width: number;
  // Pre-computed cache for performance
  cachedPath?: { x: number; y: number }[];
  baseHue: number;
}

export interface VinylSketchInstance {
  cleanup: () => void;
  p5Instance: p5 | null;
}

export function createVinylSketch(
  containerRef: HTMLElement,
  trackId: string,
  albumColor: string,
  artworkUrl: string | undefined,
  isPlaying: boolean,
  progress: number,
  onSeek?: (progress: number) => void
): VinylSketchInstance {
  console.log("[vinyl-sketch] createVinylSketch called with:", {
    containerRef,
    trackId,
    albumColor,
    artworkUrl,
    isPlaying,
    progress,
    containerWidth: containerRef.offsetWidth,
    containerHeight: containerRef.offsetHeight
  });

  let p5Instance: p5 | null = null;

  // Generate seed from track ID for unique, consistent art per song
  const generateSeed = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const sketch = (p: p5) => {
    console.log("[vinyl-sketch] Sketch function called, p5 instance:", p);

    let params: VinylSketchParams = {
      trackId,
      albumColor,
      artworkUrl,
      isPlaying,
      progress,
      onSeek
    };

    let seed: number;
    let grooves: GrooveRing[] = [];
    let rotation = 0;
    let rotationStartTime = 0;
    let centerRadius: number;
    let vinylRadius: number;
    let artworkImage: any = null; // p5.Image type

    // Cached values for performance (computed once, reused every frame)
    let baseHue: number;
    let baseSat: number;
    let baseBright: number;
    let paletteHue: number;
    let hueVariation: number;

    // Audio reactivity - separate bands for different visual effects
    let bassEnergy = 0;
    let midEnergy = 0;
    let trebleEnergy = 0;
    let bassSmooth = 0;
    let midSmooth = 0;
    let trebleSmooth = 0;
    // Less smoothing = more responsive (but still smooth enough to avoid jitter)
    const bassSmoothFactor = 0.25; // Bass needs quick response for kick drums
    const midSmoothFactor = 0.2;
    const trebleSmoothFactor = 0.15;

    // Color utilities
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
    };

    const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return [h * 360, s * 100, l * 100];
    };

    p.setup = () => {
      const width = containerRef.offsetWidth || 400;
      const height = containerRef.offsetHeight || 400;

      console.log("[vinyl-sketch] p.setup called, creating canvas:", { width, height });

      const canvas = p.createCanvas(width, height);
      canvas.parent(containerRef);

      console.log("[vinyl-sketch] Canvas created:", {
        canvasElement: canvas.elt,
        canvasParent: canvas.elt.parentElement,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        canvasStyle: canvas.elt.style.cssText
      });

      // Ensure canvas is visible with explicit styles (centered by parent flex container)
      canvas.elt.style.display = 'block';
      canvas.elt.style.zIndex = '2';

      initializeVinyl();

      // REMOVED: Touch seek functionality for performance
      // No interaction handlers needed

      console.log("[vinyl-sketch] Setup complete, vinylRadius:", vinylRadius);
    };

    const initializeVinyl = () => {
      // Use track ID for unique, reproducible generative art per song
      seed = generateSeed(params.trackId);
      p.randomSeed(seed);
      p.noiseSeed(seed);

      // Calculate dimensions
      vinylRadius = Math.min(p.width, p.height) * 0.45;
      centerRadius = vinylRadius * 0.3; // Album art area

      // PRE-COMPUTE colors once (never changes, eliminates pause/play visual jump)
      baseHue = p.random(0, 360);
      baseSat = p.random(65, 95);
      baseBright = p.random(18, 32);
      paletteHue = p.random(0, 360);
      hueVariation = p.random(40, 100);

      // Load artwork image if provided
      if (params.artworkUrl) {
        p.loadImage(params.artworkUrl, (img) => {
          artworkImage = img;
          console.log("[vinyl-sketch] Artwork loaded");
        }, () => {
          console.error("[vinyl-sketch] Failed to load artwork");
          artworkImage = null;
        });
      } else {
        artworkImage = null;
      }

      console.log("[vinyl-sketch] initializeVinyl:", {
        seed,
        vinylRadius,
        centerRadius,
        baseHue,
        paletteHue,
        hasArtwork: !!params.artworkUrl,
        canvasSize: { width: p.width, height: p.height }
      });

      // Generate grooves with pre-computed paths (CACHE for performance)
      grooves = [];
      const grooveCount = p.floor(p.random(25, 35)); // Optimized count
      const grooveSpacing = (vinylRadius - centerRadius) / grooveCount;
      const resolution = 72; // Points per groove (optimized for smoothness + speed)

      for (let i = 0; i < grooveCount; i++) {
        const radius = centerRadius + (i * grooveSpacing);
        const noiseOffset = p.random(0, 1000);
        const shimmerPhase = p.random(0, p.TWO_PI);
        const width = p.random(0.8, 2.2);
        const grooveHue = (paletteHue + (i / grooveCount) * hueVariation) % 360;

        // PRE-COMPUTE base groove path (noise displacement)
        const cachedPath: { x: number; y: number }[] = [];
        for (let angle = 0; angle <= 360; angle += 360 / resolution) {
          const rad = p.radians(angle);
          const noiseVal = p.noise(
            p.cos(rad) * 0.5 + noiseOffset,
            p.sin(rad) * 0.5 + noiseOffset,
            radius * 0.001
          );
          const displacement = p.map(noiseVal, 0, 1, -3, 3);
          const r = radius + displacement;

          cachedPath.push({
            x: p.cos(rad) * r,
            y: p.sin(rad) * r
          });
        }

        grooves.push({
          radius,
          noiseOffset,
          shimmerPhase,
          width,
          baseHue: grooveHue,
          cachedPath // Store pre-computed path!
        });
      }

      console.log("[vinyl-sketch] Generated", grooves.length, "grooves with cached paths");
    };

    p.draw = () => {
      // Always keep looping for smooth animations
      p.loop();

      // Update rotation using time-based calculation (matches CSS animation exactly)
      if (params.isPlaying) {
        if (rotationStartTime === 0) {
          rotationStartTime = p.millis();
        }
        const elapsed = (p.millis() - rotationStartTime) / 1000; // seconds
        rotation = (elapsed / 1.8) * (2 * Math.PI); // 1.8s per rotation = 33⅓ RPM
      } else {
        rotationStartTime = 0; // Reset when paused
      }

      // Get REAL audio energy from analyzer - separate frequency bands
      if (params.isPlaying && typeof window !== 'undefined') {
        const analyzer = getAudioAnalyzer();
        bassEnergy = analyzer.getBass();
        midEnergy = analyzer.getMid();
        trebleEnergy = analyzer.getTreble();

        // Debug logging every 60 frames (once per second at 60fps)
        if (p.frameCount % 60 === 0) {
          console.log('[Vinyl Audio]', {
            bass: bassEnergy.toFixed(2),
            mid: midEnergy.toFixed(2),
            treble: trebleEnergy.toFixed(2),
            bassSmooth: bassSmooth.toFixed(2),
            midSmooth: midSmooth.toFixed(2),
            trebleSmooth: trebleSmooth.toFixed(2)
          });
        }
      } else {
        bassEnergy = 0;
        midEnergy = 0;
        trebleEnergy = 0;
      }

      // Smooth each band separately for fluid animation
      bassSmooth += (bassEnergy - bassSmooth) * bassSmoothFactor;
      midSmooth += (midEnergy - midSmooth) * midSmoothFactor;
      trebleSmooth += (trebleEnergy - trebleSmooth) * trebleSmoothFactor;

      // Clear background - TRANSPARENT
      p.clear();

      // Center canvas
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(rotation);

      // Draw vinyl disc base
      drawVinylBase();

      // Draw grooves (using cached paths + audio reactivity)
      drawGrooves();

      // Draw center label
      drawCenterLabel();

      // Draw reflective overlay
      drawReflections();

      p.pop();
    };

    const drawVinylBase = () => {
      // Use PRE-COMPUTED colors (no randomness = no visual jump on pause/play)
      p.noStroke();

      // BASS makes the vinyl PULSE outward
      const bassPulse = bassSmooth * 25; // Up to 25px expansion on bass hits!

      // Dark outer edge with DRAMATIC bass-reactive glow
      const glowBoost = bassSmooth * 40; // Bass creates intense glow
      for (let i = 0; i < 10; i++) {
        const alpha = p.map(i, 0, 10, 50 + glowBoost, 0);
        p.colorMode(p.HSB);
        p.fill(baseHue, baseSat * 0.6, baseBright * 0.7 + bassSmooth * 20, alpha);
        p.circle(0, 0, vinylRadius * 2 + i * 3 + bassPulse);
      }

      // Main vinyl surface - pulses with bass
      p.colorMode(p.HSB);
      const dynamicBrightness = baseBright + midSmooth * 15; // Mids control brightness
      p.fill(baseHue, baseSat, dynamicBrightness);
      p.circle(0, 0, vinylRadius * 2 + bassPulse);
      p.colorMode(p.RGB); // Reset
    };

    const drawGrooves = () => {
      // ULTRA-OPTIMIZED: Use pre-computed paths and colors
      p.noFill();
      p.colorMode(p.HSB);

      // BASS creates MASSIVE displacement (grooves explode outward on bass hits!)
      const bassDisplacement = bassSmooth * 20; // Up to 20px displacement!

      // TREBLE controls shimmer speed (high notes make it sparkle faster)
      const trebleShimmerSpeed = 0.03 + trebleSmooth * 0.08;

      for (let i = 0; i < grooves.length; i++) {
        const groove = grooves[i];

        // Shimmer animation - TREBLE controls speed
        const shimmerIntensity = p.sin(groove.shimmerPhase + p.frameCount * trebleShimmerSpeed) * 0.5 + 0.5;

        // MIDS control saturation and brightness (vocals/guitars light it up!)
        const baseSaturation = p.map(i, 0, grooves.length, 70, 100);
        const saturation = baseSaturation + midSmooth * 30; // Mids boost saturation

        const baseBrightness = p.map(shimmerIntensity, 0, 1, 40, 65);
        const brightness = baseBrightness + midSmooth * 35; // Mids make it BRIGHT

        // HUE SHIFTS with music! Mids rotate hue, treble adds variation
        const hueShift = midSmooth * 30 + trebleSmooth * 15;
        const dynamicHue = (groove.baseHue + hueShift) % 360;

        // TREBLE controls transparency (high frequencies create shimmer/sparkle)
        const baseAlpha = p.map(i, 0, grooves.length, 60, 120);
        const alpha = baseAlpha + trebleSmooth * 60;

        p.stroke(dynamicHue, saturation, brightness, alpha);

        // BASS also makes grooves THICKER
        p.strokeWeight(groove.width + bassSmooth * 1.5);

        // Draw from CACHED path with DRAMATIC bass displacement
        if (groove.cachedPath) {
          p.beginShape();
          for (const point of groove.cachedPath) {
            const angle = Math.atan2(point.y, point.x);
            const dist = Math.sqrt(point.x * point.x + point.y * point.y);

            // Bass makes grooves EXPLODE outward, treble adds subtle flutter
            const reactiveR = dist + bassDisplacement + trebleSmooth * 3;

            p.vertex(
              Math.cos(angle) * reactiveR,
              Math.sin(angle) * reactiveR
            );
          }
          p.endShape(p.CLOSE);
        }
      }

      p.colorMode(p.RGB); // Reset
    };

    const drawCenterLabel = () => {
      // Center label background
      p.noStroke();
      p.fill(30, 30, 35);
      p.circle(0, 0, centerRadius * 2);

      // Draw artwork if loaded
      if (artworkImage) {
        p.push();
        // Clip to circle
        p.drawingContext.save();
        p.drawingContext.beginPath();
        p.drawingContext.arc(0, 0, centerRadius, 0, Math.PI * 2);
        p.drawingContext.clip();

        // Draw image centered and scaled
        const imgSize = centerRadius * 2;
        p.imageMode(p.CENTER);
        p.image(artworkImage, 0, 0, imgSize, imgSize);

        p.drawingContext.restore();
        p.pop();
      }

      // Inner spindle hole
      p.fill(20, 20, 25);
      p.circle(0, 0, centerRadius * 0.15);
    };

    const drawReflections = () => {
      // Subtle reflective gradient overlay
      p.noStroke();

      // Top-left highlight
      const highlightGradient = p.drawingContext.createRadialGradient(
        -vinylRadius * 0.3, -vinylRadius * 0.3, 0,
        -vinylRadius * 0.3, -vinylRadius * 0.3, vinylRadius * 0.8
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      p.drawingContext.fillStyle = highlightGradient;
      p.drawingContext.beginPath();
      p.drawingContext.arc(0, 0, vinylRadius, 0, Math.PI * 2);
      p.drawingContext.fill();
    };

    p.windowResized = () => {
      p.resizeCanvas(containerRef.offsetWidth, containerRef.offsetHeight);
      initializeVinyl();
    };

    // Public update method
    (p as any).updateParams = (newParams: Partial<VinylSketchParams>) => {
      console.log("[vinyl-sketch] updateParams called with:", newParams);

      let shouldReinitialize = false;

      // Track ID change = new song, completely regenerate art
      if (newParams.trackId !== undefined && newParams.trackId !== params.trackId) {
        console.log("[vinyl-sketch] New track ID, reinitializing:", newParams.trackId);
        params.trackId = newParams.trackId;
        shouldReinitialize = true;
      }

      if (newParams.albumColor !== undefined) {
        params.albumColor = newParams.albumColor;
      }

      if (newParams.artworkUrl !== undefined && newParams.artworkUrl !== params.artworkUrl) {
        params.artworkUrl = newParams.artworkUrl;
        // Reload artwork image
        if (params.artworkUrl) {
          p.loadImage(params.artworkUrl, (img) => {
            artworkImage = img;
            console.log("[vinyl-sketch] Artwork updated");
          }, () => {
            console.error("[vinyl-sketch] Failed to load new artwork");
            artworkImage = null;
          });
        } else {
          artworkImage = null;
        }
      }

      if (newParams.isPlaying !== undefined) {
        params.isPlaying = newParams.isPlaying;
        // Let draw() handle loop/noLoop logic
      }

      if (newParams.progress !== undefined) {
        params.progress = newParams.progress;
      }

      if (newParams.onSeek !== undefined) {
        params.onSeek = newParams.onSeek;
      }

      if (shouldReinitialize) {
        console.log("[vinyl-sketch] Reinitializing vinyl with new track");
        initializeVinyl();
      }
    };
  };

  // Create p5 instance
  // Note: Assumes p5 is available globally or imported
  if (typeof window !== 'undefined' && (window as any).p5) {
    const P5 = (window as any).p5;
    console.log("[vinyl-sketch] Creating p5 instance with P5 constructor:", P5);
    p5Instance = new P5(sketch);
    console.log("[vinyl-sketch] p5 instance created:", p5Instance);
  } else {
    console.error("[vinyl-sketch] p5 is not available on window!", {
      hasWindow: typeof window !== 'undefined',
      windowP5: (window as any)?.p5
    });
  }

  // Return both cleanup function and p5 instance reference
  return {
    cleanup: () => {
      console.log("[vinyl-sketch] Cleanup function called");
      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }
    },
    p5Instance
  };
}
