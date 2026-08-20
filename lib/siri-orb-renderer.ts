import { SimplexNoise } from '@/lib/noise';
import { OrbTheme, OrbSettings } from '@/lib/orb-themes';

export interface Particle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  size: number;
  speed: number;
  alpha: number;
  hueOffset: number;
}

export interface AudioValues {
  bass: number;
  mid: number;
  treble: number;
  volume: number;
  beat?: boolean;
}

export function createParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: 0,
      y: 0,
      angle: Math.random() * Math.PI * 2,
      radius: 0.8 + Math.random() * 0.6,
      size: 1.5 + Math.random() * 2.5,
      speed: (0.3 + Math.random() * 0.7) * (Math.random() > 0.5 ? 1 : -1),
      alpha: 0.3 + Math.random() * 0.7,
      hueOffset: Math.random(),
    });
  }
  return particles;
}

export interface DrawOrbOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  dt: number;
  audio: AudioValues;
  theme: OrbTheme;
  settings: OrbSettings;
  noise: SimplexNoise;
  particles: Particle[];
  bgImage?: HTMLImageElement | ImageBitmap | null;
  offset?: { x: number; y: number };
  isExporting?: boolean;
}

export function drawSiriOrbFrame({
  ctx,
  width,
  height,
  time,
  dt,
  audio,
  theme,
  settings,
  noise,
  particles,
  bgImage,
  offset = { x: 0, y: 0 },
  isExporting = false,
}: DrawOrbOptions) {
  const { bass, mid, treble, volume } = audio;
  const centerX = width / 2 + (offset.x || 0);
  const centerY = height / 2 + (offset.y || 0);

  // 1. Clear Canvas
  ctx.clearRect(0, 0, width, height);

  // 2. Draw Solid Background (Always non-transparent for preview and video exports)
  const currentBg = settings.bgStyle;

  if (currentBg === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  } else if (currentBg === 'midnight') {
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, width, height);
  } else if (currentBg === 'gradient') {
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.1
    );
    bgGrad.addColorStop(0, '#131b2e');
    bgGrad.addColorStop(0.7, '#080d1a');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (currentBg === 'image' && bgImage) {
    const imgRatio = bgImage.width / bgImage.height;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;
    let drawX = 0;
    let drawY = 0;

    if (imgRatio > canvasRatio) {
      drawW = height * imgRatio;
      drawX = (width - drawW) / 2;
    } else {
      drawH = width / imgRatio;
      drawY = (height - drawH) / 2;
    }

    ctx.drawImage(bgImage, drawX, drawY, drawW, drawH);

    const dimAlpha = (settings.bgImageDim ?? 40) / 100;
    if (dimAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (currentBg === 'checkerboard') {
    if (!isExporting) {
      const tileSize = 32;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#1e293b';
      for (let y = 0; y < height; y += tileSize) {
        for (let x = 0; x < width; x += tileSize) {
          if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
            ctx.fillRect(x, y, tileSize, tileSize);
          }
        }
      }
    } else {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);
  }

  // Base dimensions driven by settings + gentle organic breathing pulse in idle mode + bass/volume in play mode
  const idlePulse = Math.sin(time * 1.8) * 0.025;
  const baseRadius = settings.size * (1 + idlePulse + bass * 0.25 + volume * 0.15);
  const deformAmount = settings.waveDeform * (0.35 + mid * 0.9 + volume * 0.5);

  // 3. Render Outer Glow Aura
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const glowRadius = baseRadius * (1.6 + volume * 0.4);
  const auraGrad = ctx.createRadialGradient(
    centerX,
    centerY,
    baseRadius * 0.5,
    centerX,
    centerY,
    glowRadius
  );
  auraGrad.addColorStop(0, theme.glowColor);
  auraGrad.addColorStop(
    0.6,
    theme.glowColor.replace(/[\d.]+\)$/, `${settings.glowIntensity * 0.3})`)
  );
  auraGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Render Multi-Layer Organic Siri Smooth Blobs
  const layers = theme.colors.length;
  const numPoints = 32;
  const pointsX = new Float32Array(numPoints);
  const pointsY = new Float32Array(numPoints);

  for (let layer = 0; layer < layers; layer++) {
    ctx.save();
    const color = theme.colors[layer];
    const layerTime = time * (0.8 + layer * 0.12) * (layer % 2 === 0 ? 1 : -1);
    const layerScale = 1 - layer * 0.07;
    const blobFreq = 0.5 + settings.waveComplexity * 0.08;

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 + layer;
    const opacitySetting = settings.orbOpacity ?? 1.0;
    ctx.globalAlpha = Math.min(
      1.0,
      (0.55 + (layer === 0 ? 0.25 : 0) + volume * 0.2) * opacitySetting
    );

    if (!settings.wireframeMode) {
      const mode = settings.blendMode || 'lighter';
      if (mode === 'normal') {
        ctx.globalCompositeOperation = 'source-over';
      } else if (mode === 'screen') {
        ctx.globalCompositeOperation = 'screen';
      } else {
        ctx.globalCompositeOperation = 'lighter';
      }
    }

    const nz = layerTime + layer * 0.8;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const nx = cosA * blobFreq;
      const ny = sinA * blobFreq;

      const nVal = noise.noise3D(nx, ny, nz);
      const nVal2 = noise.noise3D(nx * 1.5 + 5, ny * 1.5 + 5, nz * 0.6);

      const blobNoise = nVal * 0.8 + nVal2 * 0.2;
      const r = baseRadius * layerScale + blobNoise * deformAmount;

      pointsX[i] = centerX + cosA * r;
      pointsY[i] = centerY + sinA * r;
    }

    ctx.beginPath();
    const startX = (pointsX[numPoints - 1] + pointsX[0]) / 2;
    const startY = (pointsY[numPoints - 1] + pointsY[0]) / 2;

    ctx.moveTo(startX, startY);

    for (let i = 0; i < numPoints; i++) {
      const nextIdx = (i + 1) % numPoints;
      const midX = (pointsX[i] + pointsX[nextIdx]) / 2;
      const midY = (pointsY[i] + pointsY[nextIdx]) / 2;
      ctx.quadraticCurveTo(pointsX[i], pointsY[i], midX, midY);
    }

    ctx.closePath();

    if (settings.wireframeMode) {
      ctx.stroke();
    } else {
      ctx.fill();
    }

    ctx.restore();
  }

  // 5. Render Glowing Core
  if (settings.showCoreGlow) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = settings.coreOpacity ?? 0.6;
    const coreR = Math.max(10, baseRadius * (0.35 + bass * 0.2 + volume * 0.15));
    const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreR);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    coreGrad.addColorStop(0.4, theme.coreColor);
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 6. Render Glass Rim Highlight / Ring Reflection
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineWidth = 1.5 + treble * 2;
  const rimGrad = ctx.createLinearGradient(
    centerX - baseRadius,
    centerY - baseRadius,
    centerX + baseRadius,
    centerY + baseRadius
  );
  rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  rimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

  ctx.strokeStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius * 1.02, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 7. Render Orbiting Sparkle Particles
  if (particles && particles.length > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = theme.particleColor;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.angle += p.speed * dt * 0.8 * (1 + treble * 2);
      const currentRadius =
        baseRadius * p.radius + Math.sin(time * 2 + p.angle) * 15 * (1 + mid);
      const px = centerX + Math.cos(p.angle) * currentRadius;
      const py = centerY + Math.sin(p.angle) * currentRadius;

      const pSize = p.size * (1 + treble * 1.2 + (audio.beat ? 0.8 : 0));
      const pAlpha = Math.min(1.0, p.alpha * (0.4 + volume * 0.8));

      ctx.globalAlpha = pAlpha;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
