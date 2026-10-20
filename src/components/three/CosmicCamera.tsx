'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN, WORLD_CENTER } from '@/data/world';
import { journey } from '@/lib/journey';
import { cameraDamping, cameraFrame, cameraLookAt, cameraPath, cameraRoll, cameraShake, cameraShakeAmount, cameraZoom } from '@/lib/camera/rig';
import { damp } from '@/lib/math';
import { useCosmic } from '@/lib/store';
import { shared } from './shared';

export function CosmicCamera() {
  const { camera, size, gl } = useThree();
  const perspective = camera as THREE.PerspectiveCamera;
  const reducedMotion = useCosmic((state) => state.reducedMotion);
  const previous = useRef(new THREE.Vector3());
  const path = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const sun = useRef(new THREE.Vector3(...SUN.position));
  const worldCenter = useRef(new THREE.Vector3(...WORLD_CENTER));
  const shake = useRef(new THREE.Vector3());
  const velocityTarget = useRef(new THREE.Vector3());
  const projectedSun = useRef(new THREE.Vector3());
  const frame = useRef({ x: 0, y: 0 });
  const velocity = useRef(new THREE.Vector3());
  const firstFrame = useRef(true);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      journey.pointer.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      journey.pointer.y = 1 - (event.clientY / Math.max(1, window.innerHeight)) * 2;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => window.removeEventListener('pointermove', onPointer);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, .05);
    journey.time += dt;
    journey.ts = firstFrame.current || Math.abs(journey.ts - journey.t) > 3.2
      ? journey.t : cameraDamping(journey.ts, journey.t, reducedMotion ? 14 : 4.6, dt);
    const t = journey.ts;
    const aspect = size.width / size.height;
    cameraPath(t, path.current);
    cameraLookAt(t, look.current);
    cameraFrame(t, aspect, frame.current);
    perspective.fov = cameraZoom(t, aspect);
    perspective.position.copy(path.current);
    perspective.up.set(0, 1, 0);
    perspective.lookAt(look.current);

    const pointerLambda = reducedMotion ? 14 : 2.4;
    journey.pointerSmooth.x = damp(journey.pointerSmooth.x, reducedMotion ? 0 : journey.pointer.x, pointerLambda, dt);
    journey.pointerSmooth.y = damp(journey.pointerSmooth.y, reducedMotion ? 0 : journey.pointer.y, pointerLambda, dt);
    cameraShake(journey.time, reducedMotion ? 0 : cameraShakeAmount(t) * .0035, shake.current);
    const tanV = Math.tan(THREE.MathUtils.degToRad(perspective.fov) / 2);
    const tanH = tanV * aspect;
    perspective.rotateY(Math.atan(frame.current.x * tanH) + shake.current.x - journey.pointerSmooth.x * .016);
    perspective.rotateX(-Math.atan((frame.current.y + journey.finaleLift) * tanV) + shake.current.y + journey.pointerSmooth.y * .011);
    perspective.rotateZ((reducedMotion ? 0 : cameraRoll(t)) + shake.current.z);
    perspective.translateX(-journey.pointerSmooth.x * .55);
    perspective.translateY(journey.pointerSmooth.y * .385);

    const far = perspective.position.distanceTo(worldCenter.current);
    perspective.near = far > 30000 ? far * .0008 : .5;
    perspective.far = Math.max(60000, far * 3);
    perspective.updateProjectionMatrix();

    if (!firstFrame.current) {
      const inverseDelta = 1 / Math.max(dt, .001);
      velocityTarget.current.set(
        (perspective.position.x - previous.current.x) * inverseDelta,
        (perspective.position.y - previous.current.y) * inverseDelta,
        (perspective.position.z - previous.current.z) * inverseDelta,
      );
      velocity.current.lerp(velocityTarget.current, 1 - Math.exp(-10 * dt));
    } else firstFrame.current = false;
    previous.current.copy(perspective.position);
    journey.camera.x = perspective.position.x;
    journey.camera.y = perspective.position.y;
    journey.camera.z = perspective.position.z;
    journey.camera.vx = velocity.current.x;
    journey.camera.vy = velocity.current.y;
    journey.camera.vz = velocity.current.z;
    journey.speed = velocity.current.length();
    journey.viewport.width = size.width;
    journey.viewport.height = size.height;
    journey.viewport.aspect = aspect;
    journey.viewport.portrait = aspect < 1 ? 1 : 0;

    projectedSun.current.copy(sun.current).project(perspective);
    journey.sunScreen.x = projectedSun.current.x * .5 + .5;
    journey.sunScreen.y = .5 - projectedSun.current.y * .5;
    journey.sunScreen.visible = projectedSun.current.z >= -1 && projectedSun.current.z <= 1 && Math.abs(projectedSun.current.x) <= 1 && Math.abs(projectedSun.current.y) <= 1;
    gl.domElement.style.setProperty('--camera-scale', String(size.height / 2 / tanV));
    shared.uTime.value = reducedMotion ? 0 : journey.time;
    shared.uScale.value = size.height / 2 / tanV;
    shared.uPixelRatio.value = gl.getPixelRatio();
  }, -10);
  return null;
}
