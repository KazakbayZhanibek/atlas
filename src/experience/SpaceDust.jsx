import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BackSide, DataTexture, RGBAFormat, LinearFilter, RepeatWrapping } from 'three';

export default function SpaceDust({ sequence, reduced }) {
  const dust=useRef(), haze=useRef();
  const compact=useThree(s=>s.size.width<768);
  const hazeNoise=useMemo(()=>{
    const width=256,height=128,bytes=new Uint8Array(width*height*4);
    const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
    const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return (hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx)*(1-fy)+(hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx)*fy;};
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const u=x/width*6,v=y/height*4;const n=noise(u,v)*.6+noise(u*2,v*2)*.27+noise(u*4,v*4)*.13;const i=(y*width+x)*4;bytes[i]=bytes[i+1]=bytes[i+2]=Math.round(n*255);bytes[i+3]=255;}
    const texture=new DataTexture(bytes,width,height,RGBAFormat);texture.magFilter=texture.minFilter=LinearFilter;texture.wrapS=texture.wrapT=RepeatWrapping;texture.needsUpdate=true;return texture;
  },[]);
  useEffect(()=>()=>hazeNoise.dispose(),[hazeNoise]);
  const data=useMemo(()=>{
    const count=compact?20:44,positions=new Float32Array(count*3),phases=new Float32Array(count);
    let seed=137;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<count;i++){positions.set([(random()-.5)*15,(random()-.5)*10,random()*21-9],i*3);phases[i]=random()*6.28;}
    return {positions,phases};
  },[compact]);
  const uniforms=useMemo(()=>({time:{value:0},parallax:{value:[0,0]}}),[]);
  useFrame(({clock})=>{
    const time=reduced?0:clock.elapsedTime;
    dust.current.uniforms.time.value=time;
    dust.current.uniforms.parallax.value=[sequence.current.mouseX,sequence.current.mouseY];
    haze.current.uniforms.time.value=time;
  });
  return <>
    <points frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions,3]}/><bufferAttribute attach="attributes-phase" args={[data.phases,1]}/></bufferGeometry>
      <shaderMaterial ref={dust} uniforms={uniforms} transparent depthWrite={false} blending={AdditiveBlending}
        vertexShader={`attribute float phase;uniform float time;uniform vec2 parallax;varying float alpha;void main(){vec3 p=position;p.x+=sin(time*.04+phase)*.15+parallax.x*.1;p.y+=cos(time*.027+phase)*.1+parallax.y*.08;vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;float d=-v.z;gl_PointSize=clamp((8.+phase*3.)/max(.5,d)*3.,1.,24.);alpha=smoothstep(.3,1.5,d)*(.035+phase*.005);}`}
        fragmentShader={`varying float alpha;void main(){float r=length(gl_PointCoord-.5)*2.;float soft=exp(-r*r*4.)*smoothstep(1.,.4,r);gl_FragColor=vec4(vec3(.66,.57,.45),soft*alpha);}`}/>
    </points>
    <mesh rotation={[.3,0,.4]}>
      <sphereGeometry args={[38,32,24]}/>
      <shaderMaterial ref={haze} side={BackSide} transparent depthWrite={false} uniforms={{time:{value:0},noiseMap:{value:hazeNoise}}}
        vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`uniform float time;uniform sampler2D noiseMap;varying vec2 vUv;
        void main(){float n=texture2D(noiseMap,vUv+vec2(time*.00006,0)).r;float band=exp(-pow((vUv.y-.5)*4.,2.));float density=smoothstep(.44,.78,n)*band;gl_FragColor=vec4(vec3(.042,.033,.025),density*.12);}`}/>
    </mesh>
  </>;
}
