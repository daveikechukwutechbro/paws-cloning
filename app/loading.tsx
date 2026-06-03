export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
            <img
                src="https://i.imgur.com/MJZKj03.png"
                alt="PAWS"
                className="w-24 h-24 object-contain animate-pulse"
            />
            <div className="mt-6 text-white text-2xl font-bold tracking-wider">PAWS</div>
            <div className="mt-2 text-gray-500 text-sm">Loading...</div>
        </div>
    )
}
