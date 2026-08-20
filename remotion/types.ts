import { OrbTheme, OrbSettings } from '@/lib/orb-themes';

export interface AudioFrameSample {
  frame: number;
  time: number;
  bass: number;
  mid: number;
  treble: number;
  volume: number;
  beat?: boolean;
}

export interface RemotionSiriOrbProps {
  theme?: OrbTheme;
  themeId?: string;
  settings?: Partial<OrbSettings>;
  audioUrl?: string;
  audioSamples?: AudioFrameSample[];
  fps?: number;
  durationInSeconds?: number;
  customTitle?: string;
  [key: string]: unknown;
}
