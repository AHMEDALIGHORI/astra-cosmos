import { OUTPUT } from './noise';
export const blackHoleVertex = `varying vec3 vWorld; void main(){vec4 world=modelMatrix*vec4(position,1.); vWorld=world.xyz; gl_Position=projectionMatrix*viewMatrix*world;}`;
export const blackHoleFragment = /* glsl */ `
uniform float uTime, uOpacity, uSpin, uIntensity, uStarGain, uRs, uInner, uOuter, uInfluence, uSkyGain, uHasSky;
uniform vec3 uCentre;
uniform sampler2D uSky, uNoise;
varying vec3 vWorld;
vec3 sky(vec3 direction) {
  vec3 d = normalize(direction);
  vec2 uv = vec2(atan(d.z,d.x)/6.2831853+.5,asin(clamp(d.y,-1.,1.))/3.14159265+.5);
  return texture2D(uSky,uv).rgb * uSkyGain * uStarGain * uHasSky;
}
vec4 disk(vec3 hit, vec3 vel, float lod) {
  float r = length(hit.xz);
  float x = (r-uInner)/(uOuter-uInner);
  if(x < 0. || x > 1.) return vec4(0.);
  float ang = atan(hit.z,hit.x);
  float omega = pow(r,-1.5)*14.;
  float clock = uTime*.05*uSpin;
  float pa=fract(clock), pb=fract(clock+.5);
  float wa=1.-abs(pa*2.-1.), wb=1.-wa;
  float aa=ang+omega*(pa-.5)*22., ab=ang+omega*(pb-.5)*22.;
  float nA=textureLod(uNoise,vec2(aa*.4775,r*.09+.13),lod).r;
  float nB=textureLod(uNoise,vec2(ab*.4775+.37,r*.09+.61),lod).r;
  float fA=textureLod(uNoise,vec2(aa*.9549,r*.42),lod).g;
  float fB=textureLod(uNoise,vec2(ab*.9549+.5,r*.42+.3),lod).g;
  float n=nA*wa+nB*wb, fine=fA*wa+fB*wb;
  float density=smoothstep(0.,.05,x)*(1.-smoothstep(.5,1.,x));
  density *= (.3+.95*n*(.5+.8*fine))*(.72+.28*sin(r*5.3+n*4.));
  float temp=pow(1.-x,2.2);
  vec3 col=mix(vec3(.62,.1,.03),vec3(1.,.52,.16),smoothstep(0.,.45,temp));
  col=mix(col,vec3(1.,.9,.74),smoothstep(.5,1.,temp));
  float emit=.26+.95*temp+1.9*temp*temp;
  vec3 orbitDir=normalize(vec3(-hit.z,0.,hit.x));
  float beta=clamp(.62/sqrt(r),0.,.7);
  float doppler=clamp(1./(1.-beta*dot(orbitDir,-normalize(vel))),.35,2.6);
  emit*=doppler*doppler*doppler*.6;
  col=mix(col,col*vec3(.8,.95,1.25),clamp((doppler-1.)*.5,0.,.5));
  col=mix(col,col*vec3(1.15,.8,.6),clamp((1.-doppler)*.8,0.,.6));
  float alpha=clamp(density*1.25,0.,1.)*mix(.12,1.,smoothstep(0.,.3,temp));
  return vec4(col*emit,alpha);
}
void main() {
  vec3 ro=(cameraPosition-uCentre)/uRs;
  vec3 rd=normalize(vWorld-cameraPosition);
  float along=-dot(ro,rd);
  float impact=along>0.?length(ro+rd*along):length(ro);
  float fade=1.-smoothstep(uInfluence*.6,uInfluence*.98,impact);
  if(fade < .001) discard;
  float limit=uInfluence;
  float c=dot(ro,ro)-limit*limit;
  vec3 p=ro;
  if(c>0.) {
    float b=dot(ro,rd), disc=b*b-c;
    if(disc < 0.) discard;
    float entry=-b-sqrt(disc);
    if(entry < 0.) discard;
    p+=rd*entry;
  }
  vec3 v=rd;
  vec3 angular=cross(p,v);
  float h2=dot(angular,angular);
  vec4 acc=vec4(0.);
  bool captured=false;
  float lod=clamp(log2(max(length(ro)*.025,1.)),0.,5.);
  for(int i=0;i<STEPS;i++) {
    float r2=dot(p,p);
    if(r2<1.) { captured=true; break; }
    if(r2>limit*limit && dot(p,v)>0.) break;
    float r=sqrt(r2);
    float dt=clamp(r*STEP_SCALE,.03,1.7);
    v+=-1.5*h2*p/(r2*r2*r)*dt;
    vec3 np=p+v*dt;
    if(p.y*np.y<=0. && abs(np.y-p.y)>.00001) {
      vec3 hit=mix(p,np,clamp(-p.y/(np.y-p.y),0.,1.));
      vec4 sampleDisk=disk(hit,v,lod);
      acc.rgb+=(1.-acc.a)*sampleDisk.rgb*sampleDisk.a;
      acc.a+=(1.-acc.a)*sampleDisk.a;
      if(acc.a>.985) break;
    }
    p=np;
  }
  vec3 col=acc.rgb*uIntensity;
  if(!captured) col+=(1.-acc.a)*sky(v);
  gl_FragColor=vec4(col,fade*uOpacity);
  ${OUTPUT}
}`;
