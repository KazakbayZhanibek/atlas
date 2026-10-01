import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { chapters, clamp } from '../experience/sequence';
export default function FilmOverlay({ sequence, ready, reduced }) {
  const root = useRef();
  const hud = useRef();
  const target = useRef();
  useEffect(() => {
    const nodes = [...root.current.querySelectorAll('article')].map(article => ({ article, lines:[...article.querySelectorAll('.line-inner')], copy:article.querySelector('.scene-copy') }));
    let intro = 0, last = performance.now(), lastHud = 0;
    const update = () => {
      const now=performance.now(), dt=Math.min((now-last)/1000,.05); last=now;
      if(ready) intro=Math.min(2,intro+dt);
      const p=reduced?0:sequence.current.smooth;
      nodes.forEach(({article,lines,copy},i)=>{
        const chapter=chapters[i];
        const entrance=i===0?clamp((intro-.75)/.65,0,1):clamp((p-chapter.at)/.055,0,1);
        const exit=clamp((p-chapter.out)/.045,0,1), visible=entrance>0&&exit<1;
        if(i===0)article.style.transform=`translate3d(${-Math.min(p/.15,1)*45}px,${Math.min(p/.15,1)*24}px,0)`;
        article.style.visibility=visible?'visible':'hidden';article.setAttribute('aria-hidden',String(!visible));article.inert=!visible;
        lines.forEach((line,j)=>{const t=clamp(entrance*1.35-j*.16,0,1), eased=1-Math.pow(1-t,3);line.style.transform=`translate3d(0,${(1-eased)*112-exit*115}%,0)`;});
        copy.style.opacity=clamp(entrance*2-.6,0,1)*(1-exit);copy.style.transform=`translateY(${(1-entrance)*12-exit*10}px)`;
      });
      root.current.style.setProperty('--sequence',p);
      root.current.dataset.started=String(p>.002);
      const surface=sequence.current.surface;
      if(target.current){
        target.current.style.opacity=surface?'.65':'0';
        if(surface){
          target.current.style.transform=`translate3d(${surface.x}px,${surface.y}px,0)`;
          const label=target.current.querySelector('span');
          label.style.opacity=surface.settled?'1':'0';
          label.textContent=`SURFACE\n${Math.abs(surface.lat).toFixed(2)}° ${surface.lat>=0?'N':'S'}\n${Math.abs(surface.lon).toFixed(2)}° ${surface.lon>=0?'E':'W'}`;
        }
      }
      if(now-lastHud>100&&hud.current){lastHud=now;const phase=p<.39?0:p<.56?1:p<.76?2:3;
        hud.current.querySelector('[data-phase]').textContent=`0${phase+1} / ${chapters[phase].name}`;
        hud.current.querySelector('[data-distance]').textContent=`${sequence.current.distance.toFixed(2)} R`;
        hud.current.querySelector('[data-bearing]').textContent=`${(sequence.current.mouseX*2+p*180).toFixed(1)}°`;
        hud.current.querySelector('[data-percent]').textContent=`${String(Math.round(p*100)).padStart(3,'0')}%`;
      }
    };
    gsap.ticker.add(update);return()=>gsap.ticker.remove(update);
  },[ready,reduced,sequence]);
  return <div className="film-overlay" ref={root}><div className="film-states" id="sequence">{chapters.map((chapter,i)=>{const Heading=i===0?'h1':'h2';return <article className={`film-state state-${i+1}`} key={chapter.name}><Heading aria-label={chapter.lines.join(' ')}>{chapter.lines.map((line,j)=><span className="line-mask" aria-hidden="true" key={line}><span className={`line-inner ${j===chapter.italic?'serif':''}`}>{line}</span></span>)}</Heading><div className="scene-copy"><p>{chapter.copy}</p>{i===3&&<a className="film-cta" href="mailto:hello@example.com">Start a conversation <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" /></svg></a>}</div></article>;})}</div>
    <div className="surface-target" ref={target} aria-hidden="true"><i/><span/></div>
    <div ref={hud} className="film-hud" aria-hidden="true"><div className="hud-left"><span className="hud-label">Orbital study · simulated</span><b data-phase>01 / Approach</b></div><div className="hud-telemetry"><span>DIST <b data-distance>11.70 R</b></span><span>AZ <b data-bearing>0.0°</b></span></div><div className="hud-progress"><span>Direct the sequence</span><div className="progress-track"><i /><em/></div><b data-percent>000%</b></div></div>
  </div>;
}
