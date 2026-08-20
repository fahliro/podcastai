'use client';

import React, { useEffect, useRef } from 'react';
import { SimplexNoise } from '@/lib/noise';
import { AudioAnalysis, AudioEngine } from '@/lib/audio-analyzer';
import { OrbTheme, OrbSettings } from '@/lib/orb-themes';
import { drawSiriOrbFrame, createParticles, Particle } from '@/lib/siri-orb-renderer';

interface SiriOrbCanvasProps {
  theme: OrbTheme;
  settings: OrbSettings;
  audioAnalysis?: AudioAnalysis;
  engine?: AudioEngine;
  canvasWidth?: number;
  canvasHeight?: number;
  className?: string;
  isExporting?: boolean; // When true, background is strictly transparent for clean WebM recording
  onOffsetChange?: (offset: { x: number; y: number }) => void;
}

export const SiriOrbCanvas: React.FC<SiriOrbCanvasProps> = ({
  theme,
  settings,
  audioAnalysis,
  engine,
  canvasWidth = 800,
  canvasHeight = 800,
  className = '',
  isExporting = false,
  onOffsetChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const noiseRef = useRef<SimplexNoise>(new SimplexNoise(42));
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgLoadedUrlRef = useRef<string | null>(null);

  // Dragging state and position smooth lerp refs
  const isDraggingRef = useRef<boolean>(false);
  const targetOffsetRef = useRef({ x: settings.orbOffset?.x || 0, y: settings.orbOffset?.y || 0 });
  const currentOffsetRef = useRef({ x: settings.orbOffset?.x || 0, y: settings.orbOffset?.y || 0 });
  const dragStartRef = useRef<{ x: number; y: number; initialOffsetX: number; initialOffsetY: number }>({
    x: 0,
    y: 0,
    initialOffsetX: 0,
    initialOffsetY: 0
  });

  // Sync targetOffsetRef when settings.orbOffset changes externally (e.g. Reset Posisi button)
  useEffect(() => {
    if (!isDraggingRef.current) {
      targetOffsetRef.current = {
        x: settings.orbOffset?.x || 0,
        y: settings.orbOffset?.y || 0
      };
    }
  }, [settings.orbOffset?.x, settings.orbOffset?.y]);

  // Preload background image if bgStyle === 'image' and bgImage is provided
  useEffect(() => {
    if (settings.bgStyle === 'image' && settings.bgImage) {
      if (bgLoadedUrlRef.current !== settings.bgImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = settings.bgImage;
        img.onload = () => {
          bgImageRef.current = img;
          bgLoadedUrlRef.current = settings.bgImage;
        };
      }
    } else {
      bgImageRef.current = null;
      bgLoadedUrlRef.current = null;
    }
  }, [settings.bgStyle, settings.bgImage]);

  // Ref to always hold latest audio analysis fallback
  const audioAnalysisRef = useRef<AudioAnalysis | undefined>(audioAnalysis);
  useEffect(() => {
    audioAnalysisRef.current = audioAnalysis;
  }, [audioAnalysis]);

  // Smooth interpolated audio values for fluid motion without jerky steps
  const smoothAudio = useRef({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0
  });

  // Initialize Particles on particleCount change
  useEffect(() => {
    particlesRef.current = createParticles(settings.particleCount);
  }, [settings.particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const noise = noiseRef.current;
    let lastFrameTime = performance.now();

    const render = (now: number) => {
      // Calculate Delta Time in seconds (capped at 50ms) for rock-solid 60 FPS / 120 FPS
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      // Poll directly from AudioEngine for ultra-low latency & zero React re-render overhead
      const audio = engine 
        ? engine.getAnalysis(settings.sensitivity)
        : (audioAnalysisRef.current || { bass: 0, mid: 0, treble: 0, volume: 0, beat: false, rawFrequencyData: new Uint8Array(0) });

      // Frame-rate independent fast exponential lerp for instant audio beat response without lag
      const lerpFactor = 1 - Math.exp(-28 * dt);
      smoothAudio.current.bass += (audio.bass - smoothAudio.current.bass) * lerpFactor;
      smoothAudio.current.mid += (audio.mid - smoothAudio.current.mid) * lerpFactor;
      smoothAudio.current.treble += (audio.treble - smoothAudio.current.treble) * lerpFactor;
      smoothAudio.current.volume += (audio.volume - smoothAudio.current.volume) * lerpFactor;

      const { bass, mid, treble, volume } = smoothAudio.current;

      // Update continuous time with delta time
      const speedMult = settings.rotationSpeed * (1 + mid * 0.8);
      timeRef.current += dt * 0.8 * speedMult;
      const time = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;
      
      // Floating offset calculation with ultra-smooth exponential lerp
      const posLerp = 1 - Math.exp(-24 * dt);
      currentOffsetRef.current.x += (targetOffsetRef.current.x - currentOffsetRef.current.x) * posLerp;
      currentOffsetRef.current.y += (targetOffsetRef.current.y - currentOffsetRef.current.y) * posLerp;

      drawSiriOrbFrame({
        ctx,
        width,
        height,
        time,
        dt,
        audio: { bass, mid, treble, volume, beat: audio.beat },
        theme,
        settings,
        noise,
        particles: particlesRef.current,
        bgImage: bgImageRef.current,
        offset: currentOffsetRef.current,
        isExporting,
      });

      if (isExporting) {
        window.dispatchEvent(new CustomEvent('orb-frame-rendered'));
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [theme, settings, isExporting, canvasWidth, canvasHeight, engine]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onOffsetChange) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: targetOffsetRef.current.x,
      initialOffsetY: targetOffsetRef.current.y
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const dx = (e.clientX - dragStartRef.current.x) * scaleX;
    const dy = (e.clientY - dragStartRef.current.y) * scaleY;

    targetOffsetRef.current = {
      x: dragStartRef.current.initialOffsetX + dx,
      y: dragStartRef.current.initialOffsetY + dy
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      if (onOffsetChange) {
        onOffsetChange({
          x: Math.round(targetOffsetRef.current.x),
          y: Math.round(targetOffsetRef.current.y)
        });
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`max-w-full max-h-full object-contain ${
          onOffsetChange ? 'cursor-grab active:cursor-grabbing touch-none' : ''
        }`}
      />
    </div>
  );
};
