#!/usr/bin/env python3
"""
Optimize transparent logo into all variants using PIL (preserves RGBA).
"""
from PIL import Image
import os

INPUT = "/home/z/my-project/public/guruyavur-transparent.png"
OUTPUT_DIR = "/home/z/my-project/public"

variants = [
    {"name": "guruyavur.png", "size": 1024},
    {"name": "logo-large.png", "size": 512},
    {"name": "logo-nav.png", "size": 80},
    {"name": "logo-footer.png", "size": 96},
]

img = Image.open(INPUT).convert("RGBA")
print(f"Source: {img.mode} {img.size}")

for v in variants:
    resized = img.resize((v["size"], v["size"]), Image.LANCZOS)
    path = os.path.join(OUTPUT_DIR, v["name"])
    resized.save(path, "PNG", optimize=True)
    size_kb = os.path.getsize(path) / 1024
    # Verify
    check = Image.open(path)
    print(f"  {v['name']} ({v['size']}x{v['size']}) {size_kb:.1f} KB - mode={check.mode}")

print("Done! All variants have RGBA alpha channel.")
