import React from 'react';
import { Composition } from 'remotion';
import { PinsNeedlesViral } from './PinsNeedles_VIRAL';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PinsNeedlesViral"
      component={PinsNeedlesViral}
      durationInFrames={2700}
      fps={60}
      width={1080}
      height={1920}
    />
  </>
);
