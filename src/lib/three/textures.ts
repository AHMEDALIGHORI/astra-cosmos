import * as THREE from 'three';
import { mulberry32 } from '@/lib/math';

/** Seamless, deterministic, mipmapped noise for the integrated accretion disk. */
export function createNoiseTexture(size = 256, seed = 7319) {
  const random = mulberry32(seed);
  const data = new Uint8Array(size * size * 4);
  const octaves = [4, 8, 16, 32, 64];
  const lattices = octaves.map((period) => Float32Array.from({ length: period * period }, () => random()));
  const sample = (x: number, y: number, period: number, grid: Float32Array) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (a: number, b: number) => grid[((b + period) % period) * period + ((a + period) % period)];
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(at(ix, iy), at(ix + 1, iy), sx), THREE.MathUtils.lerp(at(ix, iy + 1), at(ix + 1, iy + 1), sx), sy);
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let sum = 0, weight = 0;
    for (let i = 0; i < octaves.length; i++) {
      const a = .5 ** i;
      sum += a * sample(x / size * octaves[i], y / size * octaves[i], octaves[i], lattices[i]);
      weight += a;
    }
    const index = (y * size + x) * 4;
    data[index] = Math.round(sum / weight * 255);
    data[index + 1] = Math.round(sample(x / size * 64, y / size * 64, 64, lattices[4]) * 255);
    data[index + 2] = data[index]; data[index + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
