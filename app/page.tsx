'use client'
import dynamic from 'next/dynamic'

const NoteTopics = dynamic(() => import('@/components/NoteTopics'), {
    loading: () => {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>
            </div>
        )
    },
    ssr: false,
})

const StoreProvider = dynamic(() => import('@/app/StoreProvider'), {
    loading: () => {
        return (
            <>
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Add a new note..."
                        disabled
                    />
                </div>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>
                    </div>
                </div>
            </>
        )
    },
    ssr: false,
})
export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <StoreProvider>
                    {/* Input Section */}
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Add a new note..."
                        />
                    </div>
                    {/* Notes List */}
                    <div className="space-y-4">
                        <NoteTopics />
                    </div>
                </StoreProvider>
            </div>
        </div>
    )
}
