'use client';
import { useEffect } from 'react';
import { useCosmic } from '@/lib/store';
import { CosmicCamera } from '@/components/three/CosmicCamera';
import { SceneDirector } from '@/components/three/SceneDirector';
import { StarField } from '@/components/three/StarField';
import { DustField } from '@/components/three/DustField';
import { SolarSystem } from '@/components/three/SolarSystem';
import { ConstellationField } from '@/components/three/ConstellationField';
import { NumerologyField } from '@/components/three/NumerologyField';
import { Nebula } from '@/components/three/Nebula';
import { Galaxy } from '@/components/three/Galaxy';
import { BlackHole } from '@/components/three/BlackHole';
import { Observatory } from '@/components/three/Observatory';
import { JourneyTrail } from '@/components/three/JourneyTrail';
import { Effects } from '@/components/three/Effects';
export function CosmicScene() { const quality = useCosmic((s) => s.quality); const setTask = useCosmic((s) => s.setTask); useEffect(() => { setTask('scene', 1); }, [setTask]); return <><CosmicCamera /><SceneDirector /><StarField count={quality.stars} /><DustField count={quality.dust} streakCount={quality.streaks} /><SolarSystem segments={quality.sphereSegments} detail={quality.planetOctaves} /><ConstellationField /><NumerologyField count={quality.glyph} heroCount={quality.heroGlyph} /><Nebula count={quality.nebulaSprites} starCount={quality.nebulaStars} /><Galaxy count={quality.galaxy} /><BlackHole /><Observatory /><JourneyTrail />{quality.postProcessing && <Effects levels={quality.bloomLevels} />}</>; }
