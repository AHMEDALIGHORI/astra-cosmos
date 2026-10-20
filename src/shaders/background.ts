import { SIMPLEX, FBM, HASH, OUTPUT } from './noise';
export const backgroundBakeVertex = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
export const backgroundBakeFragment = /* glsl */ `
${SIMPLEX}
${FBM}
${HASH}
varying vec2 vUv;
void main() {
  float lon = (vUv.x - .5) * 6.2831853;
  float lat = (vUv.y - .5) * 3.14159265;
  vec3 dir = vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon));
  float distanceToBand = abs(dot(dir, normalize(vec3(.35, .85, .4))));
  float band = exp(-distanceToBand * distanceToBand * 80.);
  float haze = exp(-distanceToBand * distanceToBand * 14.);
  float cloud = clamp(.5 + fbm(dir * 4. + 17., 5), 0., 1.);
  float dust = smoothstep(.02, .3, fbm(dir * 12. + 31., 4));
  vec3 tint = mix(vec3(.018,.026,.042), vec3(.042,.03,.018), cloud);
  vec3 col = vec3(.0015,.0015,.0021) + tint * (haze * .12 + band * cloud * .45) * (1. - dust * .8);
  vec3 cells = dir * 650.;
  float star = step(.998, hash31(floor(cells))) * (1. - smoothstep(.03, .28, length(fract(cells) - .5)));
  col += vec3(.7,.8,1.) * star;
  gl_FragColor = vec4(col,1.);
}`;
export const skyVertex = `varying vec3 vDirection; void main(){ vDirection=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
export const skyFragment = /* glsl */ `
uniform sampler2D uSky;
uniform float uOpacity;
varying vec3 vDirection;
void main(){
  vec3 d=normalize(vDirection);
  vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5,asin(clamp(d.y,-1.,1.))/3.14159265+.5);
  gl_FragColor=vec4(texture2D(uSky,uv).rgb*uOpacity,1.);
  ${OUTPUT}
}`;
