import React, { useEffect, useRef, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { SimplexNoise } from '@/lib/noise';
import { ORB_THEMES, DEFAULT_ORB_SETTINGS, OrbTheme, OrbSettings } from '@/lib/orb-themes';
import { drawSiriOrbFrame, createParticles, Particle, AudioValues } from '@/lib/siri-orb-renderer';
import { RemotionSiriOrbProps } from './types';

export const SiriOrbComposition: React.FC<RemotionSiriOrbProps> = ({
  theme: customTheme,
  themeId,
  settings: partialSettings,
  audioUrl,
  audioSamples,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resolve theme
  const theme: OrbTheme = useMemo(() => {
    if (customTheme) return customTheme;
    if (themeId) {
      const found = ORB_THEMES.find((t) => t.id === themeId);
      if (found) return found;
    }
    return ORB_THEMES[0];
  }, [customTheme, themeId]);

  // Resolve settings
  const settings: OrbSettings = useMemo(() => {
    return {
      ...DEFAULT_ORB_SETTINGS,
      ...(partialSettings || {}),
    };
  }, [partialSettings]);

  // Seeded noise and deterministic particles
  const noise = useMemo(() => new SimplexNoise(42), []);
  const particles: Particle[] = useMemo(() => {
    return createParticles(settings.particleCount);
  }, [settings.particleCount]);

  // Pre-load background image if needed
  const [bgImageElement, setBgImageElement] = React.useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let isMounted = true;
    if (settings.bgStyle === 'image' && settings.bgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = settings.bgImage;
      img.onload = () => {
        if (isMounted) setBgImageElement(img);
      };
    }
    return () => {
      isMounted = false;
    };
  }, [settings.bgStyle, settings.bgImage]);

  // Compute audio values for the current frame
  const audioValues: AudioValues = useMemo(() => {
    if (audioSamples && audioSamples.length > 0) {
      const sample = audioSamples[frame] || audioSamples[audioSamples.length - 1];
      if (sample) {
        return {
          bass: sample.bass,
          mid: sample.mid,
          treble: sample.treble,
          volume: sample.volume,
          beat: sample.beat,
        };
      }
    }

    // Mathematical synthetic audio waveform when raw FFT samples are not supplied
    const t = frame / fps;
    const sens = settings.sensitivity || 1.2;
    const bass = Math.min(1.0, (0.3 + 0.35 * Math.sin(t * 5.2) + 0.2 * Math.cos(t * 10.4)) * sens);
    const mid = Math.min(1.0, (0.25 + 0.3 * Math.sin(t * 8.1 + 1.2)) * sens);
    const treble = Math.min(1.0, (0.2 + 0.25 * Math.cos(t * 14.3 + 0.5)) * sens);
    const volume = (bass * 0.5 + mid * 0.3 + treble * 0.2);
    const beat = bass > 0.65;

    return {
      bass: Math.max(0, bass),
      mid: Math.max(0, mid),
      treble: Math.max(0, treble),
      volume: Math.max(0, volume),
      beat,
    };
  }, [audioSamples, frame, fps, settings.sensitivity]);

  // Paint the canvas frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = 1 / fps;
    const time = (frame / fps) * settings.rotationSpeed;

    drawSiriOrbFrame({
      ctx,
      width,
      height,
      time,
      dt,
      audio: audioValues,
      theme,
      settings,
      noise,
      particles,
      bgImage: bgImageElement,
      offset: settings.orbOffset || { x: 0, y: 0 },
      isExporting: true,
    });
  }, [frame, fps, width, height, audioValues, theme, settings, noise, particles, bgImageElement]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090d16',
        overflow: 'hidden',
      }}
    >
      {audioUrl && <Audio src={audioUrl.startsWith('/') ? staticFile(audioUrl) : audioUrl} />}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};
