import React from 'react';
import { Composition } from 'remotion';
import { SiriOrbComposition } from './SiriOrbComposition';
import { RemotionSiriOrbProps } from './types';
import { DEFAULT_ORB_SETTINGS, ORB_THEMES } from '@/lib/orb-themes';

const defaultProps: RemotionSiriOrbProps = {
  theme: ORB_THEMES[0],
  themeId: 'siri-classic',
  settings: DEFAULT_ORB_SETTINGS,
  fps: 30,
  durationInSeconds: 10,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Universal Dynamic Composition */}
      <Composition<any, RemotionSiriOrbProps>
        id="SiriOrb"
        component={SiriOrbComposition}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={async ({ props }: { props: RemotionSiriOrbProps }) => {
          const fps = props.fps || 30;
          const durationInSeconds = props.durationInSeconds || 10;
          const durationInFrames = Math.round(durationInSeconds * fps);

          let width = 1080;
          let height = 1920;

          const ratio = props.settings?.aspectRatio || '9:16';
          if (ratio === '1:1') {
            width = 1080;
            height = 1080;
          } else if (ratio === '16:9') {
            width = 1920;
            height = 1080;
          }

          return {
            durationInFrames,
            fps,
            width,
            height,
            props,
          };
        }}
      />

      {/* 9:16 TikTok / Reels / Shorts Composition */}
      <Composition<any, RemotionSiriOrbProps>
        id="SiriOrb-9-16"
        component={SiriOrbComposition}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          settings: { ...DEFAULT_ORB_SETTINGS, aspectRatio: '9:16' },
        }}
      />

      {/* 1:1 Square Feed Composition */}
      <Composition<any, RemotionSiriOrbProps>
        id="SiriOrb-1-1"
        component={SiriOrbComposition}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          ...defaultProps,
          settings: { ...DEFAULT_ORB_SETTINGS, aspectRatio: '1:1' },
        }}
      />

      {/* 16:9 Landscape YouTube Composition */}
      <Composition<any, RemotionSiriOrbProps>
        id="SiriOrb-16-9"
        component={SiriOrbComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          ...defaultProps,
          settings: { ...DEFAULT_ORB_SETTINGS, aspectRatio: '16:9' },
        }}
      />
    </>
  );
};
