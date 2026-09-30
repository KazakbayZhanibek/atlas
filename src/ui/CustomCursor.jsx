import { useEffect, useRef } from 'react';
import gsap from 'gsap';
export default function CustomCursor(){
  const root=useRef();
  useEffect(()=>{
    if(!matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches)return;
    let x=-100,y=-100,cx=-100,cy=-100;
    const move=e=>{x=e.clientX;y=e.clientY;root.current.dataset.visible='true';root.current.dataset.hover=String(!!e.target.closest('a,button'));};
    const down=()=>{root.current.dataset.drag='true';},up=()=>{root.current.dataset.drag='false';},leave=()=>{root.current.dataset.visible='false';};
    const tick=()=>{cx+=(x-cx)*.18;cy+=(y-cy)*.18;root.current.style.transform=`translate3d(${cx}px,${cy}px,0)`;};
    window.addEventListener('pointermove',move);window.addEventListener('pointerdown',down);window.addEventListener('pointerup',up);document.addEventListener('pointerleave',leave);gsap.ticker.add(tick);
    return()=>{gsap.ticker.remove(tick);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);document.removeEventListener('pointerleave',leave);};
  },[]);
  return <div className="custom-cursor" ref={root} aria-hidden="true"><i /></div>;
}
