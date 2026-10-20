'use client';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense } from 'react';
import { useCosmic } from '@/lib/store';
import { CosmicScene } from './CosmicScene';
function AdaptiveResolution({ minDpr, maxDpr }: { minDpr: number; maxDpr: number }) {
  const setDpr = useThree((state) => state.setDpr);
  const current = useRef(maxDpr);
  useEffect(() => { current.current = maxDpr; setDpr(maxDpr); }, [maxDpr, setDpr]);
  return <PerformanceMonitor bounds={(refreshRate) => refreshRate > 90 ? [50, 90] : [42, 58]} flipflops={3} onIncline={() => { current.current = Math.min(maxDpr, current.current + .25); setDpr(current.current); }} onDecline={() => { current.current = Math.max(minDpr, current.current - .25); setDpr(current.current); }} />;
}
export function CosmicCanvas() { const quality = useCosmic((s) => s.quality); return <Canvas dpr={[quality.minDpr, quality.maxDpr]} gl={{ antialias: true, alpha: true }} camera={{ fov: 44, near: .1, far: 60000, position: [0, 0, 12] }} onCreated={({ gl }) => { gl.setClearColor('#050507', 1); gl.toneMapping = quality.postProcessing ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping; }}><AdaptiveResolution minDpr={quality.minDpr} maxDpr={quality.maxDpr} /><Suspense fallback={null}><CosmicScene /></Suspense></Canvas>; }
