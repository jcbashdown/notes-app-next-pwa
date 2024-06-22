import noteRelationService from '@/lib/rxdb/service/noteRelationService'
import noteService from '@/lib/rxdb/service/noteService'
const { rxdbChildrenByParentId } = noteRelationService
const { rxdbFetchNotesAsJson } = noteService

export default async function generateNotesJSONFromStoreState() {
    const notes = await rxdbFetchNotesAsJson()
    return JSON.stringify(
        notes.map(async (note) => {
            const noteChildren = (await rxdbChildrenByParentId(note.id)) || []
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
