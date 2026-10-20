import { at } from '@/lib/journey';
import { clamp, lerp, smoothstep } from '@/lib/math';
import { sortedKeys, type CameraKey, keyTime } from './keyframes';

export { cameraOrbit } from './keyframes';

export interface Vec3Like { x: number; y: number; z: number; }
type Track = { values: Float64Array; tangents: Float64Array; width: number };

const keys = sortedKeys;
const times = Float64Array.from(keys, keyTime);
const count = keys.length;
const positions = new Float64Array(count * 3);
const targets = new Float64Array(count * 3);
const positionsTangent = new Float64Array(count * 3);
const targetsTangent = new Float64Array(count * 3);
const fovs = new Float64Array(count);
const rolls = new Float64Array(count);
const shakes = new Float64Array(count);
const frames = new Float64Array(count * 2);
const framesPortrait = new Float64Array(count * 2);
const holds: boolean[] = [];

let fov = 44;
let roll = 0;
let shake = 0;
let frame: [number, number] = [0, 0];
let frameM: [number, number] = [0, 0];
keys.forEach((key, index) => {
  positions.set(key.pos, index * 3);
  targets.set(key.look, index * 3);
  fov = key.fov ?? fov;
  roll = key.roll ?? roll;
  shake = key.shake ?? shake;
  frame = key.frame ?? frame;
  frameM = key.frameM ?? frameM;
  fovs[index] = fov;
  rolls[index] = roll;
  shakes[index] = shake;
  frames.set(frame, index * 2);
  framesPortrait.set(frameM, index * 2);
  holds.push(Boolean(key.hold));
});

function buildTangents(values: Float64Array, tangents: Float64Array, width: number) {
  for (let axis = 0; axis < width; axis += 1) {
    const slopes = new Float64Array(count - 1);
    for (let i = 0; i < count - 1; i += 1) {
      const h = times[i + 1] - times[i];
      slopes[i] = h > 0 ? (values[(i + 1) * width + axis] - values[i * width + axis]) / h : 0;
    }
    for (let i = 0; i < count; i += 1) {
      let tangent = 0;
      if (i === 0) tangent = slopes[0];
      else if (i === count - 1) tangent = slopes[count - 2];
      else {
        const incoming = slopes[i - 1];
        const outgoing = slopes[i];
        if (incoming * outgoing > 0 && !holds[i]) {
          const hIn = times[i] - times[i - 1];
          const hOut = times[i + 1] - times[i];
          tangent = (incoming * hOut + outgoing * hIn) / (hIn + hOut);
          const limit = 2.4 * Math.min(Math.abs(incoming), Math.abs(outgoing));
          tangent = Math.sign(tangent) * Math.min(Math.abs(tangent), limit);
        }
      }
      tangents[i * width + axis] = holds[i] ? 0 : tangent;
    }
  }
}

buildTangents(positions, positionsTangent, 3);
buildTangents(targets, targetsTangent, 3);
const tracks: Record<string, Track> = {
  fov: { values: fovs, tangents: new Float64Array(count), width: 1 },
  roll: { values: rolls, tangents: new Float64Array(count), width: 1 },
  shake: { values: shakes, tangents: new Float64Array(count), width: 1 },
  frame: { values: frames, tangents: new Float64Array(count * 2), width: 2 },
  frameM: { values: framesPortrait, tangents: new Float64Array(count * 2), width: 2 },
};
for (const track of Object.values(tracks)) buildTangents(track.values, track.tangents, track.width);

function findSegment(t: number) {
  if (t <= times[0]) return 0;
  if (t >= times[count - 1]) return count - 2;
  let low = 0;
  let high = count - 1;
  while (low < high - 1) {
    const mid = (low + high) >>> 1;
    if (times[mid] <= t) low = mid;
    else high = mid;
  }
  return low;
}

function hermite(track: Track, t: number, out: number[]) {
  const i = findSegment(t);
  const h = times[i + 1] - times[i];
  const u = clamp((t - times[i]) / h);
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  for (let axis = 0; axis < track.width; axis += 1) {
    const a = i * track.width + axis;
    const b = (i + 1) * track.width + axis;
    out[axis] = h00 * track.values[a] + h10 * h * track.tangents[a] + h01 * track.values[b] + h11 * h * track.tangents[b];
  }
  return out;
}

export function cameraPath<T extends Vec3Like = Vec3Like>(t: number, out = { x: 0, y: 0, z: 0 } as T): T {
  const values = hermite({ values: positions, tangents: positionsTangent, width: 3 }, t, [0, 0, 0]);
  out.x = values[0]; out.y = values[1]; out.z = values[2];
  return out;
}

export function cameraLookAt<T extends Vec3Like = Vec3Like>(t: number, out = { x: 0, y: 0, z: 0 } as T): T {
  const values = hermite({ values: targets, tangents: targetsTangent, width: 3 }, t, [0, 0, 0]);
  out.x = values[0]; out.y = values[1]; out.z = values[2];
  return out;
}

function scalar(track: Track, t: number, axis = 0) {
  const result = hermite(track, t, [0, 0]);
  return result[axis];
}

export function cameraZoom(t: number, aspect: number) {
  const base = scalar(tracks.fov, t);
  const widen = Math.pow(clamp(1 / aspect, 1, 2.3), .72);
  const halfAngle = Math.atan(Math.tan(base * Math.PI / 360) * widen);
  return halfAngle * 360 / Math.PI;
}

export const portraitness = (aspect: number) => smoothstep(1.15, .8, aspect);

export function cameraFrame(t: number, aspect: number, out: { x: number; y: number }) {
  const portrait = portraitness(aspect);
  out.x = lerp(scalar(tracks.frame, t, 0), scalar(tracks.frameM, t, 0), portrait);
  out.y = lerp(scalar(tracks.frame, t, 1), scalar(tracks.frameM, t, 1), portrait);
  return out;
}

export const cameraRoll = (t: number) => scalar(tracks.roll, t);
export const cameraShakeAmount = (t: number) => scalar(tracks.shake, t);
export function cameraDamping(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function cameraShake(time: number, intensity: number, out: Vec3Like) {
  const a = time * 1.7;
  const b = time * 2.9;
  const c = time * 6.3;
  out.x = (Math.sin(a) * .6 + Math.sin(b + 1.3) * .3 + Math.sin(c + .7) * .1) * intensity;
  out.y = (Math.cos(a * .9 + 2.1) * .6 + Math.sin(b * 1.1 + 4.2) * .3 + Math.cos(c * .8) * .1) * intensity;
  out.z = Math.sin(a * .7 + .4) * .35 * intensity;
  return out;
}

export const cameraKeyTime = (key: CameraKey) => at(key.at[0], key.at[1]);
