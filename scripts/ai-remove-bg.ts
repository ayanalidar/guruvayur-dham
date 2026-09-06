import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  console.log('Loading image...');
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/With GVD.png');
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;

  console.log('Calling AI image edit...');
  const zai = await ZAI.create();

  const response = await zai.images.generations.edit({
    prompt: 'Remove the white and cream colored background completely. Make ALL background areas transparent (see-through). Keep only the golden circular logo border, the blue Krishna figure, the golden Om symbol, the temple architecture, peacock feathers, and the GVD GuruVayur Dham text. The result should be a transparent PNG with only the logo design elements visible, no background fill at all.',
    images: [{ url: dataUrl }],
    size: '1024x1024'
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync('/home/z/my-project/public/guruyavur-transparent.png', buffer);
  console.log('Done! Saved to public/guruyavur-transparent.png');
  console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(e => { console.error(e); process.exit(1); });
