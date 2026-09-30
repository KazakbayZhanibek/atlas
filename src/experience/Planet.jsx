import { useEffect, useRef } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import colorUrl from '../assets/terrain-color.webp';
import normalUrl from '../assets/terrain-normal.webp';
import roughUrl from '../assets/terrain-roughness.webp';
import heightUrl from '../assets/terrain-height.webp';

export default function Planet({ sequence, reduced }) {
  const planet = useRef();
  const satellite = useRef();
  const key = useRef();
  const fill = useRef();
  const gl = useThree(s => s.gl);
  const compact = useThree(s => s.size.width < 768);
  const [map, normal, roughness, height] = useLoader(THREE.TextureLoader, [colorUrl, normalUrl, roughUrl, heightUrl]);
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    for (const texture of [map, normal, roughness, height]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    }
  }, [gl, map, normal, roughness, height]);
  useFrame(({ clock }, delta) => {
    const s = sequence.current;
    if (!reduced) planet.current.rotation.y += Math.min(delta, .05) * .009;
    planet.current.rotation.x = .12 + s.mouseY * .018;
    planet.current.parent.rotation.y = s.smooth * .48 + s.mouseX * .025;
    const angle = s.smooth * 1.2;
    key.current.position.set(-4 + Math.sin(angle) * 2 + s.mouseX * .16, 2.5 + s.mouseY * .15, 4.5 - s.smooth * 8);
    key.current.intensity = 3.8 - Math.sin(s.smooth * Math.PI) * 1.5 + (reduced ? 0 : Math.sin(clock.elapsedTime * .19) * .025);
    fill.current.intensity = .075 + s.smooth * .08;
    satellite.current.rotation.y = reduced ? 0 : clock.elapsedTime * .008;
  });
  return <>
    <ambientLight intensity={.018} />
    <directionalLight ref={key} position={[-4, 2.5, 4.5]} color="#ffe2b7" intensity={3.8} />
    <directionalLight ref={fill} position={[4, -1, -4]} color="#bcafa0" intensity={.075} />
    <group><mesh ref={planet} rotation={[.12, .4, -.14]}>
      <sphereGeometry args={[2.15, compact ? 96 : 160, compact ? 64 : 112]} />
      <meshStandardMaterial map={map} normalMap={normal} normalScale={[.85, .85]} roughnessMap={roughness} roughness={1} displacementMap={height} displacementScale={.045} displacementBias={-.022} color="#e4cdb0" metalness={0} />
    </mesh></group>
    <mesh ref={satellite} position={[-4.5, 1.2, 3]}>
      <sphereGeometry args={[.43, 48, 32]} />
      <meshStandardMaterial map={map} normalMap={normal} roughness={1} color="#b5afa2" />
    </mesh>
  </>;
}
