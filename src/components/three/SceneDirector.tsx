'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLACK_HOLE, BODIES, SUN } from '@/data/world';
import { journey } from '@/lib/journey';
import { damp, pulse } from '@/lib/math';
import { useCosmic } from '@/lib/store';
import { cosmicEvents } from '@/lib/events';
import { shared } from './shared';

function setOpacity(element: HTMLElement | null, value: number) {
  if (!element) return;
  const next = String(THREE.MathUtils.clamp(value, 0, 1));
  if (element.style.opacity !== next) element.style.opacity = next;
}

export function SceneDirector() {
  const setTask = useCosmic((state) => state.setTask);
  const warmFrames = useRef(0);
  const passed = useRef(new Set<string>());
  const insideHole = useRef(false);
  const projected = useRef(new THREE.Vector3());
  const sunFrame = useRef(0);
  const camera = useRef(new THREE.Vector3());
  const venus = useRef(new THREE.Vector3(...BODIES.venus.position));
  const sun = useRef(new THREE.Vector3(...SUN.position));
  const canvasElement = useRef<HTMLElement | null>(null);
  const venusHazeElement = useRef<HTMLElement | null>(null);
  const sunHazeElement = useRef<HTMLElement | null>(null);
  const emberHazeElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setTask('scene', 1);
    canvasElement.current = document.querySelector<HTMLElement>('.cosmic-canvas');
    venusHazeElement.current = document.querySelector<HTMLElement>('#haze-venus');
    sunHazeElement.current = document.querySelector<HTMLElement>('#haze-sun');
    emberHazeElement.current = document.querySelector<HTMLElement>('#haze-ember');
  }, [setTask]);

  useFrame(({ camera: activeCamera, size }, delta) => {
    const dt = Math.min(delta, .05);

    if (warmFrames.current < 6 && ++warmFrames.current === 6) {
      journey.warm = false;
      setTask('shaders', 1);
      setTask('glyphs', 1);
    }

    const blackIn = THREE.MathUtils.smoothstep(journey.ts, 8.61, 8.685);
    const blackOut = THREE.MathUtils.smoothstep(journey.ts, 8.86, 9.32);
    setOpacity(canvasElement.current, 1 - blackIn * (1 - blackOut));

    camera.current.set(journey.camera.x, journey.camera.y, journey.camera.z);
    const venusDistance = camera.current.distanceTo(venus.current) / BODIES.venus.radius;
    const sunDistance = camera.current.distanceTo(sun.current) / SUN.radius;
    setOpacity(venusHazeElement.current, (1 - THREE.MathUtils.smoothstep(venusDistance, 1.2, 2.4)) * .22);
    sunFrame.current = damp(sunFrame.current, journey.sunScreen.visible ? 1 : 0, 5, dt);
    const sunHaze = (1 - THREE.MathUtils.smoothstep(sunDistance, 2.4, 7)) * .26 * sunFrame.current;
    const sunElement = sunHazeElement.current;
    setOpacity(sunElement, sunHaze);
    sunElement?.style.setProperty('--sx', `${journey.sunScreen.x * 100}%`);
    sunElement?.style.setProperty('--sy', `${journey.sunScreen.y * 100}%`);
    setOpacity(emberHazeElement.current, pulse(journey.ts, 8.34, 8.6, 8.63, 8.69) * .6);
    journey.targets = journey.targets.filter(target => !target.id.startsWith('body:'));
    if (journey.ts < 4.6) {
      for (const body of Object.values(BODIES)) {
        if (journey.ts < body.visible[0] || journey.ts > body.visible[1]) continue;
        projected.current.set(...body.position);
        const distance = activeCamera.position.distanceTo(projected.current);
        const radii = distance / body.radius;
        if (radii < 4.2 && !passed.current.has(body.kind)) {
          passed.current.add(body.kind);
          cosmicEvents.emit('planetPass', { name: body.name });
        } else if (radii > 7) passed.current.delete(body.kind);
        const radius = body.radius * shared.uScale.value / Math.max(1, distance);
        projected.current.project(activeCamera);
        if (radius >= 5 && radius < size.height * .7 && Math.abs(projected.current.z) <= 1) {
          journey.targets.push({ id: `body:${body.kind}`, label: body.name, x: (projected.current.x * .5 + .5) * size.width, y: (.5 - projected.current.y * .5) * size.height, r: Math.max(radius, 22) });
        }
      }
    }
    const holeDepth = activeCamera.position.distanceTo(projected.current.set(...BLACK_HOLE.position)) / BLACK_HOLE.rs;
    const inHole = journey.ts > 8 && journey.ts < 9 && holeDepth < 6;
    if (inHole && !insideHole.current) cosmicEvents.emit('blackHoleEnter', { depth: holeDepth });
    insideHole.current = inHole;
  }, -5);

  return null;
}
