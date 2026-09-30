import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

const vertex = `
attribute float aSize; attribute float aPhase;
uniform float uTime; uniform float uSize; uniform float uOpacity;
varying float vAlpha;
void main(){
  vec3 p=position;
  p.x+=sin(uTime*.07+aPhase)*.025;
  p.y+=cos(uTime*.05+aPhase)*.035;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=clamp(aSize*uSize*(80./max(1.,-mv.z)),.65,4.);
  vAlpha=uOpacity*(.72+.28*sin(uTime*.32+aPhase));
}`;
const fragment = `varying float vAlpha; void main(){float r=length(gl_PointCoord-.5)*2.; float a=exp(-r*r*5.)*smoothstep(1.,.45,r); gl_FragColor=vec4(vec3(.89,.86,.79),a*vAlpha);}`;
function Layer({ count, radius, opacity, pointSize, sequence, reduced, seed }) {
  const points = useRef();
  const material = useRef();
  const data = useMemo(() => {
    let value = seed;
    const random = () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
    const positions = new Float32Array(count * 3), sizes = new Float32Array(count), phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Two broad galactic bands, interspersed with deliberately empty sky.
      const clustered = random() > .3;
      const theta = random() * Math.PI * 2;
      const y = clustered ? Math.sin(theta * 2) * .3 + (random() - .5) * .18 : random() * 1.8 - .9;
      const r = radius * (.8 + random() * .4);
      positions.set([Math.cos(theta) * Math.sqrt(1-y*y)*r, y*r, Math.sin(theta)*Math.sqrt(1-y*y)*r], i*3);
      sizes[i] = .3 + Math.pow(random(), 4) * 1.5;
      phases[i] = random() * 100;
    }
    return { positions, sizes, phases };
  }, [count, radius, seed]);
  const uniforms = useMemo(() => ({ uTime:{value:0}, uSize:{value:pointSize}, uOpacity:{value:opacity} }), [pointSize, opacity]);
  useFrame(({ clock }) => {
    material.current.uniforms.uTime.value = reduced ? 0 : clock.elapsedTime;
    points.current.rotation.y = sequence.current.smooth * .022 + sequence.current.mouseX * (.15 / radius);
    points.current.rotation.x = sequence.current.mouseY * (.1 / radius);
  });
  return <points ref={points} frustumCulled={false}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[data.positions,3]} />
      <bufferAttribute attach="attributes-aSize" args={[data.sizes,1]} />
      <bufferAttribute attach="attributes-aPhase" args={[data.phases,1]} />
    </bufferGeometry>
    <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} blending={AdditiveBlending} />
  </points>;
}
export default function StarField(props) {
  const mobile = useThree(s => s.size.width < 768);
  return <>
    <Layer {...props} count={mobile ? 1000 : 1900} radius={65} opacity={.47} pointSize={1} seed={42} />
    <Layer {...props} count={mobile ? 140 : 350} radius={28} opacity={.28} pointSize={.8} seed={93} />
    <Layer {...props} count={mobile ? 24 : 70} radius={12} opacity={.12} pointSize={.7} seed={12} />
  </>;
}
