// NotesList.tsx
import Note from '@/components/Note'
import { NoteRelationDocType } from '@/lib/rxdb/types/noteTypes'

interface NoteListProps {
    notes: NoteRelationDocType[]
}

const NotesList: React.FC<NoteListProps> = ({ notes }) => {
    return (
        <ul className="ml-2">
            {notes.map((note: NoteRelationDocType) => {
                return (
                    <Note key={note.id} noteId={note.id}>
                        <span>{note.relationshipType || '•'}</span>
                    </Note>
                )
            })}
        </ul>
    )
}

export default NotesList
