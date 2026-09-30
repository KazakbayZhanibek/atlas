import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export default function PostProcessing({ reduced }) {
  const { gl, scene, camera, size } = useThree();
  const pipeline = useMemo(() => {
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    const output = new OutputPass();
    const film = new ShaderPass({
      uniforms: { tDiffuse: { value:null }, time: {value:0} },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
      void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;
      float n=fract(sin(dot(gl_FragCoord.xy+time,vec2(12.9898,78.233)))*43758.5453)-.5;
      float vignette=1.-.17*pow(length((vUv-.5)*1.25),2.);
      c=c*vignette+n*.012; gl_FragColor=vec4(c,1.);}`
    });
    composer.addPass(render); composer.addPass(output); composer.addPass(film);
    return { composer, render, output, film };
  }, [gl, scene, camera]);
  useEffect(() => {
    pipeline.composer.setPixelRatio(Math.min(gl.getPixelRatio(), size.width < 768 ? 1 : 1.5));
    pipeline.composer.setSize(size.width, size.height);
  }, [pipeline, gl, size]);
  useEffect(() => () => {
    pipeline.composer.dispose(); pipeline.output.dispose(); pipeline.film.dispose();
  }, [pipeline]);
  useFrame(({ clock }, delta) => {
    pipeline.film.uniforms.time.value = reduced ? 0 : Math.floor(clock.elapsedTime * 24);
    pipeline.composer.render(delta);
  }, 1);
  return null;
}
