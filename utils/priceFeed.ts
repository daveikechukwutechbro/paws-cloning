export async function getPawsPrice(): Promise<number | null> {
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=paws&vs_currencies=usd'
        )
        const data = await res.json()
        return data?.paws?.usd ?? null
    } catch {
        return null
    }
}

export function formatPawsPrice(price: number): string {
    if (price < 0.0001) {
        const decimals = Math.ceil(Math.abs(Math.log10(price))) + 4
        return '$' + price.toFixed(decimals)
    }
    return '$' + price.toFixed(4)
}
