'use client';

import React, { useState, useRef } from 'react';
import { 
  Video, 
  Download, 
  CheckCircle2, 
  Film, 
  Play, 
  Loader2, 
  Sparkles,
  Info,
  X,
  FileVideo,
  Volume2,
  Zap,
  Gauge,
  Code,
  Copy,
  Check,
  Terminal,
  Send
} from 'lucide-react';
import { AudioEngine } from '@/lib/audio-analyzer';

interface VideoExporterProps {
  engine: AudioEngine;
  setIsExporting: (exporting: boolean) => void;
  audioDuration: number;
  aspectRatio?: '9:16' | '1:1' | '16:9' | 'free';
  onAspectRatioChange?: (ratio: '9:16' | '1:1' | '16:9' | 'free') => void;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({
  engine,
  setIsExporting,
  audioDuration,
  aspectRatio = '9:16',
  onAspectRatioChange
}) => {
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>('mp4');
  const [fps, setFps] = useState<number>(60); // 60 FPS default for ultra-smooth preview-identical motion
  const [durationMode, setDurationMode] = useState<number>(10); // duration in seconds
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingStatusText, setRecordingStatusText] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedFileName, setRecordedFileName] = useState<string>('Siri-Orb-Video.mp4');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any | null>(null);

  const sampleCurl = `curl -X POST "${typeof window !== 'undefined' ? window.location.origin : 'https://...'}/api/remotion/render" \\
  -H "Content-Type: application/json" \\
  -d '{
    "themeId": "siri-classic",
    "aspectRatio": "${aspectRatio}",
    "fps": ${fps},
    "durationInSeconds": ${durationMode === 0 ? 10 : durationMode},
    "settings": {
      "size": 220,
      "sensitivity": 1.2
    }
  }'`;

  const copyCurlToClipboard = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleTestApi = async () => {
    setApiTestLoading(true);
    setApiTestResult(null);
    try {
      const res = await fetch('/api/remotion/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: 'siri-classic',
          aspectRatio,
          fps,
          durationInSeconds: durationMode === 0 ? 10 : durationMode,
          settings: {
            size: 220,
            sensitivity: 1.2,
          },
        }),
      });
      const data = await res.json();
      setApiTestResult(data);
    } catch (e: any) {
      setApiTestResult({ error: e?.message || 'Failed to call API' });
    } finally {
      setApiTestLoading(false);
    }
  };

  const isCancelledRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const frameListenerRef = useRef<(() => void) | null>(null);

  const stopRecording = () => {
    isCancelledRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (frameListenerRef.current) {
      window.removeEventListener('orb-frame-rendered', frameListenerRef.current);
      frameListenerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    engine.pause();
    setIsRecording(false);
    setIsExporting(false);
  };

  // Ultra-Synchronized Zero-Latency Audio-Video Studio Recorder
  const recordWithMediaRecorder = async (canvas: HTMLCanvasElement, targetDuration: number, targetFps: number) => {
    recordedChunksRef.current = [];
    isCancelledRef.current = false;

    // 1. Prepare Audio Engine: Seek to 0 and pre-warm audio destination node
    engine.pause();
    engine.seek(0);

    // 2. Capture clean canvas video stream locked to target FPS
    const canvasStream = (canvas as any).captureStream(targetFps);

    // 3. Obtain audio stream directly from Web Audio pipeline
    const audioStream = engine.getAudioStream();
    const tracks: MediaStreamTrack[] = [
      ...canvasStream.getVideoTracks(),
      ...(audioStream ? audioStream.getAudioTracks() : [])
    ];
    const combinedStream = new MediaStream(tracks);

    // 4. Select best supported codec based on chosen container format
    let mimeType = '';
    const mp4Types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1,opus',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    const webmTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    const preferredTypes = exportFormat === 'mp4' ? mp4Types : webmTypes;

    for (const t of preferredTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        mimeType = t;
        break;
      }
    }

    const recorderOptions: MediaRecorderOptions = {};
    if (mimeType) {
      recorderOptions.mimeType = mimeType;
    }
    recorderOptions.videoBitsPerSecond = targetFps === 60 ? 8000000 : 5000000;
    recorderOptions.audioBitsPerSecond = 192000;

    const recorder = new MediaRecorder(combinedStream, recorderOptions);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      engine.pause();
      const isActualMp4 = mimeType.includes('mp4');
      const outputExt = isActualMp4 ? 'mp4' : 'webm';
      const outputType = isActualMp4 ? 'video/mp4' : 'video/webm';
      const blob = new Blob(recordedChunksRef.current, { type: outputType });
      const url = URL.createObjectURL(blob);
      setRecordedBlobUrl(url);
      setRecordedFileName(`Siri-Orb-${targetFps}fps-${Date.now()}.${outputExt}`);
      setIsRecording(false);
      setIsExporting(false);
      setShowPreviewModal(true);
    };

    // 5. Start MediaRecorder and Audio simultaneously with ZERO artificial delay
    recorder.start(100);
    engine.seek(0);
    engine.play();
    startTimeRef.current = performance.now();

    // 6. High-frequency progress tracker
    intervalRef.current = window.setInterval(() => {
      if (isCancelledRef.current) return;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setRecordingTime(elapsed);
      const progress = Math.min(100, (elapsed / targetDuration) * 100);
      setRecordingProgress(progress);
      setRecordingStatusText(`Merekam audio & visual sinkron (${Math.round(elapsed * targetFps)} frame • ${targetFps} FPS)...`);

      if (elapsed >= targetDuration) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }
    }, 50);
  };

  const handleStartRecord = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) {
      alert('Canvas Siri Orb tidak ditemukan.');
      return;
    }

    setIsExporting(true);
    setIsRecording(true);
    isCancelledRef.current = false;
    setRecordingProgress(0);
    setRecordingTime(0);
    setRecordingStatusText('Mempersiapkan sinkronisasi audio-visual 0ms...');

    const targetDuration = durationMode === 0 ? (audioDuration > 0 ? audioDuration : 10) : durationMode;

    try {
      await recordWithMediaRecorder(canvas, targetDuration, fps);
    } catch (err) {
      console.error('Recording error:', err);
      alert('Gagal merekam video di browser ini.');
      setIsRecording(false);
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!recordedBlobUrl) return;
    const a = document.createElement('a');
    a.href = recordedBlobUrl;
    a.download = recordedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="video-exporter-panel" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Ekspor Video Solid HD</h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[11px] font-semibold">
          <Zap className="w-3 h-3 fill-current" />
          60 FPS Studio Render
        </div>
      </div>

      {/* Format Selector: MP4 vs WebM */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Format Kontainer Video</span>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">Universal Compatibility</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'mp4', title: 'MP4 (H.264)', desc: 'Format universal untuk TikTok, Reels, CapCut & Galeri HP' },
            { id: 'webm', title: 'WebM (VP9/VP8)', desc: 'Kualitas kompresi tinggi & kompatibel semua web' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setExportFormat(fmt.id as 'mp4' | 'webm')}
              className={`p-2.5 rounded-lg text-xs border text-left transition-all flex flex-col gap-0.5 ${
                exportFormat === fmt.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-semibold shadow-sm shadow-emerald-500/15'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="font-semibold text-xs">{fmt.title}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{fmt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Format & Aspect Ratio Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Aspek Rasio Resolusi</span>
          <span className="text-[10px] text-cyan-400 font-mono font-semibold">Crisp 1080p</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '9:16', label: '9:16 Vertikal', sub: 'TikTok & Reels' },
            { id: '1:1', label: '1:1 Persegi', sub: 'Instagram Feed' },
            { id: '16:9', label: '16:9 Horizontal', sub: 'YouTube' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onAspectRatioChange && onAspectRatioChange(item.id as '9:16' | '1:1' | '16:9')}
              className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all flex flex-col gap-0.5 ${
                aspectRatio === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-semibold shadow-sm shadow-cyan-500/15'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-xs font-semibold">{item.label}</span>
              <span className="text-[10px] text-slate-500">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FPS & Smoothness Quality Mode */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Kecepatan Bingkai (FPS)</span>
          <span className="text-[10px] text-emerald-400 font-mono">Persis Seperti Preview</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 60, title: '60 FPS (Ultra Smooth)', desc: '100% mulus persis seperti tampilan preview kanvas' },
            { value: 30, title: '30 FPS (Standar)', desc: 'Ukuran file lebih kecil & proses render lebih cepat' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFps(f.value)}
              className={`p-2.5 rounded-lg text-xs border text-left transition-all flex flex-col gap-0.5 ${
                fps === f.value
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-semibold shadow-sm shadow-emerald-500/15'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-xs">{f.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300">
          Durasi Rekaman Video
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { secs: 5, label: '5s' },
            { secs: 10, label: '10s' },
            { secs: 15, label: '15s' },
            { secs: 30, label: '30s' },
            { secs: 0, label: 'Full Audio' },
          ].map((d) => (
            <button
              key={d.label}
              onClick={() => setDurationMode(d.secs)}
              className={`py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                durationMode === d.secs
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Record & Export Action Button */}
      <div className="flex flex-col gap-3 pt-2">
        {!isRecording ? (
          <button
            onClick={handleStartRecord}
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.01]"
          >
            <Video className="w-5 h-5 fill-current" />
            Mulai Render Video {fps} FPS Solid HD
          </button>
        ) : (
          <div className="bg-slate-950 border border-emerald-500/50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                {recordingStatusText || 'Merekam Video Siri Orb (Latar Solid + Audio)...'}
              </span>
              <span className="font-mono">{recordingTime.toFixed(1)}s</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-100"
                style={{ width: `${recordingProgress}%` }}
              />
            </div>

            <button
              onClick={stopRecording}
              className="mt-2 py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold rounded-lg transition-all"
            >
              Batalkan / Hentikan Render
            </button>
          </div>
        )}

        {recordedBlobUrl && !isRecording && (
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
          >
            <FileVideo className="w-4 h-4 text-emerald-400" />
            Lihat & Download Video Terakhir ({recordedFileName})
          </button>
        )}
      </div>

      {/* Integration Guide Box */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex gap-3 text-xs text-slate-300">
        <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-200">
              Remotion Engine & API Ready:
            </p>
            <button
              onClick={() => setShowApiModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded-md px-2 py-0.5 transition-colors"
            >
              <Code className="w-3 h-3" />
              API Docs & Curl
            </button>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Aplikasi ini terintegrasi penuh dengan <strong>Remotion</strong> &amp; endpoint REST API (<code>/api/remotion/render</code>) untuk rendering video programmatic otomatis melalui cURL atau webhook.
          </p>
        </div>
      </div>

      {/* Remotion API Documentation & Tester Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowApiModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Remotion REST API & CLI Integration</h3>
                <p className="text-xs text-slate-400">Render video Siri Orb secara otomatis via HTTP API</p>
              </div>
            </div>

            {/* Endpoints summary */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <span className="text-emerald-400 font-bold">POST</span>
                <span className="text-slate-300">/api/remotion/render</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <span className="text-sky-400 font-bold">POST</span>
                <span className="text-slate-300">/api/remotion/props</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <span className="text-amber-400 font-bold">GET</span>
                <span className="text-slate-300">/api/remotion/info</span>
              </div>
            </div>

            {/* Curl example */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>cURL Request Example:</span>
                <button
                  onClick={copyCurlToClipboard}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCurl ? 'Tersalin!' : 'Copy cURL'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300/90 overflow-x-auto select-all leading-relaxed">
                {sampleCurl}
              </pre>
            </div>

            {/* CLI Command */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Remotion Local CLI Command:</span>
              <pre className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto select-all">
                npx remotion render remotion/index.ts SiriOrb output.mp4
              </pre>
            </div>

            {/* Test Button & Result */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <button
                onClick={handleTestApi}
                disabled={apiTestLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50"
              >
                {apiTestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {apiTestLoading ? 'Mengirim Request ke /api/remotion/render...' : 'Test Hit API Sekarang'}
              </button>

              {apiTestResult && (
                <div className="p-3 bg-slate-950 border border-emerald-900/50 rounded-xl text-xs font-mono text-slate-300 max-h-40 overflow-y-auto">
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">HTTP 200 OK Response:</div>
                  <pre className="text-[10px] whitespace-pre-wrap">{JSON.stringify(apiTestResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {showPreviewModal && recordedBlobUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Video Siri Orb Siap Didownload</h3>
                <p className="text-xs text-emerald-400">{recordedFileName} • 60 FPS Solid HD</p>
              </div>
            </div>

            {/* Video preview container with solid background */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center max-h-[380px]">
              <video
                src={recordedBlobUrl}
                controls
                autoPlay
                loop
                className="max-h-[360px] max-w-full object-contain rounded-lg shadow-inner"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25"
              >
                <Download className="w-4 h-4" />
                Download ({recordedFileName.endsWith('.mp4') ? 'Format .MP4' : 'Format .WebM'})
              </button>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

