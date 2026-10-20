import { SIMPLEX, FBM, OUTPUT } from './noise';
export const nebulaVertex = /* glsl */ `
attribute vec3 aCenter, aColor;
attribute float aScale, aAngle, aSeed;
varying vec2 vUv;
varying vec3 vColor;
varying float vSeed, vDepth;
void main() {
  vec4 center = modelViewMatrix * vec4(aCenter, 1.);
  vec2 p = mat2(cos(aAngle), -sin(aAngle), sin(aAngle), cos(aAngle)) * position.xy;
  center.xy += p * aScale;
  gl_Position = projectionMatrix * center;
  vUv = uv;
  vColor = aColor;
  vSeed = aSeed;
  vDepth = -center.z;
}`;
export const nebulaFragment = /* glsl */ `
${SIMPLEX}
${FBM}
uniform float uOpacity, uTime;
varying vec2 vUv;
varying vec3 vColor;
varying float vSeed, vDepth;
void main() {
  vec2 p = (vUv - .5) * 2.;
  float edge = 1. - smoothstep(.25, 1., length(p));
  vec3 q = vec3(p * 2.4, vSeed);
  q += .3 * vec3(snoise(q + 7.), snoise(q + 17.), snoise(q + 29.));
  float gas = clamp(.52 + fbm(q + vec3(0., 0., uTime * .008), 4), 0., 1.);
  float alpha = edge * edge * gas * smoothstep(8., 80., vDepth) * uOpacity;
  #ifdef DUST
  alpha *= .72;
  #else
  alpha *= .22;
  #endif
  if (alpha < .001) discard;
  gl_FragColor = vec4(vColor, alpha);
  ${OUTPUT}
}`;
