import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { paths } from './sequence';

export default function CameraRig({ sequence, reduced }) {
  const compact = useThree(s => s.size.width < 768);
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
    const t = reduced ? 0 : state.smooth;
    paths[compact ? 'mobile' : 'desktop'].getPoint(t, pos);
    paths[compact ? 'targetMobile' : 'targetDesktop'].getPoint(t, aim);
    if (!reduced) {
      pos.x += state.mouseX * .1 + Math.sin(clock.elapsedTime * .12) * .018;
      pos.y += state.mouseY * .07 + Math.cos(clock.elapsedTime * .1) * .018;
    }
    if (!initialized.current) { camera.position.copy(pos); target.current.copy(aim); initialized.current = true; }
    camera.position.lerp(pos, 1 - Math.exp(-5 * dt));
    target.current.lerp(aim, 1 - Math.exp(-5 * dt));
    camera.lookAt(target.current);
    state.distance = camera.position.length();
  }, -2);
  return null;
}
