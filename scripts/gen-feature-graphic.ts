/**
 * Generate Play Store feature graphic (1024×500) — navy + white.
 * Saves to /home/z/my-project/download/pay8-feature-graphic.png
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const OUT = "/home/z/my-project/download";

async function main() {
  await mkdir(OUT, { recursive: true });

  // Feature graphic — 1024×500, navy gradient background, big white "8" + wordmark + tagline
  const feature = `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="navy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="60%" stop-color="#0B2447"/>
      <stop offset="100%" stop-color="#081830"/>
    </linearGradient>
    <radialGradient id="orb" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#3B5BDB" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0B2447" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#navy)"/>
  <rect width="1024" height="500" fill="url(#orb)"/>
  <circle cx="880" cy="100" r="180" fill="#FFFFFF" opacity="0.05"/>
  <circle cx="940" cy="60" r="60" fill="#FFFFFF" opacity="0.08"/>

  <!-- Logo mark -->
  <g transform="translate(110, 110)">
    <rect width="160" height="160" rx="38" fill="#FFFFFF" opacity="0.95"/>
    <text x="80" y="125" font-family="Geist, system-ui, sans-serif" font-size="140" font-weight="800" text-anchor="middle" fill="#0B2447">8</text>
  </g>

  <!-- Wordmark + tagline -->
  <text x="290" y="195" font-family="Geist, system-ui, sans-serif" font-size="92" font-weight="800" fill="#FFFFFF">PAY8</text>
  <text x="294" y="245" font-family="Geist, system-ui, sans-serif" font-size="32" font-weight="500" fill="#FFFFFF" opacity="0.85">Your money, your commute, one tap.</text>

  <!-- Bottom badges -->
  <g transform="translate(110, 340)">
    <rect width="240" height="60" rx="30" fill="#FFFFFF" opacity="0.10"/>
    <text x="120" y="40" font-family="Geist, system-ui, sans-serif" font-size="22" font-weight="600" text-anchor="middle" fill="#FFFFFF">Send · Receive · QR Pay</text>
  </g>
  <g transform="translate(370, 340)">
    <rect width="220" height="60" rx="30" fill="#FFFFFF" opacity="0.10"/>
    <text x="110" y="40" font-family="Geist, system-ui, sans-serif" font-size="22" font-weight="600" text-anchor="middle" fill="#FFFFFF">Bank Transfer · InstaPay</text>
  </g>
  <g transform="translate(610, 340)">
    <rect width="280" height="60" rx="30" fill="#FFFFFF" opacity="0.10"/>
    <text x="140" y="40" font-family="Geist, system-ui, sans-serif" font-size="22" font-weight="600" text-anchor="middle" fill="#FFFFFF">PAY8 Card · Tap-to-pay transit</text>
  </g>

  <text x="110" y="465" font-family="Geist, system-ui, sans-serif" font-size="18" font-weight="500" fill="#FFFFFF" opacity="0.6">Built for Filipinos, by Filipinos. Regulated by the Bangko Sentral ng Pilipinas.</text>
</svg>`;

  await sharp(Buffer.from(feature)).png().toFile(path.join(OUT, "pay8-feature-graphic.png"));
  console.log("generated pay8-feature-graphic.png (1024×500)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
