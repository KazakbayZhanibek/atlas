import { useEffect, useMemo, useRef } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import colorUrl from '../assets/terrain-color.webp';
import normalUrl from '../assets/terrain-normal.webp';
import roughUrl from '../assets/terrain-roughness.webp';
import heightUrl from '../assets/terrain-height.webp';
import Atmosphere from './Atmosphere';

export default function Planet({ sequence, reduced }) {
  const planet = useRef();
  const satellite = useRef();
  const key = useRef();
  const fill = useRef();
  const gl = useThree(s => s.gl);
  const compact = useThree(s => s.size.width < 768);
  const ray = useMemo(()=>new THREE.Raycaster(),[]);
  const surfacePoint = useMemo(()=>new THREE.Vector3(),[]);
  const projected = useMemo(()=>new THREE.Vector3(),[]);
  const hover = useRef({active:false,since:0,frames:0});
  useEffect(()=>{
    const enter=event=>{hover.current.active=event.pointerType==='mouse';};
    const leave=()=>{hover.current.active=false;sequence.current.surface=null;};
    gl.domElement.addEventListener('pointermove',enter);gl.domElement.addEventListener('pointerleave',leave);
    return()=>{gl.domElement.removeEventListener('pointermove',enter);gl.domElement.removeEventListener('pointerleave',leave);};
  },[gl,sequence]);
  const [map, normal, roughness, height] = useLoader(THREE.TextureLoader, [colorUrl, normalUrl, roughUrl, heightUrl]);
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    for (const texture of [map, normal, roughness, height]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    }
  }, [gl, map, normal, roughness, height]);
  useFrame(({ clock, camera, pointer, size }, delta) => {
    const s = sequence.current;
    if (!reduced) planet.current.rotation.y += Math.min(delta, .05) * .009;
    planet.current.rotation.x = .12 + s.mouseY * .018;
    planet.current.parent.rotation.y = s.smooth * .48 + s.mouseX * .025 + (s.drag || 0);
    const angle = s.smooth * 1.2;
    key.current.position.set(-5 + Math.sin(angle) * 1.5 + s.mouseX * .12, 1.7 + s.mouseY * .1, -.8 - s.smooth * 8);
    key.current.intensity = 4.2 - Math.sin(s.smooth * Math.PI) * 1.1 + (reduced ? 0 : Math.sin(clock.elapsedTime * .19) * .025);
    fill.current.intensity = .025 + s.smooth * .04;
    satellite.current.rotation.y = reduced ? 0 : clock.elapsedTime * .008;
    satellite.current.position.y = 3 + (reduced ? 0 : Math.sin(clock.elapsedTime*.03)*.04);
    if(hover.current.active&&!compact&&++hover.current.frames%6===0){
      ray.setFromCamera(pointer,camera);
      const hit=ray.intersectObject(planet.current,false)[0];
      if(hit){
        if(!s.surface)hover.current.since=clock.elapsedTime;
        surfacePoint.copy(hit.point);planet.current.worldToLocal(surfacePoint);surfacePoint.normalize();
        const lat=Math.asin(surfacePoint.y)*180/Math.PI;
        const lon=Math.atan2(surfacePoint.z,surfacePoint.x)*180/Math.PI;
        projected.copy(hit.point).project(camera);
        s.surface={x:(projected.x*.5+.5)*size.width,y:(-.5*projected.y+.5)*size.height,lat,lon,settled:clock.elapsedTime-hover.current.since>.65};
      }else{s.surface=null;}
    }
  });
  return <>
    <ambientLight intensity={.009} />
    <directionalLight ref={key} position={[-5, 1.7, -.8]} color="#ffdda9" intensity={4.2} />
    <directionalLight ref={fill} position={[4, -1, 4]} color="#bcafa0" intensity={.025} />
    <group><mesh ref={planet} rotation={[.12, .4, -.14]}>
      <sphereGeometry args={[2.15, compact ? 96 : 160, compact ? 64 : 112]} />
      <meshStandardMaterial map={map} normalMap={normal} normalScale={[.85, .85]} roughnessMap={roughness} roughness={1} displacementMap={height} displacementScale={.045} displacementBias={-.022} color="#e4cdb0" metalness={0} />
    </mesh></group>
    <Atmosphere sequence={sequence}/>
    <mesh ref={satellite} position={[-5.5, 3, -9]}>
      <sphereGeometry args={[.34, 48, 32]} />
      <meshStandardMaterial map={map} normalMap={normal} roughness={1} color="#71685b" />
    </mesh>
  </>;
}
