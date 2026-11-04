// Renders the Rosarium app icon (gold decade of beads + cross on lapis) to PNG, no dependencies.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const out = process.argv[2];
const BG = [42, 72, 150], GOLD = [222, 186, 104], PALE = [236, 239, 244];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, px) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    px.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

// Shapes in a 512 design space, painted in order.
function shapes() {
  const s = [];
  const cx = 256, cy = 212, R = 112, n = 12, gap = 34;
  s.push({ t: "ring", cx, cy, r: R, w: 3, c: PALE, a: 0.55 });
  s.push({ t: "rect", x0: 254.5, y0: cy + R, x1: 257.5, y1: 352, c: PALE, a: 0.55 });
  for (let i = 0; i < n; i++) {
    const ang = (90 + gap / 2 + i * (360 - gap) / (n - 1)) * Math.PI / 180;
    s.push({ t: "circle", cx: cx + R * Math.cos(ang), cy: cy + R * Math.sin(ang), r: 15, c: GOLD });
  }
  s.push({ t: "circle", cx, cy: cy + R, r: 13, c: PALE });
  s.push({ t: "circle", cx, cy: 360, r: 17, c: GOLD });
  s.push({ t: "rect", x0: 247, y0: 384, x1: 265, y1: 452, c: GOLD });
  s.push({ t: "rect", x0: 226, y0: 402, x1: 286, y1: 418, c: GOLD });
  return s;
}
function hit(sh, x, y) {
  if (sh.t === "circle") return (x - sh.cx) ** 2 + (y - sh.cy) ** 2 <= sh.r ** 2;
  if (sh.t === "ring") { const d = Math.hypot(x - sh.cx, y - sh.cy); return Math.abs(d - sh.r) <= sh.w / 2; }
  return x >= sh.x0 && x <= sh.x1 && y >= sh.y0 && y <= sh.y1;
}
function render(size, scale) {
  // scale < 1 shrinks the artwork toward the centre (for the maskable safe zone)
  const S = shapes(), ss = 4, px = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let acc = [0, 0, 0];
    for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
      let u = ((x + (sx + 0.5) / ss) / size) * 512, v = ((y + (sy + 0.5) / ss) / size) * 512;
      u = 256 + (u - 256) / scale; v = 256 + (v - 256) / scale;
      let col = BG;
      for (const sh of S) if (hit(sh, u, v)) {
        const a = sh.a ?? 1;
        col = col.map((c, i) => c * (1 - a) + sh.c[i] * a);
      }
      acc = acc.map((c, i) => c + col[i]);
    }
    const o = (y * size + x) * 3;
    for (let i = 0; i < 3; i++) px[o + i] = Math.round(acc[i] / (ss * ss));
  }
  return png(size, px);
}

writeFileSync(`${out}/icon-192.png`, render(192, 1));
writeFileSync(`${out}/icon-512.png`, render(512, 1));
writeFileSync(`${out}/icon-maskable-512.png`, render(512, 0.8));
writeFileSync(`${out}/apple-touch-icon.png`, render(180, 0.92));
console.log("icons written");
