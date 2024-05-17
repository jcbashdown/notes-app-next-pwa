// Note.tsx
import { useAppSelector } from '@/lib/redux/hooks'
import { selectNote } from '@/lib/redux/features/noteSlice'
import NoteList from '@/components/NotesList'

interface NoteProps {
    noteId: string
    children: React.ReactNode
}

const Note: React.FC<NoteProps> = ({ noteId, children }) => {
    //TODO - understand why I don't need to specify the type of state even in
    //strict mode
    const note = useAppSelector((state) => selectNote(state, noteId))
    return (
        <li>
            <span className="p-1">
                {children}
                <input type="text" value={note.text} className="pl-1" />
            </span>
            <NoteList notes={note.children} />
        </li>
    )
}

export default Note
