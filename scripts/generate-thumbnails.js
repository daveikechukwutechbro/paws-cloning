const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'nfts', 'images')
const THUMBS_DIR = path.join(__dirname, '..', 'public', 'nfts', 'thumbs')

async function main() {
    fs.mkdirSync(THUMBS_DIR, { recursive: true })

    const files = fs.readdirSync(IMAGES_DIR)
        .filter(f => f.endsWith('.png'))
        .sort((a, b) => parseInt(a) - parseInt(b))

    console.log(`Generating ${files.length} thumbnails...`)

    for (let i = 0; i < files.length; i++) {
        const inputPath = path.join(IMAGES_DIR, files[i])
        const outputName = files[i].replace('.png', '.webp')
        const outputPath = path.join(THUMBS_DIR, outputName)

        if (fs.existsSync(outputPath)) continue

        try {
            await sharp(inputPath)
                .resize(200, undefined, { fit: 'cover', withoutEnlargement: true })
                .webp({ quality: 75 })
                .toFile(outputPath)
        } catch (err) {
            console.log(`Skipping ${files[i]} (corrupt): ${err.message}`)
            continue
        }

        if ((i + 1) % 500 === 0) {
            console.log(`Progress: ${i + 1}/${files.length}`)
        }
    }

    const totalSize = fs.readdirSync(THUMBS_DIR)
        .reduce((sum, f) => sum + fs.statSync(path.join(THUMBS_DIR, f)).size, 0)

    console.log(`Done! Generated ${files.length} thumbnails`)
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`)
    console.log(`Avg: ${(totalSize / files.length / 1024).toFixed(1)} KB each`)
}

main().catch(console.error)
