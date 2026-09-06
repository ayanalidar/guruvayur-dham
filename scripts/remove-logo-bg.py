#!/usr/bin/env python3
"""
Remove cream/off-white background from logo - aggressive approach.
Uses lower threshold + edge feathering for clean transparency.
"""
from PIL import Image
import numpy as np

INPUT = "/home/z/my-project/upload/With GVD.png"
OUTPUT = "/home/z/my-project/public/guruyavur-transparent.png"

img = Image.open(INPUT).convert("RGBA")
data = np.array(img)
r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]

# The background is cream/off-white (around 240-255 for all channels but slightly warm)
# Lower threshold to catch cream colors
white_threshold = 200  # Much more aggressive
white_mask = (r > white_threshold) & (g > white_threshold) & (b > white_threshold)

# Also catch very light pixels (180-200) with partial transparency
light_threshold = 180
light_mask = (r > light_threshold) & (g > light_threshold) & (b > light_threshold) & ~white_mask

# Create gradient alpha for smooth edges
# Pixels 180-200: alpha = 128 (semi-transparent)
# Pixels 200+: alpha = 0 (fully transparent)
# Pixels < 180: alpha = 255 (fully opaque)
alpha = np.full(r.shape, 255, dtype=np.uint8)
alpha[light_mask] = 128
alpha[white_mask] = 0

data[:, :, 3] = alpha
result = Image.fromarray(data)
result.save(OUTPUT, "PNG")
print(f"Background removed (aggressive). Saved: {OUTPUT}")
print(f"Transparent pixels: {np.sum(alpha == 0)} / {alpha.size} ({100*np.sum(alpha == 0)/alpha.size:.1f}%)")
