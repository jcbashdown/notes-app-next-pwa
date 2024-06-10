import { IdNoteRelationsMap } from '@/lib/redux/features/noteSlice'
import { NoteDocType } from '@/lib/rxdb/types/noteTypes'

export default function generateNotesJSONFromStoreState(
    notes: NoteDocType[],
    noteChildrenByParentId: IdNoteRelationsMap
) {
    return JSON.stringify(
        notes.map((note) => {
            const noteChildren = noteChildrenByParentId[note.id] || []
            return {
                ...note,
                children: noteChildren.map((childNoteRelation) => {
                    return {
                        id: childNoteRelation.childId,
                        relationshipType: childNoteRelation.relationshipType,
                        order: childNoteRelation.order,
                    }
                }),
            }
        }),
        null,
        4
    )
}
