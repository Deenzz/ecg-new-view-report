const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image scanlines
  // Filter byte 0 for each scanline, then width * 3 bytes
  const scanlineWidth = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineWidth);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // No filter

    // Draw a dark slate background with a glowing rose/cyan ECG wave line in the middle
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      
      // Calculate normalized coords
      const nx = x / width;
      const ny = y / height;

      // ECG wave mathematical approximation
      let waveY = 0.5;
      if (nx > 0.2 && nx < 0.28) {
        // P-wave
        waveY -= 0.05 * Math.sin((nx - 0.2) / 0.08 * Math.PI);
      } else if (nx >= 0.35 && nx < 0.39) {
        // Q dip
        waveY += 0.04 * Math.sin((nx - 0.35) / 0.04 * Math.PI);
      } else if (nx >= 0.39 && nx < 0.45) {
        // Tall R-spike
        waveY -= 0.35 * Math.sin((nx - 0.39) / 0.06 * Math.PI);
      } else if (nx >= 0.45 && nx < 0.49) {
        // S dip
        waveY += 0.15 * Math.sin((nx - 0.45) / 0.04 * Math.PI);
      } else if (nx >= 0.55 && nx < 0.68) {
        // T-wave
        waveY -= 0.12 * Math.sin((nx - 0.55) / 0.13 * Math.PI);
      }

      const dist = Math.abs(ny - waveY) * height;
      
      if (dist < 4) {
        // Crisp ECG line: cyan to rose
        const t = nx;
        rawData[pixelOffset] = Math.round(244 * t + 6 * (1 - t));     // R
        rawData[pixelOffset + 1] = Math.round(63 * t + 182 * (1 - t)); // G
        rawData[pixelOffset + 2] = Math.round(94 * t + 212 * (1 - t)); // B
      } else if (dist < 9) {
        // Soft glow
        rawData[pixelOffset] = 120;
        rawData[pixelOffset + 1] = 40;
        rawData[pixelOffset + 2] = 80;
      } else if (x % 20 === 0 || y % 20 === 0) {
        // ECG grid dots/lines
        rawData[pixelOffset] = 25;
        rawData[pixelOffset + 1] = 35;
        rawData[pixelOffset + 2] = 55;
      } else {
        // Deep medical slate dark background
        rawData[pixelOffset] = 15;
        rawData[pixelOffset + 1] = 23;
        rawData[pixelOffset + 2] = 42;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcPayload);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32));

console.log('Successfully generated PWA and Apple Touch icons!');
