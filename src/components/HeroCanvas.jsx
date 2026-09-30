import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import CameraRig from '../experience/CameraRig';
import Planet from '../experience/Planet';
import StarField from '../experience/StarField';
import PostProcessing from '../experience/PostProcessing';
function Ready({ onReady }) { useEffect(() => { onReady(); }, [onReady]); return null; }
function Visibility() {
  const set = useThree(s => s.set);
  useEffect(() => {
    const update = () => set({ frameloop:document.hidden ? 'never' : 'always' });
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [set]);
  return null;
}
export default function HeroCanvas({ sequence, reduced, onReady, onFailure }) {
  const [lost, setLost] = useState(false);
  useEffect(() => { if (lost) onFailure(); }, [lost, onFailure]);
  return <Canvas className="hero-canvas" dpr={[1,1.5]} camera={{ position:[0,.3,11.7], fov:42, near:.05, far:150 }} gl={{ antialias:false, alpha:false, powerPreference:'high-performance' }} onCreated={({ gl }) => { gl.setClearColor('#050505'); gl.domElement.addEventListener('webglcontextlost', () => setLost(true), {once:true}); }}>
    <Visibility />
    <Suspense fallback={null}>
      <CameraRig sequence={sequence} reduced={reduced} />
      <Planet sequence={sequence} reduced={reduced} />
      <StarField sequence={sequence} reduced={reduced} />
      <PostProcessing reduced={reduced} />
      <Ready onReady={onReady} />
    </Suspense>
  </Canvas>;
}
