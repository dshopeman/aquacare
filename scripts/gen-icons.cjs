#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function generatePNG(size) {
  const width = size
  const height = size

  // Create RGBA pixel data
  const pixels = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const t = (x + y) / (width + height)

      // Amber gradient: #d97706 → #92400e
      const r = Math.round(0xd9 + (0x92 - 0xd9) * t)
      const g = Math.round(0x77 + (0x40 - 0x77) * t)
      const b = Math.round(0x06 + (0x0e - 0x06) * t)

      // Rounded corner mask
      const cornerR = size * 0.2
      let alpha = 255

      const cx = Math.min(x, width - 1 - x)
      const cy = Math.min(y, height - 1 - y)

      if (cx < cornerR && cy < cornerR) {
        const dx = cornerR - cx
        const dy = cornerR - cy
        if (Math.sqrt(dx * dx + dy * dy) > cornerR) {
          alpha = 0
        }
      }

      pixels[idx] = r
      pixels[idx + 1] = g
      pixels[idx + 2] = b
      pixels[idx + 3] = alpha
    }
  }

  // Build raw PNG scanlines (filter byte 0 = None before each row)
  const rowBuffers = []
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4)
    row[0] = 0 // filter type None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4
      row[1 + x * 4] = pixels[src]
      row[1 + x * 4 + 1] = pixels[src + 1]
      row[1 + x * 4 + 2] = pixels[src + 2]
      row[1 + x * 4 + 3] = pixels[src + 3]
    }
    rowBuffers.push(row)
  }

  const rawData = Buffer.concat(rowBuffers)
  const compressed = zlib.deflateSync(rawData, { level: 6 })

  function crc32(buf) {
    const table = []
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      table[i] = c >>> 0
    }
    let crc = 0xFFFFFFFF
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii')
    const lenBuf = Buffer.alloc(4)
    lenBuf.writeUInt32BE(data.length)
    const crcInput = Buffer.concat([typeBytes, data])
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(crcInput))
    return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const publicDir = path.join(__dirname, '..', 'public')

const sizes = [192, 512]
for (const size of sizes) {
  const buf = generatePNG(size)
  const outPath = path.join(publicDir, `pwa-${size}x${size}.png`)
  fs.writeFileSync(outPath, buf)
  console.log(`Generated ${outPath} (${size}x${size}, ${buf.length} bytes)`)
}
console.log('Done!')
