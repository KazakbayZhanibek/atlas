import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export default function PostProcessing({ reduced }) {
  const { gl, scene, camera, size } = useThree();
  const performance = useRef({ frames:0, elapsed:0, tier:1.5 });
  const pipeline = useMemo(() => {
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    const output = new OutputPass();
    const film = new ShaderPass({
      uniforms: { tDiffuse: { value:null }, time: {value:0}, texel:{value:[1/1440,1/900]}, bloomStrength:{value:.014} },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform sampler2D tDiffuse; uniform float time; uniform float bloomStrength; uniform vec2 texel; varying vec2 vUv;
      void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;
      if(bloomStrength>0.){vec3 bloom=vec3(0.);for(int i=0;i<8;i++){float angle=float(i)*.785398;vec3 sampleColor=texture2D(tDiffuse,vUv+vec2(cos(angle),sin(angle))*texel*3.).rgb;bloom+=max(sampleColor-vec3(.72),vec3(0.));}c+=bloom*bloomStrength;}
      float n=fract(sin(dot(gl_FragCoord.xy+time,vec2(12.9898,78.233)))*43758.5453)-.5;
      float vignette=1.-.17*pow(length((vUv-.5)*1.25),2.);
      c=c*vignette*(1.+sin(time*.07)*.003)+n*.008; gl_FragColor=vec4(c,1.);}`
    });
    composer.addPass(render); composer.addPass(output); composer.addPass(film);
    return { composer, render, output, film };
  }, [gl, scene, camera]);
  useEffect(() => {
    pipeline.composer.setPixelRatio(Math.min(gl.getPixelRatio(), size.width < 768 ? 1 : performance.current.tier));
    pipeline.composer.setSize(size.width, size.height);
    pipeline.film.uniforms.texel.value=[1/size.width,1/size.height];
  }, [pipeline, gl, size]);
  useEffect(() => () => {
    pipeline.composer.dispose(); pipeline.output.dispose(); pipeline.film.dispose();
  }, [pipeline]);
  useFrame(({ clock }, delta) => {
    const sample=performance.current;
    sample.frames++;sample.elapsed+=delta;
    if(sample.elapsed>2){
      const fps=sample.frames/sample.elapsed;
      if(fps<42&&sample.tier>.75){sample.tier=sample.tier>1?1:.75;pipeline.composer.setPixelRatio(sample.tier);pipeline.film.uniforms.bloomStrength.value=0;}
      if(import.meta.env.DEV){gl.domElement.dataset.renderFps=fps.toFixed(1);gl.domElement.dataset.cameraPosition=camera.position.toArray().map(v=>v.toFixed(2)).join(',');}
      sample.frames=0;sample.elapsed=0;
    }
    pipeline.film.uniforms.time.value = reduced ? 0 : clock.elapsedTime*60;
    pipeline.composer.render(delta);
  }, 1);
  return null;
}
