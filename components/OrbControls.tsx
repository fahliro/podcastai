'use client';

import React, { useRef } from 'react';
import { 
  Palette, 
  Eye, 
  Zap, 
  Sparkles, 
  Maximize2, 
  Activity, 
  CircleDot,
  Smartphone,
  Square,
  Tv,
  Image as ImageIcon,
  Upload,
  Move,
  RotateCcw,
  LayoutGrid,
  Sun
} from 'lucide-react';
import { ORB_THEMES, PRESET_POSTER_BGS, OrbTheme, OrbSettings } from '@/lib/orb-themes';

interface OrbControlsProps {
  settings: OrbSettings;
  activeTheme: OrbTheme;
  onThemeSelect: (theme: OrbTheme) => void;
  onSettingsChange: (newSettings: Partial<OrbSettings>) => void;
}

export const OrbControls: React.FC<OrbControlsProps> = ({
  settings,
  activeTheme,
  onThemeSelect,
  onSettingsChange
}) => {
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSettingsChange({
            bgStyle: 'image',
            bgImage: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="orb-controls-panel" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Desain Visual Siri Orb</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800/50 font-medium">
          Kustomisasi
        </span>
      </div>

      {/* Frame / Canvas Aspect Ratio Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            Format Ukuran Preview / Stage
          </span>
          <span className="text-[11px] font-mono text-cyan-400">{settings.aspectRatio}</span>
        </label>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: '9:16', label: 'TikTok / Reels (9:16)', icon: Smartphone },
            { id: '1:1', label: 'Square (1:1)', icon: Square },
            { id: '16:9', label: 'Landscape (16:9)', icon: Tv },
            { id: 'free', label: 'Full / Free', icon: LayoutGrid },
          ].map((ratio) => {
            const IconComponent = ratio.icon;
            const isSelected = settings.aspectRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                onClick={() => onSettingsChange({ aspectRatio: ratio.id as OrbSettings['aspectRatio'] })}
                className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/80 font-bold shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-[10px] truncate">{ratio.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Theme Selection Grid */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tema Gradien Siri
          </span>
          <span className="text-[11px] font-mono text-amber-400 font-medium">
            ({ORB_THEMES.length} Tema)
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {ORB_THEMES.map((theme) => {
            const isSelected = theme.id === activeTheme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onThemeSelect(theme)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  )}
                </div>

                {/* Color swatch preview pill */}
                <div className="h-2.5 w-full rounded-full flex overflow-hidden border border-slate-700/50">
                  {theme.colors.map((c, idx) => (
                    <div
                      key={idx}
                      className="h-full flex-1"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Orb Position Controls */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-pink-400 flex-shrink-0 animate-bounce" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">Orb Floating Status</span>
            <span className="text-[11px] text-slate-400 font-mono">
              X: {settings.orbOffset?.x || 0}px | Y: {settings.orbOffset?.y || 0}px
            </span>
          </div>
        </div>

        <button
          onClick={() => onSettingsChange({ orbOffset: { x: 0, y: 0 } })}
          disabled={!settings.orbOffset?.x && !settings.orbOffset?.y}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Posisi
        </button>
      </div>

      {/* Background Mode & Image Poster Picker */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Latar Belakang Video (Solid Non-Transparan)
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">Solid HD</span>
        </label>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'dark', label: 'Deep Slate' },
            { id: 'black', label: 'Hitam Pekat' },
            { id: 'midnight', label: 'Midnight' },
            { id: 'gradient', label: 'Gradien Radial' },
          ].map((bg) => (
            <button
              key={bg.id}
              onClick={() => onSettingsChange({ bgStyle: bg.id as OrbSettings['bgStyle'] })}
              className={`px-2 py-2 rounded-lg text-[11px] font-medium border transition-all text-center ${
                settings.bgStyle === bg.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-semibold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>

        {/* Custom Poster Image Upload & Presets */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              Gambar Latar Custom / Poster
            </span>

            <button
              onClick={() => bgFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Gambar
            </button>

            <input
              type="file"
              ref={bgFileInputRef}
              onChange={handleBgImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Background Image Darkness Slider (visible when image background is selected) */}
          {settings.bgStyle === 'image' && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  Kegelapan Gambar Latar (Dim Overlay)
                </span>
                <span className="font-mono text-emerald-400">{settings.bgImageDim ?? 40}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={settings.bgImageDim ?? 40}
                onChange={(e) => onSettingsChange({ bgImageDim: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] text-slate-400">
                Gunakan slider ini untuk menggelapkan latar belakang poster agar Orb menyala lebih terang.
              </span>
            </div>
          )}

          {/* Preset Background Images Swatch */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_POSTER_BGS.map((poster) => {
              const isSelected = settings.bgStyle === 'image' && settings.bgImage === poster.url;
              return (
                <button
                  key={poster.id}
                  onClick={() => onSettingsChange({ bgStyle: 'image', bgImage: poster.url })}
                  className={`relative aspect-video rounded-lg overflow-hidden border transition-all ${
                    isSelected
                      ? 'border-emerald-400 ring-2 ring-emerald-400/50 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                  }`}
                  title={poster.name}
                >
                  <img src={poster.thumbnail} alt={poster.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-white font-medium px-1 py-0.5 truncate text-center">
                    {poster.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fine-Tuning Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
        {/* Size Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-cyan-400" /> Ukuran Orb
            </span>
            <span className="font-mono text-cyan-400">{settings.size}px</span>
          </div>
          <input
            type="range"
            min={120}
            max={360}
            step={10}
            value={settings.size}
            onChange={(e) => onSettingsChange({ size: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Rotation Speed */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> Kecepatan Rotasi
            </span>
            <span className="font-mono text-purple-400">{settings.rotationSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={settings.rotationSpeed}
            onChange={(e) => onSettingsChange({ rotationSpeed: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        {/* Wave Deformation Amplitude */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-pink-400" /> Deformasi Smooth Blob
            </span>
            <span className="font-mono text-pink-400">{settings.waveDeform}</span>
          </div>
          <input
            type="range"
            min={20}
            max={120}
            step={5}
            value={settings.waveDeform}
            onChange={(e) => onSettingsChange({ waveDeform: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
          />
        </div>

        {/* Glow Bloom Intensity */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <CircleDot className="w-3 h-3 text-emerald-400" /> Intensitas Glow
            </span>
            <span className="font-mono text-emerald-400">{Math.round(settings.glowIntensity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1.0}
            step={0.05}
            value={settings.glowIntensity}
            onChange={(e) => onSettingsChange({ glowIntensity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Orb Opacity / Transparency Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-300" /> Transparansi / Opacity Orb
            </span>
            <span className="font-mono text-cyan-300">{Math.round((settings.orbOpacity ?? 1.0) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1.0}
            step={0.05}
            value={settings.orbOpacity ?? 1.0}
            onChange={(e) => onSettingsChange({ orbOpacity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-300"
          />
        </div>

        {/* Color Blending Mode Selector */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 text-purple-300">
              <Palette className="w-3.5 h-3.5" />
              Mode Blending Warna (Komposisi Wujud Orb)
            </span>
            <span className="font-mono text-purple-300 uppercase text-[10px]">{settings.blendMode || 'lighter'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'lighter', label: 'Vibrant Light (Neon Glowing)' },
              { id: 'normal', label: 'Pekat Solid (Deep Clear)' },
              { id: 'screen', label: 'Soft Screen (Halus Soft)' }
            ].map((bm) => (
              <button
                key={bm.id}
                onClick={() => onSettingsChange({ blendMode: bm.id as OrbSettings['blendMode'] })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all text-center ${
                  (settings.blendMode || 'lighter') === bm.id
                    ? 'bg-purple-500/25 text-purple-200 border-purple-500/80 font-bold shadow-md shadow-purple-500/10'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Particle Count */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Jumlah Partikel Kilau (Sparkles)
            </span>
            <span className="font-mono text-amber-400">{settings.particleCount}</span>
          </div>
          <input
            type="range"
            min={0}
            max={70}
            step={5}
            value={settings.particleCount}
            onChange={(e) => onSettingsChange({ particleCount: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Core Light Opacity Slider */}
        {settings.showCoreGlow && (
          <div className="flex flex-col gap-1.5 sm:col-span-2 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1 text-cyan-300 font-medium">
                <Sun className="w-3 h-3 text-cyan-400" /> Opacity Inti Cahaya (Core Light Translucency)
              </span>
              <span className="font-mono text-cyan-300">{Math.round((settings.coreOpacity ?? 0.6) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={settings.coreOpacity ?? 0.6}
              onChange={(e) => onSettingsChange({ coreOpacity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] text-slate-400">
              Atur opacity pendaran tengah agar tidak solid/kaku dan menyatu secara transparan dengan gradien orb.
            </span>
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showCoreGlow}
            onChange={(e) => onSettingsChange({ showCoreGlow: e.target.checked })}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          Pendaran Inti Putih (Core Light)
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.wireframeMode}
            onChange={(e) => onSettingsChange({ wireframeMode: e.target.checked })}
            className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0 cursor-pointer"
          />
          Mode Garis Geometric (Wireframe)
        </label>
      </div>
    </div>
  );
};
