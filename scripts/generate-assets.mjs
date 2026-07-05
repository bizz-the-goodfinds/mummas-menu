/**
 * Regenerates brand assets with sharp:
 *   - public/images/og-image.jpg  — clean OG card (flat pink, no decorative circles)
 *   - public/icons/icon-192/512   — black-line logo on transparent (purpose: any)
 *   - public/icons/icon-maskable-512 — black logo on pink (Android splash + masked icon)
 *   - public/icons/apple-touch-icon  — black logo on pink, 180px
 *
 * Run: node scripts/generate-assets.mjs
 * Needs the Poppins font for the OG text — downloads it to ~/.fonts on first
 * run (librsvg picks fonts up via fontconfig).
 */
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

const publicDir = path.join(process.cwd(), "public");
const PINK = "#ffeded"; // --color-brand-pink
const PINK_SOFT = "#fdf2f0"; // og background — matches the site's soft wash
const RED = "#d32f2f"; // --color-brand-red
const BLACK = "#0d0d0d";

/* ── ensure Poppins is available to fontconfig ──────────────────────────── */
async function ensureFonts() {
  const fontsDir = path.join(os.homedir(), ".fonts");
  await fs.mkdir(fontsDir, { recursive: true });
  const fonts = [
    ["Poppins-Bold.ttf", "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf"],
    [
      "Poppins-SemiBold.ttf",
      "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf",
    ],
  ];
  let downloaded = false;
  for (const [name, url] of fonts) {
    const dest = path.join(fontsDir, name);
    try {
      await fs.access(dest);
    } catch {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`font download failed: ${url} (${res.status})`);
      await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
      downloaded = true;
      console.log(`  ↓ ${name}`);
    }
  }
  if (downloaded) execSync("fc-cache -f > /dev/null 2>&1 || true");
}

/* ── OG image: flat background, roundel, title, tagline — no circles ────── */
async function generateOg() {
  const logo = await sharp(path.join(publicDir, "images/logo/logo.png"))
    .resize(310, 310)
    .png()
    .toBuffer();

  const textSvg = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <text x="600" y="490" text-anchor="middle"
        font-family="Poppins" font-weight="700" font-size="68" fill="${BLACK}">Mumma&#39;s Menu</text>
      <text x="600" y="552" text-anchor="middle"
        font-family="Poppins" font-weight="600" font-size="30" fill="${RED}">Homestyle Cloud Kitchen · Order on WhatsApp</text>
    </svg>`);

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: PINK_SOFT },
  })
    .composite([
      { input: logo, left: Math.round((1200 - 310) / 2), top: 62 },
      { input: textSvg, left: 0, top: 0 },
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(publicDir, "images/og-image.jpg"));
  console.log("✓ og-image.jpg (clean, no circles)");
}

/* ── PWA icons: black logo; pink only where a solid bg is required ──────── */
async function generateIcons() {
  const face = path.join(publicDir, "images/logo/logo-icon-black.png");
  const iconsDir = path.join(publicDir, "icons");
  await fs.mkdir(iconsDir, { recursive: true });

  const faceAt = (size) => sharp(face).resize(size, size).png().toBuffer();

  // purpose "any": black logo on transparent — no pink circle behind it
  for (const size of [192, 512]) {
    const inner = Math.round(size * 0.86);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: await faceAt(inner), gravity: "center" }])
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
  }

  // maskable: Android splash + adaptive icon — pink bg, logo inside safe zone
  await sharp({
    create: { width: 512, height: 512, channels: 3, background: PINK },
  })
    .composite([{ input: await faceAt(312), gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "icon-maskable-512.png"));

  // iOS home screen (no transparency support): pink bg
  await sharp({
    create: { width: 180, height: 180, channels: 3, background: PINK },
  })
    .composite([{ input: await faceAt(126), gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));

  console.log("✓ icons: icon-192/512 (transparent), maskable + apple-touch (pink bg)");
}

await ensureFonts();
await generateOg();
await generateIcons();
console.log("Done.");
