const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgPath = path.resolve(__dirname, '../public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Rendering PWA icons from SVG using Sharp...');

  // 1. 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve(__dirname, '../public/pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve(__dirname, '../public/pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. Apple Touch Icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 4. Maskable 512x512 (with 15% safe padding on solid background to prevent clipping on Android)
  const innerSize = Math.round(512 * 0.80); // 80% safe zone
  const innerIcon = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 7, b: 4, alpha: 1 }, // #0f0704
    },
  })
    .composite([
      {
        input: innerIcon,
        top: Math.round((512 - innerSize) / 2),
        left: Math.round((512 - innerSize) / 2),
      },
    ])
    .png()
    .toFile(path.resolve(__dirname, '../public/pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  console.log('All PWA assets successfully generated!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
