/**
 * Generate PWA icons (192, 512, maskable 512) — pure navy + white, NO gold.
 * Saves to /home/z/my-project/public/icons/
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const OUT_DIR = "/home/z/my-project/public/icons";

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  function svgIcon(size: number, maskable = false) {
    const pad = maskable ? Math.round(size * 0.22) : 0;
    const inner = size - pad * 2;
    const cx = inner / 2;
    const cy = inner / 2;
    const r = inner / 2 - 8;
    const fontSize = Math.round(inner * 0.55);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="navy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="60%" stop-color="#0B2447"/>
      <stop offset="100%" stop-color="#081830"/>
    </linearGradient>
  </defs>
  ${maskable ? `<rect width="${size}" height="${size}" fill="url(#navy)"/>` : `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#navy)"/>`}
  <g transform="translate(${pad}, ${pad})">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="${Math.max(2, Math.round(inner * 0.010))}" opacity="0.18"/>
    <text x="${cx}" y="${cy + Math.round(inner * 0.2)}" font-family="Geist, system-ui, sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle" fill="#FFFFFF">8</text>
  </g>
</svg>`;
  }

  const tasks: Array<[number, string, boolean?]> = [
    [192, "icon-192.png", false],
    [512, "icon-512.png", false],
    [512, "icon-512-maskable.png", true],
    [180, "icon-180.png", false],
    [32, "icon-32.png", false],
  ];

  for (const [size, name, maskable] of tasks) {
    const svg = Buffer.from(svgIcon(size, maskable));
    await sharp(svg).png().toFile(path.join(OUT_DIR, name));
    console.log(`generated ${name} (${size}x${size}${maskable ? ", maskable" : ""})`);
  }

  const favSvg = Buffer.from(svgIcon(32, false));
  await sharp(favSvg).png().toFile(path.join("/home/z/my-project/public", "favicon.png"));
  console.log("generated favicon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
