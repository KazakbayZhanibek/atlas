import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

// A lit Fresnel edge on the surface, not a coloured shell around the planet.
export default function Atmosphere({ sequence }) {
  const material=useRef();
  const uniforms=useMemo(()=>({strength:{value:.035}}),[]);
  useFrame(()=>{material.current.uniforms.strength.value=.025+Math.sin(sequence.current.smooth*Math.PI)*.025;});
  return <mesh>
    <sphereGeometry args={[2.175,64,48]}/>
    <shaderMaterial ref={material} transparent depthWrite={false} blending={AdditiveBlending} uniforms={uniforms}
      vertexShader={`varying vec3 n; varying vec3 p; void main(){vec4 w=modelMatrix*vec4(position,1.); n=normalize(mat3(modelMatrix)*normal);p=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`}
      fragmentShader={`uniform float strength; varying vec3 n; varying vec3 p; void main(){float rim=pow(1.-max(0.,dot(normalize(cameraPosition-p),n)),5.);float lit=max(0.,dot(n,normalize(vec3(-5.,1.7,-.8))));gl_FragColor=vec4(vec3(.7,.52,.3),rim*lit*strength);}`} />
  </mesh>;
}
