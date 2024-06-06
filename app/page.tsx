'use client'
import dynamic from 'next/dynamic'

const StaticTopics = (
    <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>
    </div>
)
const NoteTopics = dynamic(() => import('@/components/NoteTopics'), {
    loading: () => {
        return StaticTopics
    },
    ssr: false,
})
const StaticMenu = (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex">
        <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Add a new note..."
            disabled
        />
        <button
            className="ml-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="menuButton"
            disabled
        >
            <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
    </div>
)
const Menu = dynamic(() => import('@/components/Menu'), {
    loading: () => {
        return StaticMenu
    },
    ssr: false,
})

const StoreProvider = dynamic(() => import('@/app/StoreProvider'), {
    loading: () => {
        return (
            <>
                {StaticMenu}
                {StaticTopics}
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
                    {/* Menu Section */}
                    <Menu />
                    {/* Notes List */}
                    <div className="space-y-4">
                        <NoteTopics />
                    </div>
                </StoreProvider>
            </div>
        </div>
    )
}
