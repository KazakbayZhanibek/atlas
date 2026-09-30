import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import useSequence from './hooks/useSequence';
import Loader from './ui/Loader';
import FilmOverlay from './ui/FilmOverlay';
import CustomCursor from './ui/CustomCursor';
import SoundToggle from './ui/SoundToggle';
const HeroCanvas=lazy(()=>import('./components/HeroCanvas'));
class SceneBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return{failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed?null:this.props.children;}
}
export default function App(){
  const root=useRef(null);
  const[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches);
  const sequence=useSequence(root,reduced);
  const onReady=useCallback(()=>setReady(true),[]);
  const onFailure=useCallback(()=>{setFailed(true);setReady(true);},[]);
  useEffect(()=>{const query=matchMedia('(prefers-reduced-motion:reduce)');const update=()=>setReduced(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
  return <main className={`film ${failed?'has-fallback':''}`} ref={root}>
    <section className="film-stage" aria-label="ATLAS orbital exploration">
      {!failed&&<SceneBoundary onFailure={onFailure}><Suspense fallback={null}><HeroCanvas sequence={sequence} reduced={reduced} onReady={onReady} onFailure={onFailure}/></Suspense></SceneBoundary>}
      {failed&&<div className="scene-fallback" role="status"><p>The live scene is unavailable on this device.</p><button onClick={()=>location.reload()}>Retry visual link</button></div>}
      <header className="film-nav"><a href="#sequence" aria-label="ATLAS/01 — return to the start">ATLAS<span>/01</span></a><p>Independent digital worlds</p><SoundToggle/></header>
      <FilmOverlay sequence={sequence} ready={ready} reduced={reduced||failed}/>
      <Loader ready={ready} reduced={reduced}/><CustomCursor/>
    </section>
  </main>;
}
