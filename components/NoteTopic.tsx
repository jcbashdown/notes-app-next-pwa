// NoteTopic.tsx
import { NoteDocType } from '@/lib/rxdb/types/noteTypes'
import NotesList from '@/components/NotesList'

interface NoteTopicProps {
    noteTopic: NoteDocType
}

export default function NoteTopic({ noteTopic }: NoteTopicProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800">{noteTopic.text}</h2>
            <NotesList notes={noteTopic.children} />
        </div>
    )
}
