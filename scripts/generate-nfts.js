/**
 * NFT Generation Script using Sharp
 * Combines Background + Character layers to generate NFT images
 * Systematic generation - all 5700 unique combos (20 × 285)
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const LAYERS_DIR = path.join(__dirname, '..', 'layers')
const OUTPUT_IMAGES = path.join(__dirname, '..', 'public', 'nfts', 'images')
const OUTPUT_JSON = path.join(__dirname, '..', 'public', 'nfts', 'json')

function getFiles(dir) {
    return fs.readdirSync(dir)
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .map(f => ({ name: path.parse(f).name, fullPath: path.join(dir, f) }))
}

async function generate() {
    console.log('Reading layers...')
    const backgrounds = getFiles(path.join(LAYERS_DIR, 'Background'))
    const characters = getFiles(path.join(LAYERS_DIR, 'Characters'))
    console.log(`Found ${backgrounds.length} backgrounds, ${characters.length} characters`)

    fs.mkdirSync(OUTPUT_IMAGES, { recursive: true })
    fs.mkdirSync(OUTPUT_JSON, { recursive: true })

    // Determine canvas size from first background
    const firstBg = sharp(backgrounds[0].fullPath)
    const bgMeta = await firstBg.metadata()
    const width = bgMeta.width || 1280
    const height = bgMeta.height || 720
    console.log(`Canvas size: ${width}x${height}`)

    // Count existing files
    const existingFiles = new Set()
    if (fs.existsSync(OUTPUT_IMAGES)) {
        for (const f of fs.readdirSync(OUTPUT_IMAGES)) {
            if (f.endsWith('.png')) existingFiles.add(f)
        }
    }
    console.log(`Already generated: ${existingFiles.size} images`)

    // Pre-cache all background buffers (resized to canvas)
    console.log('Pre-caching background buffers...')
    const bgBuffers = await Promise.all(backgrounds.map(async (bg) => {
        return {
            name: bg.name,
            buffer: await sharp(bg.fullPath)
                .resize(width, height, { fit: 'cover', position: 'centre' })
                .toBuffer()
        }
    }))

    // Pre-cache all character buffers (resized to fit canvas)
    console.log('Pre-caching character buffers...')
    const charBuffers = await Promise.all(characters.map(async (ch) => {
        return {
            name: ch.name,
            buffer: await sharp(ch.fullPath)
                .resize(width, height, { fit: 'inside', position: 'centre' })
                .toBuffer()
        }
    }))

    // Systematic iteration: for each background, iterate all characters
    let generated = 0
    let skipped = 0
    let total = backgrounds.length * characters.length
    let index = 1

    for (let bi = 0; bi < bgBuffers.length; bi++) {
        for (let ci = 0; ci < charBuffers.length; ci++) {
            const outputName = `${index}`
            const imageFile = `${outputName}.png`
            index++

            // Skip if already exists
            if (existingFiles.has(imageFile)) {
                skipped++
                continue
            }

            const bg = bgBuffers[bi]
            const ch = charBuffers[ci]

            // Composite and save
            await sharp({
                create: {
                    width,
                    height,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            })
                .composite([
                    { input: bg.buffer, top: 0, left: 0 },
                    { input: ch.buffer, top: 0, left: 0 }
                ])
                .png()
                .toFile(path.join(OUTPUT_IMAGES, imageFile))

            // Metadata
            const metadata = {
                name: `PAWS NFT #${outputName}`,
                description: `PAWS NFT generated from backgrounds (${bg.name}) and characters (${ch.name})`,
                image: `images/${imageFile}`,
                attributes: [
                    { trait_type: 'Background', value: bg.name },
                    { trait_type: 'Character', value: ch.name }
                ]
            }
            fs.writeFileSync(
                path.join(OUTPUT_JSON, `${outputName}.json`),
                JSON.stringify(metadata, null, 2)
            )

            generated++
            if (generated % 50 === 0) {
                const totalDone = existingFiles.size + generated
                console.log(`Progress: ${totalDone}/${total} (generated ${generated} this session, skipped ${skipped})`)
            }
        }
    }

    const finalTotal = existingFiles.size + generated
    console.log(`\nDone! Total: ${finalTotal}/${total}`)
    console.log(`Generated this session: ${generated}`)
    console.log(`Skipped (already existed): ${skipped}`)
}

generate().catch(err => {
    console.error('Generation failed:', err)
    process.exit(1)
})
