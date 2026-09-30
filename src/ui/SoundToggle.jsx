import { useEffect, useRef, useState } from 'react';
export default function SoundToggle(){
  const audio=useRef(null);const[enabled,setEnabled]=useState(false);const[unavailable,setUnavailable]=useState(false);
  useEffect(()=>()=>{audio.current?.context.close();},[]);
  useEffect(()=>{const visibility=()=>{if(document.hidden){audio.current?.context.suspend();setEnabled(false);}};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[]);
  const toggle=async()=>{try{
    if(!audio.current){const Context=window.AudioContext||window.webkitAudioContext;const context=new Context();const gain=context.createGain();gain.gain.value=0;gain.connect(context.destination);for(const frequency of [55,82.4,110.2]){const oscillator=context.createOscillator();oscillator.type='sine';oscillator.frequency.value=frequency;oscillator.connect(gain);oscillator.start();}audio.current={context,gain};}
    const{context,gain}=audio.current;await context.resume();gain.gain.setTargetAtTime(enabled?0:.013,context.currentTime,.4);setEnabled(!enabled);
  }catch{setUnavailable(true);}};
  return <button type="button" className="sound-toggle" onClick={toggle} aria-pressed={enabled} disabled={unavailable} aria-label="Toggle quiet ambient sound">Sound {unavailable?'unavailable':enabled?'on':'off'}<span className="sound-dot" aria-hidden="true" /></button>;
}
