import path from 'path';
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Remotion's bundler does not read tsconfig.json "paths" automatically,
// so the "@/*" alias used across the remotion/ compositions must be wired
// into the bundler manually. "@/*" maps to "<projectRoot>/*", matching
// the "baseUrl" + "paths" in tsconfig.json.
Config.overrideBundlerConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      alias: {
        ...(currentConfiguration.resolve?.alias ?? {}),
        '@': path.resolve(process.cwd()),
      },
    },
  };
});
