import { NextRequest, NextResponse } from 'next/server';
import { ORB_THEMES, DEFAULT_ORB_SETTINGS, OrbSettings, OrbTheme } from '@/lib/orb-themes';
import { RemotionSiriOrbProps } from '@/remotion/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const themeId = body.themeId || 'siri-classic';
    const matchedTheme = ORB_THEMES.find((t) => t.id === themeId) || ORB_THEMES[0];
    const customTheme: OrbTheme = body.theme || matchedTheme;

    const partialSettings: Partial<OrbSettings> = body.settings || {};
    const aspectRatio = body.aspectRatio || partialSettings.aspectRatio || '9:16';
    const fps = Number(body.fps) || 30;
    const durationInSeconds = Number(body.durationInSeconds) || 10;
    const durationInFrames = Math.round(durationInSeconds * fps);
    const audioUrl = body.audioUrl || undefined;

    let width = 1080;
    let height = 1920;
    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    }

    const resolvedSettings: OrbSettings = {
      ...DEFAULT_ORB_SETTINGS,
      ...partialSettings,
      aspectRatio,
    };

    const remotionProps: RemotionSiriOrbProps = {
      theme: customTheme,
      themeId: customTheme.id,
      settings: resolvedSettings,
      audioUrl,
      fps,
      durationInSeconds,
    };

    return NextResponse.json({
      success: true,
      compositionId: `SiriOrb`,
      dimensions: { width, height, aspectRatio },
      timeline: {
        fps,
        durationInSeconds,
        durationInFrames,
      },
      props: remotionProps,
      cliCommand: `npx remotion render remotion/index.ts SiriOrb output.mp4 --props='${JSON.stringify(
        remotionProps
      )}'`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate Remotion props',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request with themeId, audioUrl, settings, fps, durationInSeconds, or aspectRatio.',
  });
}
