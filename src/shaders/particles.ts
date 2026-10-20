import { OUTPUT } from './noise';

export const particleVertex = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
attribute vec4 aRand;
uniform float uTime, uScale, uPixelRatio, uOpacity, uMinSize, uMaxSize;
uniform float uTwinkle, uNearFade, uKeepSmall, uSpin, uOrbitPower;
uniform float uReveal, uDissolve, uSpread, uOcclude;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec3 p = position;
  #ifdef ORBIT
  float r = max(length(p.xz), 1.);
  float angle = uTime * uSpin * pow(r, uOrbitPower);
  p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
  #endif
  #ifdef DISSOLVE
  p += (aRand.xyz - .5) * uSpread * uDissolve;
  #endif
  float alpha = uOpacity * uReveal * (1. - uDissolve);
  #ifdef OCCLUDE
  vec3 center = (modelMatrix * vec4(0., 0., 0., 1.)).xyz;
  vec3 world = (modelMatrix * vec4(p, 1.)).xyz;
  vec3 ray = normalize(world - cameraPosition);
  float nearest = dot(center - cameraPosition, ray);
  float impact = length(cameraPosition + ray * nearest - center);
  if (nearest > 0. && length(world - cameraPosition) > nearest)
    alpha *= smoothstep(uOcclude * .8, uOcclude * 1.3, impact);
  #endif
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float dist = max(-mv.z, .001);
  float twinkle = 1. + uTwinkle * .3 * sin(uTime * (.8 + aRand.x * 2.) + aRand.y * 50.);
  float size = aSize * uScale / dist;
  alpha *= mix(clamp(size / uMinSize, 0., 1.), 1., uKeepSmall);
  alpha *= smoothstep(0., max(uNearFade, .0001), dist);
  gl_PointSize = clamp(size, uMinSize, uMaxSize) * uPixelRatio * twinkle;
  vColor = aColor;
  vAlpha = alpha * twinkle;
}`;
export const particleFragment = /* glsl */ `
uniform float uSoftness;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - .5;
  float d = length(uv);
  float falloff = 1. - smoothstep(0., .5, d);
  #ifdef FLARE
  float core = pow(falloff, 6.) * 1.6;
  float halo = pow(falloff, 2.2) * .22;
  float crossLight = (exp(-abs(uv.x) * 64.) + exp(-abs(uv.y) * 64.)) * pow(falloff, 1.4) * .55;
  float a = (core + halo + crossLight) * vAlpha;
  #else
  float a = pow(falloff, uSoftness) * vAlpha;
  #endif
  if (a < .002) discard;
  gl_FragColor = vec4(vColor, a);
  ${OUTPUT}
}`;
export const lineVertex = /* glsl */ `
attribute float aT;
uniform float uNearFade;
varying float vT, vFade;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vT = aT;
  vFade = smoothstep(0., max(.0001, uNearFade), -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
export const lineFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uDraw, uOpacity;
varying float vT, vFade;
void main() {
  if (vT > uDraw) discard;
  float head = smoothstep(uDraw - .06, uDraw, vT) * step(uDraw, .999);
  float a = uOpacity * vFade * (1. + head * 1.6);
  if (a < .002) discard;
  gl_FragColor = vec4(uColor, a);
  ${OUTPUT}
}`;
