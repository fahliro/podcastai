'use client';

import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Music, 
  FileAudio, 
  RotateCcw,
  Sliders
} from 'lucide-react';
import { AudioEngine } from '@/lib/audio-analyzer';

interface AudioUploaderProps {
  engine: AudioEngine;
  audioName: string;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  isMic: boolean;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  onAudioLoaded: () => void;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  engine,
  audioName,
  isPlaying,
  duration,
  currentTime,
  isMic,
  sensitivity,
  onSensitivityChange,
  onAudioLoaded
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [demoActive, setDemoActive] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileSelected = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setMicActive(false);
    setDemoActive(false);
    try {
      await engine.loadFile(file);
      onAudioLoaded();
    } catch (err) {
      alert('Gagal memuat file audio. Pastikan format file didukung (MP3, WAV, M4A, OGG, dll).');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const toggleMic = async () => {
    if (micActive) {
      engine.stopAll();
      setMicActive(false);
      onAudioLoaded();
    } else {
      setLoading(true);
      try {
        await engine.connectMicrophone();
        setMicActive(true);
        setDemoActive(false);
        onAudioLoaded();
      } catch (err) {
        alert('Tidak dapat mengaktifkan mikrofon.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleDemoSynth = () => {
    if (demoActive) {
      engine.stopAll();
      setDemoActive(false);
    } else {
      engine.startDemoSynth();
      setDemoActive(true);
      setMicActive(false);
    }
    onAudioLoaded();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      engine.pause();
    } else {
      engine.play();
    }
    onAudioLoaded();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    engine.seek(val);
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

  return (
    <div id="audio-uploader-panel" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Audio Input & Kontrol</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-medium">
          Source Audio
        </span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-cyan-400 bg-cyan-950/40 scale-[0.99]' 
            : 'border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-800/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          accept="audio/*"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-cyan-500/10 rounded-full text-cyan-400 border border-cyan-500/20 mb-1">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            {loading ? 'Memuat file audio...' : 'Klik atau Tarik File Audio di sini'}
          </p>
          <p className="text-xs text-slate-400">
            Mendukung MP3, WAV, M4A, OGG, AAC (Maks. 50MB)
          </p>
        </div>
      </div>

      {/* Alternative Input Methods: Live Mic & AI Voice Demo */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={toggleMic}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
            micActive
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Mic className={`w-4 h-4 ${micActive ? 'animate-pulse text-emerald-400' : ''}`} />
          {micActive ? 'Mikrofon Aktif' : 'Gunakan Mikrofon'}
        </button>

        <button
          onClick={toggleDemoSynth}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
            demoActive
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${demoActive ? 'animate-spin text-purple-400' : ''}`} />
          {demoActive ? 'Demo AI Voice' : 'Coba Demo Voice AI'}
        </button>
      </div>

      {/* Currently Loaded Audio & Playback Controls */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <FileAudio className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-200 truncate">
              {audioName}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Seek slider (disabled on live mic) */}
        {!isMic && !demoActive && (
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime || 0}
            onChange={handleSeek}
            disabled={!duration}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        )}

        <div className="flex items-center justify-between pt-1">
          {/* Play / Pause button */}
          {!isMic && !demoActive ? (
            <button
              onClick={togglePlayPause}
              disabled={!duration}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Jeda' : 'Putar Audio'}
            </button>
          ) : (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Stream Memproses...
            </span>
          )}

          {/* Volume toggle */}
          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Audio Sensitivity Slider */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Sensitivitas Gerak Orb
          </span>
          <span className="font-mono text-cyan-400">{sensitivity.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2.5}
          step={0.1}
          value={sensitivity}
          onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <p className="text-[11px] text-slate-400">
          Tingkatkan untuk membuat Siri Orb lebih agresif merespons vokal/suara pelan.
        </p>
      </div>
    </div>
  );
};
