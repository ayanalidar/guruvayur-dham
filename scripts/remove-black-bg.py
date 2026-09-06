#!/usr/bin/env python3
"""
Remove black background from logo - proper alpha channel approach.
The new logo has a pure black background which we can detect and make transparent.
"""
from PIL import Image
import numpy as np

INPUT = "/home/z/my-project/upload/ChatGPT Image Sep 6, 2026, 04_20_35 PM.png"
OUTPUT = "/home/z/my-project/public/guruyavur-transparent.png"

# Load and convert to RGBA
img = Image.open(INPUT).convert("RGBA")
data = np.array(img)
r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

# The background is pure black (0,0,0) or very dark
# Make dark pixels transparent, with smooth transition
black_threshold = 30  # Pixels with all channels < 30 = pure black bg
dark_threshold = 60   # Pixels 30-60 = semi-transparent (edge feathering)

# Fully transparent for pure black
black_mask = (r < black_threshold) & (g < black_threshold) & (b < black_threshold)

# Semi-transparent for dark pixels (edges)
dark_mask = (r < dark_threshold) & (g < dark_threshold) & (b < dark_threshold) & ~black_mask

# Create alpha
alpha = np.full(r.shape, 255, dtype=np.uint8)
alpha[black_mask] = 0
alpha[dark_mask] = 100  # semi-transparent for smooth edges

data[:, :, 3] = alpha

# Save as proper RGBA PNG
result = Image.fromarray(data, mode='RGBA')
result.save(OUTPUT, 'PNG')

# Verify
verify = Image.open(OUTPUT)
vdata = np.array(verify)
print(f"Saved: {OUTPUT}")
print(f"Mode: {verify.mode}")
print(f"Size: {verify.size}")
print(f"Shape: {vdata.shape}")
if len(vdata.shape) == 3 and vdata.shape[2] == 4:
    valpha = vdata[:,:,3]
    print(f"Alpha channel: CONFIRMED")
    print(f"Transparent pixels: {np.sum(valpha==0)}/{valpha.size} ({100*np.sum(valpha==0)/valpha.size:.1f}%)")
    print(f"Semi-transparent: {np.sum((valpha>0)&(valpha<255))}")
    print(f"Opaque pixels: {np.sum(valpha==255)}")
else:
    print(f"NO ALPHA CHANNEL - FAILED!")
