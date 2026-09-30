"""Derive lightweight artistic material maps from the existing approved terrain."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[1] / 'src/assets'
source = Image.open(root / 'atlas-planet-surface-v2.png').convert('RGB')
source.resize((2048, 1024), Image.Resampling.LANCZOS).save(root / 'terrain-color.webp', quality=90)
height = source.resize((1024, 512), Image.Resampling.LANCZOS).convert('L')
height = height.filter(ImageFilter.GaussianBlur(.55))
h = np.asarray(height, dtype=np.float32) / 255
dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 3.5
dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 3.5
normal = np.stack((-dx, dy, np.ones_like(h)), axis=-1)
normal /= np.linalg.norm(normal, axis=-1, keepdims=True)
Image.fromarray(np.uint8((normal * .5 + .5) * 255)).save(root / 'terrain-normal.webp', lossless=True)
Image.fromarray(np.uint8(185 + (1-h)*62)).save(root / 'terrain-roughness.webp', lossless=True)
height.save(root / 'terrain-height.webp', lossless=True)
for f in root.glob('terrain-*.webp'):
    print(f.name, f.stat().st_size)
