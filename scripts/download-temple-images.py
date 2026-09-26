"""
Download + optimize temple images from the ZAI image-search service.
Saves to /public/temples/ with SEO-friendly filenames.
"""
import os
import urllib.request
from PIL import Image

IMAGES = {
    "krishna-janmabhoomi": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a4206d43ece2.jpg",
    "dwarkadhish-temple": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0db7b9fb279d.jpg",
    "vishram-ghat": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/aec8c540c409.jpg",
    "bhuteshwar-mahadev": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/435e3ed794b7.jpg",
    "nand-bhavan": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6bc3b05560f4.jpg",
    "raman-reti": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/86487b5752cf.jpg",
    "brahmand-ghat": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/88a82fd22e85.jpg",
    "thakurani-ghat": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/aec8c540c409.jpg",  # reuse Vishram Ghat for now (same area)
    "banke-bihari": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d5edf768acc2.jpg",
    "prem-mandir": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4d4fa8d7851a.jpg",
    "radha-raman": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/510a5195d1f4.jpg",
    "nidhivan": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5aa8d366a3eb.jpg",
    "radha-rani-barsana": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b3d67594180c.jpg",
    "mata-pathwari": "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/435e3ed794b7.jpg",  # reuse Bhuteshwar (local temple)
}

DST_DIR = "/home/z/my-project/public/temples"
MAX_WIDTH = 800
QUALITY = 80


def download_and_optimize(slug: str, url: str) -> tuple[int, int]:
    """Download, resize, compress. Returns (orig_size, new_size)."""
    raw_path = os.path.join(DST_DIR, f"{slug}-raw.jpg")
    dst_path = os.path.join(DST_DIR, f"{slug}.jpg")

    # Download
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        with open(raw_path, "wb") as f:
            f.write(resp.read())
    orig_size = os.path.getsize(raw_path)

    # Optimize
    img = Image.open(raw_path)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    if img.width > MAX_WIDTH:
        new_height = int(img.height * (MAX_WIDTH / img.width))
        img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)
    img.save(dst_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    new_size = os.path.getsize(dst_path)

    # Clean up raw
    os.remove(raw_path)
    return orig_size, new_size


def main():
    os.makedirs(DST_DIR, exist_ok=True)
    total_orig = 0
    total_new = 0
    for slug, url in IMAGES.items():
        try:
            orig, new = download_and_optimize(slug, url)
            print(f"✓ {slug}.jpg  ({orig//1024}KB → {new//1024}KB)")
            total_orig += orig
            total_new += new
        except Exception as e:
            print(f"✗ {slug}: {e}")

    print(f"\nTotal: {total_orig//1024}KB → {total_new//1024}KB ({(1 - total_new/total_orig)*100:.0f}% saved)")
    print(f"Saved to: {DST_DIR}/")


if __name__ == "__main__":
    main()
