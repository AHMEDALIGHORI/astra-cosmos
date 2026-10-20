'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { mulberry32, pulse } from '@/lib/math';
import { journey } from '@/lib/journey';
import { WORLD_CENTER } from '@/data/world';
import { useCosmic } from '@/lib/store';
import { shared } from '@/lib/three/shared';
import { backgroundBakeFragment, backgroundBakeVertex, skyFragment, skyVertex } from '@/shaders/background';
import { starFragment, starVertex } from '@/shaders/stars';

const TINTS = [
  [new THREE.Color(.62, .74, 1), .16],
  [new THREE.Color(.84, .9, 1), .26],
  [new THREE.Color(1, 1, 1), .24],
  [new THREE.Color(1, .94, .82), .18],
  [new THREE.Color(1, .82, .62), .11],
  [new THREE.Color(1, .64, .46), .05],
] as const;

function pickTint(value: number) {
  let remaining = value;
  for (const [color, weight] of TINTS) {
    remaining -= weight;
    if (remaining <= 0) return color;
  }
  return TINTS[TINTS.length - 1][0];
}

export function StarField({ count = 5000 }: { count?: number }) {
  const ref = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const quality = useCosmic((state) => state.quality);
  const reducedMotion = useCosmic((state) => state.reducedMotion);
  const center = useMemo(() => new THREE.Vector3(...WORLD_CENTER), []);
  const geometry = useMemo(() => {
    const random = mulberry32(1987);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phase = new Float32Array(count);
    const brightness = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const normal = new THREE.Vector3(.35, .85, .4).normalize();
    for (let i = 0; i < count; i += 1) {
      const radius = 900;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const point = new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
      if (random() < .44) point.addScaledVector(normal, -point.dot(normal) * (.72 + random() * .24));
      point.normalize().multiplyScalar(radius);
      positions.set([point.x, point.y, point.z], i * 3);
      const r = random();
      const magnitude = r ** 7;
      sizes[i] = .9 + .8 * r + magnitude * 5.4;
      brightness[i] = .32 + .7 * r + 1.7 * magnitude;
      phase[i] = random() * Math.PI * 2;
      const tint = pickTint(random());
      colors.set([tint.r * brightness[i], tint.g * brightness[i], tint.b * brightness[i]], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: shared.uTime, uPixelRatio: shared.uPixelRatio, uCollapseDir: { value: new THREE.Vector3() }, uCollapse: { value: 0 }, uTwinkle: { value: 1 }, uIntensity: { value: 1 } },
  }), []);
  const skyGeometry = useMemo(() => new THREE.SphereGeometry(945, 48, 32), []);
  const skyMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    uniforms: { uSky: shared.uSky, uOpacity: { value: 1 } },
    side: THREE.BackSide,
    depthTest: false,
    depthWrite: false,
  }), []);
  useEffect(() => () => { geometry.dispose(); }, [geometry]);
  useEffect(() => () => { material.dispose(); skyGeometry.dispose(); skyMaterial.dispose(); }, [material, skyGeometry, skyMaterial]);

  useEffect(() => {
    const width = quality.tier === 'high' ? 2048 : 1024;
    const height = quality.tier === 'high' ? 1024 : 512;
    const target = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
    target.texture.generateMipmaps = false;
    const bakeScene = new THREE.Scene();
    const bakeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bakeMaterial = new THREE.ShaderMaterial({ vertexShader: backgroundBakeVertex, fragmentShader: backgroundBakeFragment, depthTest: false, depthWrite: false, toneMapped: false });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bakeMaterial);
    bakeScene.add(quad);
    const previousTarget = gl.getRenderTarget();
    const previousAutoClear = gl.autoClear;
    try {
      gl.autoClear = true;
      gl.setRenderTarget(target);
      gl.render(bakeScene, bakeCamera);
      gl.setRenderTarget(previousTarget);
      shared.uSky.value = target.texture;
      shared.uHasSky.value = 1;
      skyMaterial.uniforms.uOpacity.value = 1;
    } catch (error) {
      console.error('Could not bake the procedural sky.', error);
      target.dispose();
    } finally {
      gl.autoClear = previousAutoClear;
      gl.setRenderTarget(previousTarget);
      bakeMaterial.dispose();
      quad.geometry.dispose();
    }
    return () => {
      if (shared.uSky.value === target.texture) { shared.uSky.value = null; shared.uHasSky.value = 0; }
      target.dispose();
    };
  }, [gl, quality.tier, skyGeometry, skyMaterial]);

  useFrame(({ gl }, delta) => {
    const collapse = THREE.MathUtils.smoothstep(journey.ts, 11.42, 11.63);
    if (ref.current) ref.current.position.copy(camera.position);
    material.uniforms.uCollapseDir.value.copy(center).sub(camera.position).normalize();
    material.uniforms.uCollapse.value = collapse;
    material.uniforms.uTwinkle.value = reducedMotion ? 0 : 1;
    const solarGlare = pulse(journey.ts, 1.12, 1.24, 1.52, 1.62);
    const nebulaDim = pulse(journey.ts, 6.8, 7.1, 7.82, 8.05);
    const consultationDim = pulse(journey.ts, 9.75, 10.05, 11.05, 11.14);
    material.uniforms.uIntensity.value = (1 - .5 * solarGlare) * (1 - .3 * nebulaDim) * (1 - .55 * consultationDim);
    skyMaterial.uniforms.uOpacity.value = 1 - THREE.MathUtils.smoothstep(collapse, 0, .5);
  });

  return <group ref={ref}>
    <mesh geometry={skyGeometry} material={skyMaterial} renderOrder={-100} />
    <points geometry={geometry} material={material} renderOrder={-90} />
  </group>;
}
