import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

const gold = new THREE.Color('#c99a4a');

const vertexShader = `
  varying vec3 vNormal; varying vec3 vWorld; varying float vNoise;
  float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453123);}
  float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1.,0.,0.)),f.x),mix(hash(i+vec3(0.,1.,0.)),hash(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(hash(i+vec3(0.,0.,1.)),hash(i+vec3(1.,0.,1.)),f.x),mix(hash(i+vec3(0.,1.,1.)),hash(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
  void main(){float a=noise(normal*2.25),b=noise(normal*8.5)*.34;vNoise=a+b;vec3 p=position+normal*((a-.5)*.11+(b-.17)*.03);vNormal=normalize(normalMatrix*normal);vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}
`;
const fragmentShader = `
  uniform vec3 uGold; uniform float uTime; varying vec3 vNormal; varying vec3 vWorld; varying float vNoise;
  void main(){vec3 view=normalize(cameraPosition-vWorld);float rim=pow(1.-max(0.,dot(view,vNormal)),2.2);float light=max(0.,dot(normalize(vec3(-.5,.72,1.)),vNormal));float grain=sin(vNoise*36.+uTime*.45)*.045;vec3 color=mix(vec3(.012,.013,.015),uGold*.36,light+grain);color+=uGold*rim*.82;gl_FragColor=vec4(color,.98);}
`;

function createParticles(count) {
  const positions = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const radius = 2.1 + Math.random() * 2.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) * .72;
    const z = radius * Math.sin(phi) * Math.sin(theta);
    base.set([x, y, z], i * 3); positions.set([x, y, z], i * 3); phase[i] = Math.random() * Math.PI * 2;
  }
  return { positions, base, phase };
}

function ParticleField({ compact, pointer, scrollProgress }) {
  const points = useRef();
  const count = compact ? 1200 : 2600;
  const { positions, base, phase } = useMemo(() => createParticles(count), [count]);
  useFrame(({ clock }, delta) => {
    const attribute = points.current.geometry.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      positions[offset] = base[offset] + Math.sin(t * .32 + phase[i]) * .12 + pointer.current.x * .36;
      positions[offset + 1] = base[offset + 1] + Math.cos(t * .44 + phase[i] * 1.7) * .12 + pointer.current.y * .28;
      positions[offset + 2] = base[offset + 2] + Math.sin(t * .28 + phase[i] * .6) * .16 - scrollProgress.current * 1.4;
    }
    attribute.needsUpdate = true;
    points.current.rotation.y += delta * .018;
  });
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#e4bf76" size={compact ? .017 : .012} transparent opacity={.82} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

function OrbitLines({ compact }) {
  const curve = useMemo(() => count => Array.from({ length: count }, (_, i) => { const a = i / (count - 1) * Math.PI * 2; return [Math.cos(a) * 3.1, Math.sin(a) * 1.12, 0]; }), []);
  const points = curve(compact ? 96 : 160);
  return <><group rotation={[1.12, .25, .4]}><Line points={points} color="#c99a4a" transparent opacity={.48} lineWidth={.55} /></group><group rotation={[.48, 1.05, -.74]}><Line points={points} color="#f2d394" transparent opacity={.3} lineWidth={.45} /></group><group rotation={[1.55, -.28, -.22]}><Line points={points} color="#9e7334" transparent opacity={.25} lineWidth={.35} /></group></>;
}

function Scene({ scrollProgress, compact }) {
  const world = useRef();
  const sphere = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  const material = useRef();
  useEffect(() => { const move = event => { pointer.current.x = event.clientX / window.innerWidth - .5; pointer.current.y = event.clientY / window.innerHeight - .5; }; window.addEventListener('pointermove', move, { passive: true }); return () => window.removeEventListener('pointermove', move); }, []);
  useFrame(({ camera, clock }, delta) => {
    const progress = scrollProgress.current;
    world.current.rotation.y = THREE.MathUtils.damp(world.current.rotation.y, pointer.current.x * .32 + progress * .7, 2.4, delta);
    world.current.rotation.x = THREE.MathUtils.damp(world.current.rotation.x, -pointer.current.y * .22 + progress * .14, 2.4, delta);
    sphere.current.rotation.y += delta * .17;
    sphere.current.rotation.z += delta * .055;
    sphere.current.position.y = Math.sin(clock.elapsedTime * .55) * .08 - progress * .7;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.current.x * .7 + progress * .55, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.current.y * .45 - progress * .42, 2.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 7.1 - progress * 1.4, 2.5, delta);
    camera.lookAt(0, -progress * .28, 0);
    material.current.uniforms.uTime.value = clock.elapsedTime;
  });
  return <group ref={world}><ambientLight intensity={.35} /><pointLight position={[-4, 4, 5]} color="#f0c875" intensity={18} distance={15} /><pointLight position={[3, -2, 2]} color="#846024" intensity={8} distance={10} /><group ref={sphere}><mesh><sphereGeometry args={[1.72, compact ? 40 : 72, compact ? 40 : 72]} /><shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{ uGold: { value: gold }, uTime: { value: 0 } }} /></mesh><mesh scale={1.06}><sphereGeometry args={[1.72, compact ? 28 : 42, compact ? 28 : 42]} /><meshBasicMaterial color="#c99a4a" transparent opacity={.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh></group><ParticleField compact={compact} pointer={pointer} scrollProgress={scrollProgress} /><OrbitLines compact={compact} /></group>;
}

export default function HeroCanvas({ scrollProgress }) {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 767px)').matches || navigator.hardwareConcurrency <= 4);
  useEffect(() => { const media = window.matchMedia('(max-width: 767px)'); const update = () => setCompact(media.matches || navigator.hardwareConcurrency <= 4); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  return <Canvas className="hero-canvas" dpr={compact ? [1, 1.25] : [1, 1.6]} camera={{ position: [0, 0, 7.1], fov: 43 }} gl={{ alpha: true, antialias: !compact, powerPreference: 'high-performance' }}><Scene scrollProgress={scrollProgress} compact={compact} /></Canvas>;
}
