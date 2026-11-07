import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = 'd:/VS CODE PROJECTS/WebAPP/public';

// The exact SVG markup: full bleed coral #FF4365, centered Sticksy star
const createSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <rect width="512" height="512" fill="#FF4365" />
  <g transform="translate(256, 256) scale(14.2) translate(-12, -11.51)">
    <polygon points="12 2, 15.09 8.26, 22 9.27, 17 14.14, 18.18 21.02, 12 17.77, 5.82 21.02, 7 14.14, 2 9.27, 8.91 8.26"
             fill="none"
             stroke="#FFFFFF"
             stroke-width="2.6"
             stroke-linecap="round"
             stroke-linejoin="round" />
  </g>
</svg>
`;

async function generate() {
  // Save icon.svg
  fs.writeFileSync(path.join(outDir, 'icon.svg'), createSvg(512), 'utf8');
  console.log('Saved icon.svg');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const sizes = [
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-maskable-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 }
  ];

  for (const { name, size } of sizes) {
    await page.setViewportSize({ width: size, height: size });
    const svgContent = createSvg(size);
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#FF4365;">${svgContent}</body></html>`);
    await page.screenshot({ path: path.join(outDir, name), omitBackground: false });
    console.log(`Generated ${name} (${size}x${size})`);
  }

  await browser.close();
  console.log('All icons generated successfully!');
}

generate().catch(console.error);

