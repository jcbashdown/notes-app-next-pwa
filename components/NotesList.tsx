// NotesList.tsx
import Note from '@/components/Note'
import NoteRelation from '@/components/NoteRelation'
import { NoteRelationDocType, NoteDocType } from '@/lib/rxdb/types/noteTypes'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectNote, selectNoteChildren } from '@/lib/redux/features/noteSlice'

interface NoteListProps {
    noteId: string
}

const NotesList: React.FC<NoteListProps> = ({ noteId }) => {
    const note: NoteDocType = useAppSelector((state) => selectNote(state, noteId))
    const noteChildren: NoteRelationDocType[] = useAppSelector((state) => selectNoteChildren(state, noteId)) || []
    let previousNoteId = noteId
    return (
        <ul className="ml-2">
            {noteChildren.map((childNoteRelation: NoteRelationDocType) => {
                const elements = (
                    <li key={childNoteRelation.childId}>
                        <span className="p-1">
                            <NoteRelation
                                key={childNoteRelation.childId + '_rel'}
                                parentNoteId={note.id}
                                noteId={childNoteRelation.childId}
                                relationshipType={childNoteRelation.relationshipType}
                                previousNoteId={previousNoteId}
                            />
                            <Note
                                key={childNoteRelation.childId + '_note'}
                                parentNoteId={note.id}
                                noteId={childNoteRelation.childId}
                                relationshipType={childNoteRelation.relationshipType}
                                previousNoteId={previousNoteId}
                            />
                        </span>
                        <NotesList key={childNoteRelation.childId} noteId={childNoteRelation.childId} />
                    </li>
                )
                //TODO - previoud input should actually be the last element of
                //the children of the note used for the most recent list.
                //otherwise it should be the last note.
                //This is getting too complex - TODO. Within the context of a
                //topic, we need a way to determine the previous sibling -
                //e.g. traverse the tree
                //
                //Other TODO - clean history. Get to reasonable pause point.
                //Summarise TODOs and push
                previousNoteId = childNoteRelation.childId
                return elements
            })}
        </ul>
    )
}

export default NotesList
