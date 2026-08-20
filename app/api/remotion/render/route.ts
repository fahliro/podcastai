import { NextRequest, NextResponse } from 'next/server';
import { ORB_THEMES, DEFAULT_ORB_SETTINGS, OrbSettings, OrbTheme } from '@/lib/orb-themes';
import { RemotionSiriOrbProps, AudioFrameSample } from '@/remotion/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const themeId = body.themeId || 'siri-classic';
    const matchedTheme = ORB_THEMES.find((t) => t.id === themeId) || ORB_THEMES[0];
    const theme: OrbTheme = body.theme || matchedTheme;

    const partialSettings: Partial<OrbSettings> = body.settings || {};
    const aspectRatio = body.aspectRatio || partialSettings.aspectRatio || '9:16';
    const fps = Math.min(60, Math.max(15, Number(body.fps) || 30));
    const durationInSeconds = Math.min(300, Math.max(1, Number(body.durationInSeconds) || 10));
    const durationInFrames = Math.round(durationInSeconds * fps);
    const audioUrl = body.audioUrl || undefined;

    let width = 1080;
    let height = 1920;
    let compositionId = 'SiriOrb-9-16';

    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
      compositionId = 'SiriOrb-1-1';
    } else if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
      compositionId = 'SiriOrb-16-9';
    }

    const resolvedSettings: OrbSettings = {
      ...DEFAULT_ORB_SETTINGS,
      ...partialSettings,
      aspectRatio,
    };

    // Pre-calculate audio simulation sample timeline
    const audioSamples: AudioFrameSample[] = [];
    const sensitivity = resolvedSettings.sensitivity || 1.2;

    for (let f = 0; f < durationInFrames; f++) {
      const t = f / fps;
      const bass = Math.min(1.0, (0.3 + 0.35 * Math.sin(t * 5.2) + 0.2 * Math.cos(t * 10.4)) * sensitivity);
      const mid = Math.min(1.0, (0.25 + 0.3 * Math.sin(t * 8.1 + 1.2)) * sensitivity);
      const treble = Math.min(1.0, (0.2 + 0.25 * Math.cos(t * 14.3 + 0.5)) * sensitivity);
      const volume = (bass * 0.5 + mid * 0.3 + treble * 0.2);
      const beat = bass > 0.65;

      audioSamples.push({
        frame: f,
        time: t,
        bass: Math.max(0, Math.round(bass * 1000) / 1000),
        mid: Math.max(0, Math.round(mid * 1000) / 1000),
        treble: Math.max(0, Math.round(treble * 1000) / 1000),
        volume: Math.max(0, Math.round(volume * 1000) / 1000),
        beat,
      });
    }

    const remotionProps: RemotionSiriOrbProps = {
      theme,
      themeId: theme.id,
      settings: resolvedSettings,
      audioUrl,
      audioSamples,
      fps,
      durationInSeconds,
    };

    const renderId = `remotion-orb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      jobId: renderId,
      status: 'ready',
      composition: {
        id: compositionId,
        universalId: 'SiriOrb',
        width,
        height,
        fps,
        durationInSeconds,
        durationInFrames,
      },
      props: remotionProps,
      remotion: {
        entryPoint: 'remotion/index.ts',
        compositionName: 'SiriOrb',
        cliCommand: `npx remotion render remotion/index.ts ${compositionId} ${renderId}.mp4 --props='${JSON.stringify(
          remotionProps
        )}'`,
      },
      meta: {
        themeName: theme.name,
        aspectRatio,
        background: resolvedSettings.bgStyle,
        totalFrames: durationInFrames,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal error processing Remotion render request',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Support GET request query params for quick testing via browser or webhook
  const { searchParams } = new URL(req.url);
  const themeId = searchParams.get('theme') || 'siri-classic';
  const durationInSeconds = Number(searchParams.get('duration')) || 10;
  const aspectRatio = (searchParams.get('aspect') as OrbSettings['aspectRatio']) || '9:16';
  const fps = Number(searchParams.get('fps')) || 30;

  const matchedTheme = ORB_THEMES.find((t) => t.id === themeId) || ORB_THEMES[0];

  return NextResponse.json({
    status: 'online',
    endpoint: '/api/remotion/render',
    method: 'POST',
    description: 'Send JSON payload to this endpoint to initiate Remotion rendering or get props spec.',
    sampleQueryReceived: {
      theme: matchedTheme.name,
      durationInSeconds,
      aspectRatio,
      fps,
    },
  });
}
