export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#4c9ce2] to-[#007aff] flex items-center justify-center animate-pulse">
                <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 15 L55 40 L40 65 L25 40 Z" fill="white"/>
                    <circle cx="40" cy="40" r="8" fill="white" opacity="0.3"/>
                </svg>
            </div>
            <div className="mt-6 text-white text-2xl font-bold tracking-wider">PAWS</div>
            <div className="mt-2 text-gray-500 text-sm">Loading...</div>
        </div>
    )
}
