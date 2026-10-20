import { FBM, HASH, OUTPUT, ROTATE, SIMPLEX } from './noise';
const NOISE = `${HASH}\n${SIMPLEX}\n${FBM}\n${ROTATE}`;
export const planetVertex = `varying vec3 vPos; void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const HEADER = `${NOISE}
uniform vec3 uSunDir,uCamPos;
uniform float uTime,uSeed,uLight,uDetail;
varying vec3 vPos;
int lod(int requested){return min(requested,OCTAVES);}
void basis(vec3 n,out vec3 t,out vec3 b){t=normalize(cross(abs(n.y)>.95?vec3(1.,0.,0.):vec3(0.,1.,0.),n));b=cross(n,t);}
`;
const RING_DENSITY = /* glsl */ `
float ringDensity(float x) {
  if(x<0.||x>1.)return 0.;
  #if RING_STYLE == 0
  float edge=smoothstep(0.,.03,x)*(1.-smoothstep(.975,1.,x));
  float cRing=mix(.2,1.,smoothstep(.1,.27,x));
  float cassini=1.-.94*smoothstep(.585,.6,x)*(1.-smoothstep(.655,.67,x));
  float encke=1.-.85*smoothstep(.9,.905,x)*(1.-smoothstep(.915,.92,x));
  float aRing=mix(1.,.7,smoothstep(.66,.7,x));
  float fine=vnoise1(x*46.)*.5+vnoise1(x*150.)*.3+vnoise1(x*430.)*.2;
  return edge*cRing*cassini*encke*aRing*(.5+.5*fine);
  #else
  float d=exp(-pow((x-.08)*60.,2.))*.35+exp(-pow((x-.24)*70.,2.))*.3+exp(-pow((x-.41)*80.,2.))*.3+exp(-pow((x-.58)*60.,2.))*.4+exp(-pow((x-.9)*28.,2.))*.75;
  return d*.55;
  #endif
}`;
export const rockyFragment = /* glsl */ `${HEADER}
uniform vec3 uAlbedoA,uAlbedoB,uAlbedoDark;
uniform float uCrater,uBump,uMaria,uPolar,uRidge;
float craters(vec3 p,float scale,float seed){
  vec3 q=p*scale,id=floor(q),f=fract(q);float h=0.;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){
    vec3 cell=vec3(float(x),float(y),float(z));
    vec3 center=hash33(id+cell+seed)*.8+.1;
    float radius=.1+.24*hash31(id+cell+seed+19.);
    float d=length(cell+center-f)/radius;
    h+=exp(-pow((d-1.)*7.,2.))*.1-(1.-smoothstep(0.,1.,d))*.2;
  }
  return h;
}
float heightAt(vec3 p){
  float h=fbm(p*3.1+uSeed,lod(OCTAVES))*.16;
  h+=abs(snoise(p*7.+uSeed))*uRidge;
  if(uCrater>.02){h+=craters(p,3.5,uSeed)*uCrater*uDetail;
  #if OCTAVES > 4
  h+=craters(p,9.,uSeed+31.)*uCrater*.45*uDetail;
  #endif
  }return h;
}
void main(){
  vec3 n=normalize(vPos),t,b;basis(n,t,b);const float e=.004;
  float h0=heightAt(n),hx=heightAt(normalize(n+t*e)),hy=heightAt(normalize(n+b*e));
  vec3 N=normalize(n-uBump*(.35+.65*uDetail)*((hx-h0)/e*t+(hy-h0)/e*b));
  vec3 L=normalize(uSunDir);
  float geo=smoothstep(-.03,.1,dot(n,L));float diff=max(dot(N,L),0.)*geo;
  float tone=fbm(n*3.1+uSeed*2.,lod(4))*.5+.5;
  vec3 albedo=mix(uAlbedoA,uAlbedoB,tone);
  float maria=smoothstep(.02,.36,fbm(n*1.25+uSeed+5.,4));
  albedo=mix(albedo,uAlbedoDark,maria*uMaria);
  albedo*=.78+.5*smoothstep(-.25,.3,h0);
  float cap=smoothstep(.8,.9,abs(n.y)+.06*fbm(n*6.,3))*uPolar;
  albedo=mix(albedo,vec3(.9,.88,.86),cap);
  gl_FragColor=vec4(albedo*pow(diff,.82)*uLight+albedo*.004,1.);
  ${OUTPUT}
}`;
export const earthFragment = /* glsl */ `${HEADER}
float terrain(vec3 p){vec3 q=p*1.25+vec3(3.1,1.7,5.3)+uSeed;q+=.32*vec3(snoise(q*1.1+11.),snoise(q*1.1+23.),snoise(q*1.1+37.));return fbm(q,lod(OCTAVES));}
float cloudField(vec3 p){vec3 q=rotY(p,uTime*.008);q+=.22*vec3(snoise(q*1.9+4.),snoise(q*1.9+8.),snoise(q*1.9+15.));float c=fbm(q*vec3(2.3,3.4,2.3)+7.,lod(5));float belts=.12*cos(p.y*8.5)-.1*smoothstep(.75,1.,abs(p.y));return smoothstep(.1,.62,c+belts);}
void main(){
  vec3 n=normalize(vPos),L=normalize(uSunDir),V=normalize(uCamPos-vPos);
  float h=terrain(n);const float sea=.06;float land=smoothstep(sea,sea+.035,h),lat=abs(n.y);
  float moist=snoise(n*2.4+40.)*.5+.5;
  float arid=smoothstep(.14,.3,lat)*(1.-smoothstep(.38,.56,lat))*(1.-smoothstep(.3,.62,moist));
  vec3 forest=vec3(.045,.12,.045),grass=vec3(.14,.2,.07),desert=vec3(.5,.4,.25),rock=vec3(.3,.26,.22);
  vec3 landCol=mix(forest,grass,smoothstep(.3,.7,moist+(lat-.3)*.5));
  landCol=mix(landCol,desert,arid);landCol=mix(landCol,rock,smoothstep(sea+.18,sea+.5,h));
  landCol=mix(landCol,vec3(.36,.38,.33),smoothstep(.62,.84,lat)*.55);
  vec3 ocean=mix(vec3(.004,.022,.075),vec3(.012,.11,.19),smoothstep(sea-.32,sea,h));
  float ice=smoothstep(.87,.95,lat+.05*snoise(n*7.));ice=max(ice,land*smoothstep(sea+.5,sea+.7,h));
  vec3 surf=mix(ocean,landCol,land);surf=mix(surf,vec3(.86,.9,.95),ice);
  float clouds=cloudField(n);
  #if OCTAVES > 4
  vec3 towardSun=normalize(L-n*dot(L,n)+vec3(1e-4));float shadow=cloudField(normalize(n+towardSun*.018));
  #else
  float shadow=clouds*.5;
  #endif
  float ndl=dot(n,L),day=smoothstep(-.1,.22,ndl),diff=max(ndl,0.);
  float ndh=max(dot(n,normalize(L+V)),0.);
  float water=(1.-land)*(1.-ice)*(1.-clouds),spec=pow(ndh,260.)*.8+pow(ndh,40.)*.03;
  vec3 lit=surf*diff*(1.-shadow*.45)+vec3(1.,.93,.8)*spec*water*day;
  vec3 cloudCol=vec3(.88,.9,.93)*(.08+.92*diff);lit=mix(lit,cloudCol,clouds*.92);
  float twilight=smoothstep(-.05,.12,ndl)*(1.-smoothstep(.12,.4,ndl));lit*=mix(vec3(1.),vec3(1.25,.78,.55),twilight*.7);
  float night=1.-smoothstep(-.18,.02,ndl);
  float cities=smoothstep(.42,.9,snoise(n*16.+3.)*.55+snoise(n*48.+9.)*.4+snoise(n*110.)*.25);
  cities*=land*(1.-ice)*(1.-arid*.7)*(1.-smoothstep(.3,.78,lat))*uDetail;
  vec3 lights=vec3(1.,.72,.38)*cities*night*(1.-clouds*.8)*1.7;
  vec3 air=vec3(.22,.48,1.)*pow(1.-max(dot(n,V),0.),3.2)*day*.55;
  gl_FragColor=vec4(lit*uLight+lights+air+surf*.003,1.);
  ${OUTPUT}
}`;
export const gasFragment = /* glsl */ `${HEADER}
uniform vec3 uPalette[5],uStormPos,uStormColor;
uniform vec2 uStormSize;
uniform float uBandFreq,uTurbulence,uContrast,uWrap,uStreaks,uStorm,uRingInner,uRingOuter;
#ifdef HAS_RINGS
${RING_DENSITY}
float ringShadow(vec3 p,vec3 L){if(abs(L.y)<.0001)return 1.;float t=-p.y/L.y;if(t<=0.)return 1.;vec3 hit=p+L*t;float r=length(hit.xz);return 1.-ringDensity((r-uRingInner)/(uRingOuter-uRingInner))*.8;}
#endif
void main(){
  vec3 n=normalize(vPos);
  float warp=fbm(n*vec3(2.3,4.,2.3)+vec3(0.,uTime*.015,uSeed),lod(4));
  float bands=n.y*uBandFreq+warp*uTurbulence;
  float tone=clamp(.5+.5*sin(bands*6.2831853),0.,1.);
  float layer=clamp((.5+(tone-.5)*uContrast)*4.,0.,3.999);
  vec3 col=mix(uPalette[int(floor(layer))],uPalette[int(floor(layer))+1],fract(layer));
  col*=.9+.2*fbm(n*vec3(8.,38.,8.)+uSeed,lod(4));
  col+=vec3(.05)*uStreaks*smoothstep(.4,.7,snoise(n*vec3(8.,80.,8.)));
  if(uStorm>.5){
    vec3 c=normalize(uStormPos),east=normalize(cross(vec3(0.,1.,0.),c)),north=cross(c,east);
    vec2 lp=vec2(dot(n,east),dot(n,north))/uStormSize;float e=length(lp),facing=step(0.,dot(n,c));
    float inside=(1.-smoothstep(.7,1.,e))*facing;
    float ang=atan(lp.y,lp.x)+(1.-min(e,1.))*3.2+uTime*.04;
    float swirl=snoise(vec3(cos(ang)*e*3.,sin(ang)*e*3.,e*4.+uSeed))*.5+.5;
    col=mix(col,uStormColor*(.75+.5*swirl),inside);
    float collar=((1.-smoothstep(1.,1.45,e))-(1.-smoothstep(.7,1.,e)))*facing;
    col=mix(col,col*1.18+.03,max(collar,0.)*.5);
  }
  vec3 L=normalize(uSunDir),V=normalize(uCamPos-vPos);
  float day=smoothstep(-uWrap,.5+uWrap*.5,dot(n,L));
  float limb=mix(.5,1.,pow(max(dot(n,V),0.),.45));float shade=day*limb;
  #ifdef HAS_RINGS
  shade*=ringShadow(n,L);
  #endif
  gl_FragColor=vec4(col*shade*uLight,1.);
  ${OUTPUT}
}`;
export const atmosphereVertex = `uniform float uShell;varying vec3 vP;void main(){vP=position*uShell;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const atmosphereFragment = /* glsl */ `
uniform vec3 uSunDir,uCamPos,uColor,uSunsetColor;
uniform float uShell,uDensity,uFalloff,uMie,uLight;
varying vec3 vP;
void main(){
  vec3 ro=uCamPos,rd=normalize(vP-ro),L=normalize(uSunDir);
  float b=dot(ro,rd),c=dot(ro,ro),discShell=b*b-c+uShell*uShell;
  if(discShell<0.)discard;
  float t0=max(0.,-b-sqrt(discShell)),t1=-b+sqrt(discShell);
  float discPlanet=b*b-c+1.;if(discPlanet>0.){float tp=-b-sqrt(discPlanet);if(tp>0.)t1=min(t1,tp);}
  if(t1<=t0)discard;
  vec3 sum=vec3(0.);float stepSize=(t1-t0)/12.;
  for(int i=0;i<12;i++){
    vec3 p=ro+rd*(t0+(float(i)+.5)*stepSize);float r=length(p);vec3 n=p/r;
    float density=exp(-max(0.,r-1.)/(uShell-1.)*uFalloff)*uDensity;
    float day=smoothstep(-.15,.2,dot(n,L));
    float forward=pow(max(dot(rd,L),0.),12.)*uMie;
    float sunset=1.-smoothstep(.05,.4,abs(dot(n,L)));
    sum+=mix(uColor,uSunsetColor,sunset*.7)*density*day*(.3+forward)*stepSize;
  }
  gl_FragColor=vec4(sum*uLight,clamp(length(sum),0.,1.));
  ${OUTPUT}
}`;
export const ringVertex = `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const ringFragment = /* glsl */ `
${HASH}
${RING_DENSITY}
uniform float uInner,uOuter,uLight;
uniform vec3 uTintA,uTintB,uSunDir;
varying vec3 vP;
void main(){
  float r=length(vP.xy),x=(r-uInner)/(uOuter-uInner),density=ringDensity(x);
  if(density<.002)discard;
  vec3 p=vec3(vP.x,0.,-vP.y),L=normalize(uSunDir);
  float b=dot(p,L),disc=b*b-dot(p,p)+1.;float shadow=(b<0.&&disc>0.)?.12:1.;
  vec3 color=mix(uTintA,uTintB,vnoise1(x*30.))*(.35+.65*abs(L.y))*uLight*shadow;
  gl_FragColor=vec4(color,density);
  ${OUTPUT}
}`;
export const sunFragment = /* glsl */ `${NOISE}
uniform float uTime,uIntensity;
varying vec3 vPos;
void main(){vec3 p=normalize(vPos);float boil=fbm(p*8.+vec3(uTime*.12,-uTime*.07,0.),6);float granulation=fbm(p*25.+vec3(0.,uTime*.08,-uTime*.04),4);float heat=clamp(.55+boil*.5+granulation*.16,0.,1.);vec3 color=mix(vec3(.78,.08,.015),vec3(1.,.83,.38),smoothstep(.1,.8,heat));color+=vec3(1.,.27,.035)*smoothstep(.45,.8,boil)*.36;gl_FragColor=vec4(color*uIntensity,1.);
${OUTPUT}
}`;
export const coronaVertex = `varying vec2 vUv;uniform float uSize;void main(){vUv=uv*2.-1.;vec4 center=modelViewMatrix*vec4(0.,0.,0.,1.);center.xy+=position.xy*uSize;gl_Position=projectionMatrix*center;}`;
export const coronaFragment = /* glsl */ `${SIMPLEX}
uniform float uTime,uExtent,uIntensity;
varying vec2 vUv;
void main(){float r=length(vUv),rr=r*uExtent;if(r>1.||rr<1.)discard;float ang=atan(vUv.y,vUv.x);float streamers=snoise(vec3(cos(ang)*2.2,sin(ang)*2.2,uTime*.03+rr*.18))*.5+.5;float fineRays=snoise(vec3(cos(ang)*9.,sin(ang)*9.,uTime*.05-rr*.3))*.5+.5;float falloff=pow(1./max(rr,1.),3.3),inner=pow(1./max(rr,1.),8.);float glow=falloff*(.45+.75*streamers+.25*fineRays)+inner*.7;glow*=1.-smoothstep(.55,1.,r);vec3 col=mix(vec3(1.,.45,.14),vec3(1.,.88,.7),clamp(inner*1.5+falloff,0.,1.));float a=glow*uIntensity;if(a<.001)discard;gl_FragColor=vec4(col,a);
${OUTPUT}
}`;
