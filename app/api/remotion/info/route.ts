import { NextResponse } from 'next/server';
import { ORB_THEMES, DEFAULT_ORB_SETTINGS, PRESET_POSTER_BGS } from '@/lib/orb-themes';

export async function GET() {
  const hostUrl = process.env.APP_URL || 'https://ais-dev-wz7grmbipgy23nbfo4z2qo-385942632117.asia-southeast1.run.app';

  return NextResponse.json({
    status: 'online',
    service: 'Remotion Siri Orb Video Rendering API',
    description: 'API endpoint to render dynamic Siri Orb audio-visualizer videos using Remotion',
    compositions: [
      { id: 'SiriOrb', defaultWidth: 1080, defaultHeight: 1920, description: 'Universal dynamic resolution & duration composition' },
      { id: 'SiriOrb-9-16', width: 1080, height: 1920, description: 'TikTok / Instagram Reels / YouTube Shorts (9:16)' },
      { id: 'SiriOrb-1-1', width: 1080, height: 1080, description: 'Instagram Square Feed (1:1)' },
      { id: 'SiriOrb-16-9', width: 1920, height: 1080, description: 'YouTube Landscape Video (16:9)' }
    ],
    themes: ORB_THEMES.map((t) => ({
      id: t.id,
      name: t.name,
      colors: t.colors,
      description: t.description
    })),
    presetBackdrops: PRESET_POSTER_BGS,
    defaultSettings: DEFAULT_ORB_SETTINGS,
    endpoints: {
      info: {
        method: 'GET',
        path: '/api/remotion/info',
        description: 'Get API documentation and schema'
      },
      props: {
        method: 'POST',
        path: '/api/remotion/props',
        description: 'Generate serialized Remotion props for composition rendering'
      },
      render: {
        method: 'POST',
        path: '/api/remotion/render',
        description: 'Render or get video rendering payload / CLI command'
      }
    },
    sampleRequests: {
      curlRenderSpec: `curl -X POST "${hostUrl}/api/remotion/render" \\
  -H "Content-Type: application/json" \\
  -d '{
    "themeId": "siri-classic",
    "audioUrl": "https://example.com/sample.mp3",
    "aspectRatio": "9:16",
    "fps": 30,
    "durationInSeconds": 10,
    "settings": {
      "size": 220,
      "sensitivity": 1.4,
      "rotationSpeed": 1.2,
      "glowIntensity": 0.85
    }
  }'`,
      cliCommand: `npx remotion render remotion/index.ts SiriOrb out.mp4 --props='{"themeId":"siri-classic","durationInSeconds":10}'`
    }
  });
}
