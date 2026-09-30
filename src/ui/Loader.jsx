import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';
export default function Loader({ ready, reduced }) {
  const { progress } = useProgress();
  const root = useRef();
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (!ready || !root.current) return;
    const timeline = gsap.timeline({ onComplete:() => setFinished(true) });
    timeline.to(root.current.querySelector('.loader-content'), { opacity:0, y:-12, duration:reduced ? .1 : .55 }, .2).to(root.current, { clipPath:'inset(0 0 100% 0)', duration:reduced ? .1 : 1.25, ease:'power3.inOut' }, .45);
    return () => timeline.kill();
  }, [ready, reduced]);
  if (finished) return null;
  const value = ready ? 100 : Math.min(99, Math.round(progress));
  return <div ref={root} className="loader" role="status" aria-live="polite"><div className="loader-content"><strong>ATLAS<span>/01</span></strong><p>Initializing orbital system</p><div className="loader-track"><i style={{transform:`scaleX(${value/100})`}} /></div><div className="loader-data"><span>{ready ? 'Visual link established' : value < 50 ? 'Loading terrain' : 'Preparing orbital sequence'}</span><b>{String(value).padStart(2,'0')}</b></div></div></div>;
}
