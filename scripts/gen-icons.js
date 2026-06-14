#!/usr/bin/env node
// Generates simple PNG icons using pure Node.js (no canvas dependency)
// Creates a valid minimal PNG with amber gradient and "LV" text

const fs = require('fs')
const path = require('path')

function writePNG(filename, size) {
  // Create a simple solid-color PNG using raw bytes
  // PNG format: signature + IHDR + IDAT + IEND

  const { createCanvas } = (() => {
    try {
      return require('canvas')
    } catch {
      return null
    }
  })() || {}

  if (createCanvas) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, '#d97706')
    grad.addColorStop(1, '#92400e')
    ctx.fillStyle = grad

    // Rounded rect
    const r = size * 0.2
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(size - r, 0)
    ctx.arcTo(size, 0, size, r, r)
    ctx.lineTo(size, size - r)
    ctx.arcTo(size, size, size - r, size, r)
    ctx.lineTo(r, size)
    ctx.arcTo(0, size, 0, size - r, r)
    ctx.lineTo(0, r)
    ctx.arcTo(0, 0, r, 0, r)
    ctx.closePath()
    ctx.fill()

    // Text "LV"
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${size * 0.4}px sans-serif`
    ctx.fillText('LV', size / 2, size * 0.45)

    ctx.font = `${size * 0.1}px sans-serif`
    ctx.fillText('Lava Velho', size / 2, size * 0.78)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(filename, buffer)
    console.log(`Generated ${filename} (${size}x${size}) using canvas`)
    return
  }

  // Fallback: minimal valid PNG with amber color (#d97706)
  // Using zlib deflate for IDAT chunk
  const zlib = require('zlib')

  const width = size
  const height = size

  // Create RGBA pixel data
  const pixels = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Amber gradient (#d97706 to #92400e)
      const t = (x + y) / (width + height)
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
        if (Math.sqrt(dx*dx + dy*dy) > cornerR) {
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
  const rawRows = []
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4)
    row[0] = 0 // filter type None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4
      row.copy(pixels, 1 + x * 4, src, src + 4) // wrong direction, fix:
    }
    // Fix: copy from pixels to row
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4
      row[1 + x * 4] = pixels[src]
      row[1 + x * 4 + 1] = pixels[src + 1]
      row[1 + x * 4 + 2] = pixels[src + 2]
      row[1 + x * 4 + 3] = pixels[src + 3]
    }
    rawRows.push(row)
  }

  const rawData = Buffer.concat(rawRows)
  const compressed = zlib.deflateSync(rawData, { level: 6 })

  function crc32(buf) {
    const table = []
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    let crc = 0xFFFFFFFF
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii')
    const lenBuf = Buffer.alloc(4)
    lenBuf.writeUInt32BE(data.length)
    const crcData = Buffer.concat([typeBytes, data])
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(crcData))
    return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
  }

  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])

  fs.writeFileSync(filename, png)
  console.log(`Generated ${filename} (${size}x${size}) using pure JS PNG encoder`)
}

const publicDir = path.join(__dirname, '..', 'public')
writePNG(path.join(publicDir, 'pwa-192x192.png'), 192)
writePNG(path.join(publicDir, 'pwa-512x512.png'), 512)
console.log('Done!')
