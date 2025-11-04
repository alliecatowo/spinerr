/**
 * Sonic Grooves - Vinyl Disc Visualization
 *
 * A generative art piece exploring the organic beauty of vinyl records.
 * Concentric grooves displaced by Perlin noise create shimmering, lifelike patterns.
 * Each album color produces a unique, reproducible groove pattern through seeded randomness.
 */

import type p5 from 'p5';

interface VinylSketchParams {
  albumColor: string;
  isPlaying: boolean;
  progress: number;
  onSeek?: (progress: number) => void;
}

interface GrooveRing {
  radius: number;
  noiseOffset: number;
  shimmerPhase: number;
  width: number;
}

export function createVinylSketch(
  containerRef: HTMLElement,
  albumColor: string,
  isPlaying: boolean,
  progress: number,
  onSeek?: (progress: number) => void
): () => void {
  let p5Instance: p5 | null = null;

  // Generate seed from album color for consistency
  const generateSeed = (color: string): number => {
    let hash = 0;
    for (let i = 0; i < color.length; i++) {
      hash = ((hash << 5) - hash) + color.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const sketch = (p: p5) => {
    let params: VinylSketchParams = {
      albumColor,
      isPlaying,
      progress,
      onSeek
    };

    let seed: number;
    let grooves: GrooveRing[] = [];
    let rotation = 0;
    let targetRotation = 0;
    let centerRadius: number;
    let vinylRadius: number;
    let isHovering = false;
    let hoverAngle = 0;
    let needsRedraw = true;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 60; // Target 60fps

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
      const canvas = p.createCanvas(containerRef.offsetWidth, containerRef.offsetHeight);
      canvas.parent(containerRef);

      initializeVinyl();

      // Set up interaction handlers
      canvas.mousePressed(() => handleInteraction());
      canvas.mouseMoved(() => {
        const d = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
        isHovering = d <= vinylRadius;
        if (isHovering) {
          hoverAngle = p.atan2(p.mouseY - p.height / 2, p.mouseX - p.width / 2);
          needsRedraw = true;
        }
      });
    };

    // Touch event handler (p5 global, not canvas method)
    p.touchStarted = () => {
      handleInteraction();
      return false; // Prevent default
    };

    const initializeVinyl = () => {
      seed = generateSeed(params.albumColor);
      p.randomSeed(seed);
      p.noiseSeed(seed);

      // Calculate dimensions
      vinylRadius = Math.min(p.width, p.height) * 0.45;
      centerRadius = vinylRadius * 0.3; // Album art area

      // Generate grooves with organic variation
      grooves = [];
      const grooveCount = p.floor(p.random(80, 120)); // Seeded random count
      const grooveSpacing = (vinylRadius - centerRadius) / grooveCount;

      for (let i = 0; i < grooveCount; i++) {
        const radius = centerRadius + (i * grooveSpacing);
        const noiseOffset = p.random(0, 1000);
        const shimmerPhase = p.random(0, p.TWO_PI);
        const width = p.random(0.8, 2.5);

        grooves.push({
          radius,
          noiseOffset,
          shimmerPhase,
          width
        });
      }

      needsRedraw = true;
    };

    const handleInteraction = () => {
      const d = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
      if (d <= vinylRadius && d >= centerRadius) {
        // Calculate angle relative to current rotation
        const angle = p.atan2(p.mouseY - p.height / 2, p.mouseX - p.width / 2);
        const normalizedAngle = (angle - rotation + p.TWO_PI) % p.TWO_PI;
        const seekProgress = normalizedAngle / p.TWO_PI;

        if (params.onSeek) {
          params.onSeek(seekProgress);
        }

        // Visual feedback
        needsRedraw = true;
      }
      return false; // Prevent default
    };

    p.draw = () => {
      const currentTime = Date.now();
      if (currentTime - lastFrameTime < frameInterval && !needsRedraw) {
        return; // Skip frame for performance
      }
      lastFrameTime = currentTime;

      // Update rotation
      if (params.isPlaying) {
        targetRotation += 0.02; // Vinyl RPM simulation
        needsRedraw = true;
      }

      // Smooth rotation interpolation
      const rotationDiff = targetRotation - rotation;
      if (Math.abs(rotationDiff) > 0.001) {
        rotation += rotationDiff * 0.1;
        needsRedraw = true;
      }

      if (!needsRedraw) {
        return;
      }

      // Clear background
      p.background(250, 249, 245);

      // Center canvas
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.rotate(rotation);

      // Draw vinyl disc base
      drawVinylBase();

      // Draw grooves with Perlin noise displacement
      drawGrooves();

      // Draw center label area (placeholder for album art)
      drawCenterLabel();

      // Draw reflective gradient overlay
      drawReflections();

      p.pop();

      // Draw hover indicator
      if (isHovering) {
        drawHoverIndicator();
      }

      needsRedraw = false;
    };

    const drawVinylBase = () => {
      // Vinyl disc gradient
      const [r, g, b] = hexToRgb(params.albumColor);
      const [h, s, l] = rgbToHsl(r, g, b);

      // Dark outer edge
      p.noStroke();
      for (let i = 0; i < 10; i++) {
        const alpha = p.map(i, 0, 10, 30, 0);
        p.fill(20, 20, 25, alpha);
        p.circle(0, 0, vinylRadius * 2 + i * 2);
      }

      // Main vinyl surface with subtle color variation
      const vinylColor = p.color(
        p.constrain(r * 0.3, 0, 255),
        p.constrain(g * 0.3, 0, 255),
        p.constrain(b * 0.3, 0, 255)
      );
      p.fill(vinylColor);
      p.circle(0, 0, vinylRadius * 2);
    };

    const drawGrooves = () => {
      const [r, g, b] = hexToRgb(params.albumColor);

      p.noFill();
      p.strokeWeight(1);

      for (const groove of grooves) {
        // Layered shimmer effect with transparency
        const shimmerLayers = 3;
        for (let layer = 0; layer < shimmerLayers; layer++) {
          const layerOffset = layer * 0.1;
          const shimmerIntensity = p.sin(groove.shimmerPhase + p.frameCount * 0.05 + layerOffset) * 0.5 + 0.5;

          // Color shifts based on shimmer
          const alpha = p.map(shimmerIntensity, 0, 1, 20, 80);
          p.stroke(
            p.constrain(r + shimmerIntensity * 30, 0, 255),
            p.constrain(g + shimmerIntensity * 30, 0, 255),
            p.constrain(b + shimmerIntensity * 30, 0, 255),
            alpha
          );

          p.strokeWeight(groove.width + layer * 0.5);

          // Draw groove with Perlin noise displacement
          p.beginShape();
          const resolution = 360; // Points around circle
          for (let angle = 0; angle <= 360; angle += 360 / resolution) {
            const rad = p.radians(angle);

            // Multi-octave Perlin noise for organic displacement
            const noiseVal = p.noise(
              p.cos(rad) * 0.5 + groove.noiseOffset,
              p.sin(rad) * 0.5 + groove.noiseOffset,
              groove.radius * 0.001
            );

            const displacement = p.map(noiseVal, 0, 1, -3, 3);
            const r = groove.radius + displacement;

            const x = p.cos(rad) * r;
            const y = p.sin(rad) * r;
            p.vertex(x, y);
          }
          p.endShape(p.CLOSE);
        }
      }
    };

    const drawCenterLabel = () => {
      // Center label area (album art will be overlaid via CSS)
      p.fill(240, 238, 230);
      p.stroke(180, 178, 170);
      p.strokeWeight(2);
      p.circle(0, 0, centerRadius * 2);

      // Inner circle detail
      p.noFill();
      p.stroke(200, 198, 190);
      p.strokeWeight(1);
      p.circle(0, 0, centerRadius * 0.4);
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

    const drawHoverIndicator = () => {
      p.push();
      p.translate(p.width / 2, p.height / 2);

      // Draw seek indicator line
      p.stroke(217, 119, 87, 150);
      p.strokeWeight(2);
      const indicatorLength = vinylRadius - centerRadius;
      p.line(
        p.cos(hoverAngle) * centerRadius,
        p.sin(hoverAngle) * centerRadius,
        p.cos(hoverAngle) * vinylRadius,
        p.sin(hoverAngle) * vinylRadius
      );

      p.pop();
    };

    p.windowResized = () => {
      p.resizeCanvas(containerRef.offsetWidth, containerRef.offsetHeight);
      initializeVinyl();
    };

    // Public update method
    (p as any).updateParams = (newParams: Partial<VinylSketchParams>) => {
      let shouldReinitialize = false;

      if (newParams.albumColor !== undefined && newParams.albumColor !== params.albumColor) {
        params.albumColor = newParams.albumColor;
        shouldReinitialize = true;
      }

      if (newParams.isPlaying !== undefined) {
        params.isPlaying = newParams.isPlaying;
        needsRedraw = true;
      }

      if (newParams.progress !== undefined) {
        params.progress = newParams.progress;
        targetRotation = newParams.progress * p.TWO_PI;
        needsRedraw = true;
      }

      if (newParams.onSeek !== undefined) {
        params.onSeek = newParams.onSeek;
      }

      if (shouldReinitialize) {
        initializeVinyl();
      }
    };
  };

  // Create p5 instance
  // Note: Assumes p5 is available globally or imported
  if (typeof window !== 'undefined' && (window as any).p5) {
    const P5 = (window as any).p5;
    p5Instance = new P5(sketch);
  }

  // Cleanup function
  return () => {
    if (p5Instance) {
      p5Instance.remove();
      p5Instance = null;
    }
  };
}
