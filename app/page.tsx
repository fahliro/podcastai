'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  AudioEngine, 
  AudioAnalysis 
} from '@/lib/audio-analyzer';
import { 
  ORB_THEMES, 
  OrbTheme, 
  OrbSettings, 
  DEFAULT_ORB_SETTINGS 
} from '@/lib/orb-themes';
import { SiriOrbCanvas } from '@/components/SiriOrbCanvas';
import { AudioUploader } from '@/components/AudioUploader';
import { OrbControls } from '@/components/OrbControls';
import { VideoExporter } from '@/components/VideoExporter';

import { 
  Music, 
  Palette, 
  Film, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Activity, 
  SlidersHorizontal,
  Download,
  Info,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Move,
  RotateCcw
} from 'lucide-react';

export default function Home() {
  const [engine] = useState(() => new AudioEngine());
  const [activeTab, setActiveTab] = useState<'audio' | 'visual' | 'export'>('audio');
  const [activeTheme, setActiveTheme] = useState<OrbTheme>(ORB_THEMES[0]);
  const [settings, setSettings] = useState<OrbSettings>(DEFAULT_ORB_SETTINGS);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio state values
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis>({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    beat: false,
    rawFrequencyData: new Uint8Array(0)
  });
  const [audioName, setAudioName] = useState<string>('Belum ada audio diunggah');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMic, setIsMic] = useState<boolean>(false);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      if (duration === 0 && !isMic) {
        // Start demo synth sound if no audio file loaded yet
        engine.startDemoSynth();
      } else {
        engine.play();
      }
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      engine.setVolume(1.0);
      setIsMuted(false);
    } else {
      engine.setVolume(0);
      setIsMuted(true);
    }
  };

  // Keyboard shortcut listener (Spacebar for Play/Pause toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration, isMic]);

  // UI audio progress update loop (throttled to ~6 FPS to save 95% CPU, paused during export)
  useEffect(() => {
    let lastUiUpdate = 0;

    const updateAudio = (now: number) => {
      // If exporting video, pause React UI state updates to give 100% CPU to video encoding
      if (!isExporting && now - lastUiUpdate > 160) {
        lastUiUpdate = now;
        const analysis = engine.getAnalysis(settings.sensitivity);
        setAudioAnalysis(analysis);
        setAudioName(engine.audioName);
        setIsPlaying(engine.isPlaying);
        setDuration(engine.duration);
        setCurrentTime(engine.currentTime);
      }

      animFrameRef.current = requestAnimationFrame(updateAudio);
    };

    animFrameRef.current = requestAnimationFrame(updateAudio);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [engine, settings.sensitivity, isExporting]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSettingsChange = (newPartial: Partial<OrbSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const handleAudioLoaded = () => {
    setAudioName(engine.audioName);
    setIsPlaying(engine.isPlaying);
    setDuration(engine.duration);
  };

  const toggleFullscreen = () => {
    if (!previewContainerRef.current) return;
    if (!isFullscreen) {
      if (previewContainerRef.current.requestFullscreen) {
        previewContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              Siri Orb Studio
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                Video Studio HD
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Visualisator Siri Orb dinamis berbasis audio untuk konten video (Reels, TikTok, YouTube)
            </p>
          </div>
        </div>

        {/* Quick Theme Switcher Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          {ORB_THEMES.slice(0, 4).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTheme.id === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: t.colors[0] }}
              />
              {t.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </header>

      {/* Main Split Layout: Separated Control Panel & Siri Orb Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6 max-w-[1700px] w-full mx-auto">
        
        {/* Left Side: Control Studio Panel (Upload Audio, Visual Customization, Video Export) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          
          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('audio')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'audio'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Music className="w-4 h-4" />
              Upload Audio
            </button>

            <button
              onClick={() => setActiveTab('visual')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Palette className="w-4 h-4" />
              Desain Orb
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'export'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Film className="w-4 h-4" />
              Ekspor Video
            </button>
          </div>

          {/* Active Control View */}
          {activeTab === 'audio' && (
            <AudioUploader
              engine={engine}
              audioName={audioName}
              isPlaying={isPlaying}
              duration={duration}
              currentTime={currentTime}
              isMic={isMic}
              sensitivity={settings.sensitivity}
              onSensitivityChange={(val) => handleSettingsChange({ sensitivity: val })}
              onAudioLoaded={handleAudioLoaded}
            />
          )}

          {activeTab === 'visual' && (
            <OrbControls
              settings={settings}
              activeTheme={activeTheme}
              onThemeSelect={(t) => setActiveTheme(t)}
              onSettingsChange={handleSettingsChange}
            />
          )}

          {activeTab === 'export' && (
            <VideoExporter
              engine={engine}
              setIsExporting={setIsExporting}
              audioDuration={duration}
              aspectRatio={settings.aspectRatio}
              onAspectRatioChange={(ratio) => handleSettingsChange({ aspectRatio: ratio })}
            />
          )}

          {/* Live Audio Frequency Meter */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Respon Frekuensi Audio
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {isPlaying ? 'AKTIF' : 'DIAM'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-slate-400">
              <div className="flex flex-col gap-1">
                <span>BASS</span>
                <div className="h-12 bg-slate-950 rounded-lg overflow-hidden flex items-end p-0.5 border border-slate-800">
                  <div
                    className="w-full bg-cyan-400 rounded-sm transition-all duration-75"
                    style={{ height: `${Math.round(audioAnalysis.bass * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span>MID</span>
                <div className="h-12 bg-slate-950 rounded-lg overflow-hidden flex items-end p-0.5 border border-slate-800">
                  <div
                    className="w-full bg-purple-400 rounded-sm transition-all duration-75"
                    style={{ height: `${Math.round(audioAnalysis.mid * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span>TREBLE</span>
                <div className="h-12 bg-slate-950 rounded-lg overflow-hidden flex items-end p-0.5 border border-slate-800">
                  <div
                    className="w-full bg-pink-400 rounded-sm transition-all duration-75"
                    style={{ height: `${Math.round(audioAnalysis.treble * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span>VOLUME</span>
                <div className="h-12 bg-slate-950 rounded-lg overflow-hidden flex items-end p-0.5 border border-slate-800">
                  <div
                    className="w-full bg-emerald-400 rounded-sm transition-all duration-75"
                    style={{ height: `${Math.round(audioAnalysis.volume * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Siri Orb Preview Stage Area */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          
          {/* Siri Orb Preview Canvas Container Stage */}
          <div
            ref={previewContainerRef}
            className="relative flex-1 min-h-[520px] lg:min-h-[640px] bg-slate-900/60 border-2 border-slate-800 rounded-none overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6 backdrop-blur-md"
          >
            {/* Stage Overlay Header (Top Bar inside Stage Container) */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2.5 z-10 pointer-events-none pb-2">
              <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
                {/* Theme Name Badge */}
                <div className="flex items-center gap-2 bg-slate-950/85 border border-slate-800 rounded-full px-3 py-1.5 backdrop-blur-md">
                  <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">
                    {activeTheme.name}
                  </span>
                </div>

                {/* Floating Drag Indicator */}
                <div className="flex items-center gap-2 bg-slate-950/85 border border-slate-800 rounded-full px-3 py-1.5 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-pink-400" />
                    Tarik Orb (Floating)
                  </span>
                  {(settings.orbOffset?.x !== 0 || settings.orbOffset?.y !== 0) && (
                    <button
                      onClick={() => handleSettingsChange({ orbOffset: { x: 0, y: 0 } })}
                      className="ml-1 px-2 py-0.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset Posisi
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side Stage Controls */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="bg-slate-950/85 border border-slate-800 rounded-full px-3 py-1.5 font-mono text-xs text-cyan-400 backdrop-blur-md">
                  Format: {settings.aspectRatio} (1080×1920)
                </span>

                <button
                  onClick={toggleFullscreen}
                  className="bg-slate-950/85 hover:bg-slate-800 border border-slate-800 rounded-full p-2 text-slate-300 hover:text-white transition-all backdrop-blur-md"
                  title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Siri Orb Canvas Component Stage Frame (Inner 1080x1920 9:16 Poster Box) */}
            <div className="w-full flex-1 flex items-center justify-center my-auto py-2">
              {(() => {
                const { width: cWidth, height: cHeight, aspectClass } = (() => {
                  switch (settings.aspectRatio) {
                    case '9:16':
                      return { width: 1080, height: 1920, aspectClass: 'aspect-[9/16] max-w-[360px] sm:max-w-[400px] lg:max-w-[440px] w-full' };
                    case '1:1':
                      return { width: 1080, height: 1080, aspectClass: 'aspect-square max-w-[440px] w-full' };
                    case '16:9':
                      return { width: 1920, height: 1080, aspectClass: 'aspect-video max-w-[680px] w-full' };
                    default:
                      return { width: 1080, height: 1920, aspectClass: 'aspect-[9/16] max-w-[360px] sm:max-w-[400px] lg:max-w-[440px] w-full' };
                  }
                })();

                return (
                  <div className={`relative flex items-center justify-center rounded-none overflow-hidden transition-all duration-300 border-2 border-slate-700/90 ${aspectClass}`}>
                    <SiriOrbCanvas
                      theme={activeTheme}
                      settings={settings}
                      audioAnalysis={audioAnalysis}
                      engine={engine}
                      canvasWidth={cWidth}
                      canvasHeight={cHeight}
                      isExporting={isExporting}
                      onOffsetChange={(offset) => handleSettingsChange({ orbOffset: offset })}
                      className="w-full h-full"
                    />
                  </div>
                );
              })()}
            </div>

            {/* Shortcut Bar Audio Control - Floating Overlay at Bottom of Preview Container Stage */}
            <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md z-10 pt-2">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border flex-shrink-0 ${
                  isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400' 
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400'
                }`}
                title={isPlaying ? 'Jeda Audio (Pause) [Spasi]' : 'Putar Audio (Play) [Spasi]'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Track Info & Timeline Seek Slider */}
              <div className="flex-1 flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
                    {audioName}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {duration > 0 ? (
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => engine.seek(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                ) : (
                  <div className="h-1.5 w-full bg-slate-800 rounded-lg overflow-hidden">
                    <div className={`h-full bg-cyan-400/60 rounded-lg transition-all ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`} />
                  </div>
                )}
              </div>

              {/* Mute & Shortcut Info Badge */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-xl border transition-all ${
                    isMuted 
                      ? 'bg-red-500/20 text-red-300 border-red-500/50' 
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isMuted ? 'Aktifkan Suara' : 'Mute Suara'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hidden md:inline-block">
                  [Space] Play/Pause
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
