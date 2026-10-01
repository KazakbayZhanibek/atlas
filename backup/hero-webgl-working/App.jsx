import { lazy, Suspense, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const HeroCanvas = lazy(() => import('./components/HeroCanvas'));
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const hero = useRef(null);
  const copy = useRef(null);
  const progress = useRef(0);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.to(copy.current, {
        yPercent: -20, opacity: .18, ease: 'none',
        scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: self => { progress.current = self.progress; } },
      });
    }, hero);
    return () => context.revert();
  }, []);

  return <main className="hero-scroll" ref={hero}>
    <section className="hero-stage" aria-labelledby="hero-title">
      <Suspense fallback={<div className="webgl-status" role="status">Preparing live scene</div>}><HeroCanvas scrollProgress={progress} /></Suspense>
      <header className="hero-nav"><a href="#hero-title" aria-label="ATLAS/01 home">ATLAS<span>/01</span></a><span>Interactive object / 001</span><button type="button" aria-label="Scroll to explore the scene" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>Scroll <i /></button></header>
      <div className="hero-copy-live" ref={copy}><p>ATLAS/01 · A digital studio<br />for products with gravity.</p><h1 id="hero-title">We build<br /><em>digital worlds.</em></h1><div><span>Move the cursor</span><span>Scroll to shift the field</span></div></div>
      <div className="hero-readout" aria-hidden="true"><span>SYS · ACTIVE</span><span>X 00.284 / Y 01.672</span></div>
    </section>
  </main>;
}
