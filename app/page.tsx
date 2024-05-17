'use client'
import dynamic from 'next/dynamic'

const NoteTopics = dynamic(() => import('@/components/NoteTopics'), {
    ssr: false,
})
export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <div className="w-full max-w-3xl">
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
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800">Note 2</h2>
                        <p className="text-gray-600">This is the second note with some more content.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800">Note 3</h2>
                        <p className="text-gray-600">This is the third note.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
