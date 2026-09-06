import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  console.log('Loading new logo...');
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/ChatGPT Image Sep 6, 2026, 04_20_35 PM.png');
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;

  console.log('Calling AI to remove black background...');
  const zai = await ZAI.create();

  const response = await zai.images.generations.edit({
    prompt: 'Remove the solid black background completely. Make ALL black background areas fully transparent (alpha=0). Keep only the golden circular logo with its border, the blue Krishna figure, golden Om symbol, temple architecture, peacock feathers, lotus designs, and the GVD GuruVayur Dham text. The result should be a PNG with a fully transparent background - only the circular logo design should be visible, floating on transparency.',
    images: [{ url: dataUrl }],
    size: '1024x1024'
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync('/home/z/my-project/public/guruyavur-transparent.png', buffer);
  console.log(`Done! Saved (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
