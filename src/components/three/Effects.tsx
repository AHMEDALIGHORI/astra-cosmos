'use client';

import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export function Effects({ levels }: { levels: number }) {
  return <EffectComposer multisampling={0}>
    <Bloom intensity={0.9} luminanceThreshold={0.92} luminanceSmoothing={0.22} mipmapBlur levels={levels} radius={0.76} />
    <Noise premultiply opacity={0.16} />
    <Vignette eskil={false} offset={0.26} darkness={0.66} />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>;
}
