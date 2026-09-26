"""
Map brochure PDF photos to the 5 room types and copy to /public/rooms/.

Each photo is resized to max 1280px wide and JPEG-compressed to ~150KB
(keeps the existing ~250KB-per-photo size budget the platform uses).

After this script runs, the existing /public/rooms/{slug}-main.jpg and
{slug}-N.jpg files will be replaced with actual photos from the brochure.
"""
import shutil
import os
from PIL import Image

# Map: brochure image → which room + which slot
# Based on VLM analysis of each image:
# - deluxe-room (Family Suit/Quad, 2 double beds, yellow curved headboards):
#     img-002 (two double beds, yellow curved headboard, wide)
#     img-003 (alt angle of same yellow headboard room)
#     img-174 (two beds variant)
#     img-175 (two single beds variant — different bedspreads)
# - super-deluxe-room (King Deluxe, king + lounge sofa + TV):
#     img-107 (king + teal sofa + TV — has the lounge sofa)
#     img-009 (king + channel-tufted headboard + wood + botanical art)
#     img-005 (double bed + blue runner + painting)
#     img-142 (double + second bed visible)
# - superior-room (Premium Double Bed, fluted paneling + tall headboard + vanity):
#     img-048 (king + tall vertical headboard + vanity nook + backlit mirror)
#     img-053 (king + yellow channel-tufted headboard)
#     img-054 (king + olive-green channel-tufted + floating vanity shelf)
#     img-049 (king + vertical channel + diagonal panel + vanity)
#     img-004 (queen/king + vertical channel-tufted + recessed lighting)
# - gvd-suite (Privilege Suite, full living + Smart TV with Netflix):
#     img-106 (king + ornate white headboard + TV displaying NETFLIX)
#     img-010 (king + padded headboard + green accent + TV)
#     img-141 (double + single mattress on floor — suite variant)
#     img-142 (double + second bed visible — suite variant)
# - family-comfort-triple-room (1 double + 1 single/diwan):
#     img-141 (double + single mattress + red runner — matches 1 double + 1 single spec)
#     img-142 (double + second bed + textured gold wallpaper)
#     img-005 (double bed + wood paneling)
#     img-174 (two beds variant)

# Note: some images appear in multiple room galleries because the
# brochure doesn't have unique photos for each room type — we share
# visually-similar photos where appropriate.

MAPPING = {
    # deluxe-room (Family Suit/Quad Room — 2 double beds)
    "deluxe-room": {
        "main": "brochure-img-002.jpg",       # wide 1391x810 — yellow curved headboards, two double beds
        "gallery": [
            "brochure-img-003.jpg",            # alt angle 1395x620 — same yellow headboards
            "brochure-img-174.jpg",            # 1882x942 — two beds variant
            "brochure-img-175.jpg",            # 1882x471 — two single beds
        ],
    },
    # super-deluxe-room (King Deluxe Room — king + lounge sofa + TV)
    "super-deluxe-room": {
        "main": "brochure-img-107.jpg",       # 1619x854 — king + teal sofa + TV
        "gallery": [
            "brochure-img-009.jpg",            # 1378x1034 — king + channel-tufted + wood
            "brochure-img-005.jpg",            # 1379x1035 — double + blue runner + painting
            "brochure-img-142.jpg",            # 1600x900 — double + second bed visible
        ],
    },
    # superior-room (Premium Double Bed Room — fluted paneling + vanity)
    "superior-room": {
        "main": "brochure-img-048.jpg",        # 1379x1035 — king + tall headboard + vanity nook + backlit mirror
        "gallery": [
            "brochure-img-053.jpg",            # 1379x1035 — king + yellow channel-tufted
            "brochure-img-054.jpg",            # 1379x1035 — king + olive-green + floating vanity
            "brochure-img-049.jpg",            # 1379x1035 — king + diagonal panel + vanity
            "brochure-img-004.jpg",             # 831x720 — king + vertical channel + recessed lighting
        ],
    },
    # gvd-suite (Privilege Suite — full living + Smart TV with Netflix)
    "gvd-suite": {
        "main": "brochure-img-106.jpg",       # 1649x806 — king + ornate white headboard + NETFLIX on TV
        "gallery": [
            "brochure-img-010.jpg",            # 1378x1034 — king + padded headboard + green accent + TV
            "brochure-img-141.jpg",            # 1600x1200 — double + single mattress (suite variant)
            "brochure-img-142.jpg",            # 1600x900 — double + second bed visible
            "brochure-img-005.jpg",            # 1379x1035 — alt angle (shared with super-deluxe)
        ],
    },
    # family-comfort-triple-room (1 Double + 1 Single/Diwan)
    "family-comfort-triple-room": {
        "main": "brochure-img-141.jpg",       # 1600x1200 — double + single mattress + red runner
        "gallery": [
            "brochure-img-142.jpg",            # 1600x900 — double + second bed + textured gold wallpaper
            "brochure-img-005.jpg",            # 1379x1035 — double + wood paneling + painting
            "brochure-img-174.jpg",            # 1882x942 — two beds variant
        ],
    },
}

SRC_DIR = "/tmp/pdf-images"
DST_DIR = "/home/z/my-project/public/rooms"
MAX_WIDTH = 1280  # px — Vercel image optimizer handles responsive sizes
QUALITY = 82  # JPEG quality (80-85 is sweet spot for ~150-250KB photos)


def optimize_and_save(src_path: str, dst_path: str) -> tuple[int, int]:
    """Resize to max 1280px wide, JPEG-compress, save. Returns (orig_size, new_size)."""
    orig_size = os.path.getsize(src_path)
    img = Image.open(src_path)
    # Convert to RGB if needed (JPEG doesn't support alpha)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    # Resize if wider than MAX_WIDTH (preserve aspect ratio)
    if img.width > MAX_WIDTH:
        new_height = int(img.height * (MAX_WIDTH / img.width))
        img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)
    # Save with quality optimization
    img.save(dst_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    new_size = os.path.getsize(dst_path)
    return orig_size, new_size


def main():
    os.makedirs(DST_DIR, exist_ok=True)
    total_orig = 0
    total_new = 0
    photo_count = 0

    for slug, mapping in MAPPING.items():
        print(f"\n=== {slug} ===")
        # Main image
        main_src = os.path.join(SRC_DIR, mapping["main"])
        main_dst = os.path.join(DST_DIR, f"{slug}-main.jpg")
        orig, new = optimize_and_save(main_src, main_dst)
        print(f"  main: {mapping['main']} → {slug}-main.jpg  ({orig//1024}KB → {new//1024}KB)")
        total_orig += orig
        total_new += new
        photo_count += 1

        # Gallery images
        for i, gallery_src_name in enumerate(mapping["gallery"], start=1):
            gallery_src = os.path.join(SRC_DIR, gallery_src_name)
            gallery_dst = os.path.join(DST_DIR, f"{slug}-{i}.jpg")
            orig, new = optimize_and_save(gallery_src, gallery_dst)
            print(f"  gallery {i}: {gallery_src_name} → {slug}-{i}.jpg  ({orig//1024}KB → {new//1024}KB)")
            total_orig += orig
            total_new += new
            photo_count += 1

    print(f"\n=== Summary ===")
    print(f"Total photos: {photo_count}")
    print(f"Total original size: {total_orig//1024} KB ({total_orig//1024//1024} MB)")
    print(f"Total optimized size: {total_new//1024} KB ({total_new//1024//1024} MB)")
    print(f"Savings: {(1 - total_new / total_orig) * 100:.1f}%")
    print(f"\nAll photos saved to: {DST_DIR}/")


if __name__ == "__main__":
    main()
