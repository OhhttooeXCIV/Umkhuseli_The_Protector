import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPng(width, height, getPixel) {
  // getPixel(x, y) => [r, g, b, a]
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    let crc = 0xffffffff;
    function updateCrc(buf) {
      for (let i = 0; i < buf.length; i++) {
        let byte = buf[i];
        crc = crc ^ byte;
        for (let j = 0; j < 8; j++) {
          crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
      }
    }
    updateCrc(typeBuf);
    updateCrc(data);
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icon: Dark slate background #0F172A with a glowing cyan/sky bolt emblem #38BDF8
function renderDecoyIcon(size) {
  return createPng(size, size, (x, y) => {
    // Normalised coordinates -1 to 1
    const nx = (x / size) * 2 - 1;
    const ny = (y / size) * 2 - 1;
    const distSq = nx * nx + ny * ny;

    // Rounded rectangle mask (radius ~ 0.25)
    const cornerRadius = 0.25;
    const qx = Math.max(0, Math.abs(nx) - (1 - cornerRadius));
    const qy = Math.max(0, Math.abs(ny) - (1 - cornerRadius));
    const outsideDist = Math.sqrt(qx * qx + qy * qy);
    if (outsideDist > cornerRadius) {
      return [0, 0, 0, 0]; // Transparent outside icon bounds
    }

    // Background gradient: dark navy/slate (#0F172A to #1E293B)
    let r = 15 + Math.floor(15 * (ny + 1) * 0.5);
    let g = 23 + Math.floor(18 * (ny + 1) * 0.5);
    let b = 42 + Math.floor(25 * (ny + 1) * 0.5);

    // Draw stylized electricity/water meter emblem in center
    // Centered bolt coordinates:
    const bx = nx * 1.6;
    const by = ny * 1.6;
    
    // Check if inside bolt polygon roughly
    const inTopHalf = by >= -0.7 && by <= 0.0 && bx >= -0.25 && bx <= (0.15 - by * 0.5);
    const inBottomHalf = by >= 0.0 && by <= 0.7 && bx <= 0.25 && bx >= (-0.15 - by * 0.5);
    const inCenterDiagonal = Math.abs(bx + by * 0.4) < 0.22 && by > -0.6 && by < 0.6;

    if (inTopHalf || inBottomHalf || inCenterDiagonal) {
      // Sky 400 / Cyan 400 (#38BDF8)
      return [56, 189, 248, 255];
    }

    // Outer subtle border
    if (outsideDist > cornerRadius - 0.04) {
      return [51, 65, 85, 255]; // Slate-700 ring
    }

    return [r, g, b, 255];
  });
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Apple Touch Icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderDecoyIcon(180));
console.log('✓ Generated apple-touch-icon.png (180x180)');

// 2. PWA Icons 192x192 & 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), renderDecoyIcon(192));
console.log('✓ Generated pwa-192x192.png (192x192)');

fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), renderDecoyIcon(512));
console.log('✓ Generated pwa-512x512.png (512x512)');

// 3. bolt.svg & favicon.ico
const boltSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#38BDF8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
fs.writeFileSync(path.join(publicDir, 'bolt.svg'), boltSvg);
console.log('✓ Generated bolt.svg');
