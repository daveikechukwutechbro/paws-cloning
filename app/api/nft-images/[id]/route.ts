// app/api/nft-images/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const IMAGES_DIR = path.join(process.cwd(), 'public', 'nfts', 'images')

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params
    const size = request.nextUrl.searchParams.get('size') || 'thumb'

    const imagePath = path.join(IMAGES_DIR, `${id}.png`)

    if (!fs.existsSync(imagePath)) {
        return new NextResponse('Not Found', { status: 404 })
    }

    const targetWidth = size === 'full' ? 640 : 200

    try {
        const buffer = await sharp(imagePath)
            .resize(targetWidth, undefined, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: size === 'full' ? 80 : 70 })
            .toBuffer()

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=86400, immutable',
            },
        })
    } catch {
        return new NextResponse('Error processing image', { status: 500 })
    }
}
