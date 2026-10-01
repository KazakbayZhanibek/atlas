# ATLAS/01 — orbital study

A continuous React Three Fiber experience: approach, terrain pass, nightfall,
and a wide planetary system reveal. This is a fictional studio concept.

## Run on Windows PowerShell

```powershell
cd C:\Users\Janchik\Documents\ChatGPT\SiteBeast
npm install
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Open http://127.0.0.1:5174/. Keep the terminal running. `npm run build`
produces the production files in `dist`.

## Structure

- `src/experience/sequence.js`: camera and target curves, chapter timing.
- `src/experience/CameraRig.jsx`: inertial camera, pointer and scroll response.
- `src/experience/Planet.jsx`: four material maps, displacement, animated lights, moon.
- `src/experience/Atmosphere.jsx`: very faint illuminated surface rim, without an outer shell.
- `src/experience/StarField.jsx`: three spatial layers with GPU motion and clustered distribution.
- `src/experience/PostProcessing.jsx`: tone mapping, grain, vignette, adaptive render resolution.
- `src/hooks/useSequence.js`: Lenis and one normalized GSAP ScrollTrigger progress.
- `src/ui/`: masked typography, HUD, cursor, loading transition and opt-in sound.
- `scripts/prepare-terrain.py`: reproducible derivation of material maps from the approved texture.

## Controls and accessibility

Scroll in either direction to control the sequence. Pointer movement slightly
changes the camera and lighting. Mouse dragging adds up to three degrees of
planet rotation, with inertia; touch remains available for normal scrolling.
Audio is synthesized locally and starts only when Sound is enabled. It suspends
when the tab is hidden. Reduced-motion preference keeps the opening composition
still. Failed WebGL/asset loading shows a retry action instead of a blank screen.
Non-visible chapters are inert and hidden from assistive technology.

## Material and performance notes

Terrain maps are artistic derivatives of the existing fictional planet texture,
not scanned scientific elevation data. Color is 2048×1024; normal, height and
roughness maps are 1024×512. All are WebP, totaling approximately 2.16 MB.
Mobile uses fewer stars, a smaller sphere mesh and render scale capped at 1.
Desktop DPR is capped at 1.5 and reduces to 1 when sustained frame rate falls.
Rendering pauses in a hidden tab. Development-only canvas data attributes expose
sampled FPS and camera position; they are absent from production builds.

## Verification

- Browser checks: desktop, 375×812, forward/backward scroll, loading transition,
  desktop drag, sound on/off, mobile overflow and console errors.
- Screenshots: `artifacts/desktop-final.jpg`, `artifacts/mobile-start.jpg`.
- Sampled desktop frame rate in the embedded browser was approximately 53–57 FPS;
  this is not a guarantee for other devices. Mobile was viewport emulation, not
  physical phone testing.
- The contact link uses the placeholder `hello@example.com`. Replace it before publishing.
- Vite reports a large JavaScript chunk warning; this is a build warning, not a runtime error.
