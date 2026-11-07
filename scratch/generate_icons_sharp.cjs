const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../public');

// The exact Sticksy logo: Full-bleed coral #FF4365, mathematically centered white star
const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#FF4365" />
  <g transform="translate(256, 256) scale(14.5) translate(-12, -11.51)">
    <polygon points="12 2, 15.09 8.26, 22 9.27, 17 14.14, 18.18 21.02, 12 17.77, 5.82 21.02, 7 14.14, 2 9.27, 8.91 8.26"
             fill="none"
             stroke="#FFFFFF"
             stroke-width="2.6"
             stroke-linecap="round"
             stroke-linejoin="round" />
  </g>
</svg>`;

async function run() {
  // 1. Save icon.svg
  fs.writeFileSync(path.join(outDir, 'icon.svg'), svg512, 'utf8');
  console.log('Saved public/icon.svg');

  const targets = [
    { file: 'icon-512.png', size: 512 },
    { file: 'icon-maskable-512.png', size: 512 },
    { file: 'icon-192.png', size: 192 },
    { file: 'icon-maskable-192.png', size: 192 },
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'favicon-32x32.png', size: 32 }
  ];

  for (const t of targets) {
    const svgBuffer = Buffer.from(svg512);
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(path.join(outDir, t.file));
    console.log(`Generated ${t.file} (${t.size}x${t.size})`);
  }

  console.log('All icons generated successfully!');
}

run().catch(console.error);

