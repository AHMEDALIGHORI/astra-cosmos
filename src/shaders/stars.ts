import { OUTPUT } from './noise';
export const starVertex = /* glsl */ `
attribute float aSize, aPhase;
attribute vec3 aColor;
uniform float uTime, uPixelRatio, uCollapse, uTwinkle, uIntensity;
uniform vec3 uCollapseDir;
varying float vAlpha, vSpike;
varying vec3 vColor;
void main() {
  float delay = fract(aPhase * 7.31) * .5;
  float c = smoothstep(delay, delay + .5, uCollapse);
  vec3 dir = normalize(mix(normalize(position), uCollapseDir, c * c) + vec3(1e-4));
  vec3 p = dir * length(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
  float twinkle = 1. + uTwinkle * .32 * sin(uTime * (.6 + aPhase * 2.2) + aPhase * 40.);
  gl_PointSize = aSize * uPixelRatio * twinkle * (1. - c * .55);
  vColor = aColor;
  vAlpha = uIntensity * twinkle * (1. - smoothstep(.7, 1., c));
  vSpike = smoothstep(3.4, 5.4, aSize);
}`;
export const starFragment = /* glsl */ `
varying float vAlpha, vSpike;
varying vec3 vColor;
void main() {
  vec2 uv = gl_PointCoord - .5;
  float d = length(uv);
  float core = pow(1. - smoothstep(0., .5, d), 3.);
  float spike = (exp(-abs(uv.x) * 42.) + exp(-abs(uv.y) * 42.)) * (1. - smoothstep(.05, .5, d)) * .45 * vSpike;
  float alpha = (core + spike) * vAlpha;
  if (alpha < .002) discard;
  gl_FragColor = vec4(vColor, alpha);
  ${OUTPUT}
}`;
