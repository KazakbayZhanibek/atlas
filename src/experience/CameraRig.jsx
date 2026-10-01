import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { paths, cameraTime } from './sequence';

export default function CameraRig({ sequence, reduced }) {
  const compact = useThree(s => s.size.width < 768);
  const aspect = useThree(s => s.size.width / s.size.height);
  const target = useRef(new Vector3());
  const pos = useMemo(() => new Vector3(), []);
  const aim = useMemo(() => new Vector3(), []);
  const initialized = useRef(false);
  useFrame(({ camera, pointer, clock }, rawDelta) => {
    const dt = Math.min(rawDelta, .05);
    const state = sequence.current;
    state.smooth = MathUtils.damp(state.smooth, state.progress, reduced ? 50 : 5, dt);
    state.mouseX = MathUtils.damp(state.mouseX, pointer.x, 3, dt);
    state.mouseY = MathUtils.damp(state.mouseY, pointer.y, 3, dt);
    state.drag = MathUtils.damp(state.drag || 0, state.dragTarget || 0, 3, dt);
    const progress = reduced ? 0 : state.smooth;
    const t = compact ? progress : cameraTime(progress);
    paths[compact ? 'mobile' : 'desktop'].getPoint(t, pos);
    paths[compact ? 'targetMobile' : 'targetDesktop'].getPoint(t, aim);
    if (!compact) aim.x += (1.7778-aspect)*1.7*Math.max(0,1-progress/.16);
    if (!reduced) {
      pos.x += state.mouseX * .06 + Math.sin(clock.elapsedTime * .16) * .024;
      pos.y += state.mouseY * .035 + Math.cos(clock.elapsedTime * .11) * .014;
      const idleApproach=(1-Math.exp(-clock.elapsedTime/7))*.11;
      pos.z -= (idleApproach+Math.sin(clock.elapsedTime*.09)*.012)*Math.max(0,1-progress/.16);
    }
    // Curve interpolation must never put the lens inside displaced terrain.
    if(pos.length()<2.32) pos.setLength(2.32);
    if (!initialized.current) { camera.position.copy(pos); target.current.copy(aim); initialized.current = true; }
    camera.position.lerp(pos, 1 - Math.exp(-5 * dt));
    target.current.lerp(aim, 1 - Math.exp(-5 * dt));
    camera.lookAt(target.current);
    state.distance = camera.position.length();
  }, -2);
  return null;
}
