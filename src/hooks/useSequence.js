import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
export default function useSequence(root, reduced) {
  const sequence = useRef({ progress:0, smooth:0, mouseX:0, mouseY:0, distance:11, ready:false });
  useEffect(() => {
    const lenis = new Lenis({ duration:1.35, smoothWheel:!reduced, syncTouch:false });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = time => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    const trigger = ScrollTrigger.create({ trigger:root.current, start:'top top', end:'bottom bottom', onUpdate:self => { sequence.current.progress = self.progress; } });
    sequence.current.progress = trigger.progress;
    return () => { trigger.kill(); gsap.ticker.remove(tick); lenis.destroy(); };
  }, [root, reduced]);
  return sequence;
}
