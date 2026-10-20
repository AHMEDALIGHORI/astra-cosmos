import { OUTPUT } from './noise';

export const glyphVertex = /* glsl */ `
attribute vec3 aStart;
attribute vec3 aGlyph;
attribute vec3 aMorph;
attribute vec3 aScatter;
attribute vec3 aOrbit;
attribute vec4 aRandom;
uniform float uForm, uMix, uOrbit, uDissolve, uSize, uPixelRatio;
varying vec4 vRandom;
void main() {
  vec3 glyph = mix(aGlyph, aMorph, uMix);
  vec3 p = mix(aStart, glyph, uForm);
  p = mix(p, aOrbit, uOrbit);
  p = mix(p, aScatter, uDissolve);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
  gl_PointSize = uSize * (.72 + aRandom.x * .56) * uPixelRatio;
  vRandom = aRandom;
}`;

export const glyphFragment = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor, uAccent;
varying vec4 vRandom;
void main() {
  float d = length(gl_PointCoord - .5);
  float alpha = pow(1. - smoothstep(0., .5, d), 2.2) * uOpacity;
  if (alpha < .002) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, step(.92, vRandom.y) * .38), alpha);
  ${OUTPUT}
}`;
