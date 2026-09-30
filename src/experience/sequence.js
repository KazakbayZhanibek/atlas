import { CatmullRomCurve3, Vector3, MathUtils } from 'three';

// Camera paths stay outside the surface; negative-space targets are authored
// separately so that tracking never cancels the motion of the planet.
const desktop = [[0, .3, 10.4], [1.4, .25, 6.9], [2.6, .45, 2.8], [3.7, .7, -.8], [4.6, 1.5, -7], [5.6, 2, -13]];
const mobile = [[0, .3, 11.7], [1.2, .1, 7.5], [2.7, .4, 3.1], [3.8, .8, -.6], [4.8, 1.9, -8], [5.6, 2.3, -16]];
const targetDesktop = [[-1.6, .1, 0], [-1.25, 0, 0], [2.1, .2, 0], [1.2, .2, 0], [-2.2, -.4, 0], [-3.5, -.8, 0]];
const targetMobile = [[0, -1.15, 0], [-.4, .7, 0], [1.4, -.6, 0], [1.1, -.5, 0], [-.6, -1, 0], [-1.7, -1.8, 0]];
const curve = points => new CatmullRomCurve3(points.map(p => new Vector3(...p)), false, 'catmullrom', .3);
export const paths = { desktop: curve(desktop), mobile: curve(mobile), targetDesktop: curve(targetDesktop), targetMobile: curve(targetMobile) };
export const clamp = MathUtils.clamp;
export const chapters = [
  { name: 'Approach', lines: ['A world waits', 'beyond the', 'light.'], italic: 2, copy: 'An orbital study in light, scale and the unknown.', at: 0, out: .19 },
  { name: 'Terrain', lines: ['Every scar.', 'A story.'], italic: 1, copy: 'Closer to a world shaped by time.', at: .23, out: .43 },
  { name: 'Nightfall', lines: ['Beyond the', 'visible.'], italic: 1, copy: 'Follow the last light to the other side.', at: .48, out: .69 },
  { name: 'Perspective', lines: ['A different', 'perspective.'], italic: 1, copy: 'Digital worlds by ATLAS/01. Built to be felt.', at: .76, out: 1.2 },
];
