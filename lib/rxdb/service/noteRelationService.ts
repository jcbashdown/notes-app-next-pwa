import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import initializeDB, { NoteRelationDocument } from '@/lib/rxdb/database'

import { NoteRelationDocType } from '@/lib/rxdb/types/noteTypes'

//TODO - use a decorator to await?
const fetchNoteRelations = async (): Promise<NoteRelationDocument[]> => {
    const dbInstance = await initializeDB()
    return await dbInstance.note_relations.find().exec()
}

const fetchNoteRelation = async (id: string): Promise<NoteRelationDocument | null> => {
    const dbInstance = await initializeDB()
    return await dbInstance.note_relations.findOne().where('id').eq(id).exec()
}

const fetchNoteRelationsAsJson = async (): Promise<DeepReadonlyObject<NoteRelationDocType[]>> => {
    const fetchNoteRelationsQueryResult = await fetchNoteRelations()
    return fetchNoteRelationsQueryResult.map((noteRelation) => {
        return noteRelation.toJSON()
    })
}

const fetchNoteRelationAsJson = async (id: string): Promise<DeepReadonlyObject<NoteRelationDocType> | null> => {
    const noteRelation = await fetchNoteRelation(id)
    return noteRelation?.toJSON() || null
}

const addNoteRelation = async (doc: NoteRelationDocType): Promise<NoteRelationDocType> => {
    const dbInstance = await initializeDB()
    await dbInstance.note_relations.insert(doc)
    return doc
}

const updateNoteRelation = async (docId: string, changes: Partial<NoteRelationDocType>): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.note_relations.findOne().where('id').eq(docId).exec()
    if (doc) {
        await doc.update({
            $set: changes,
        })
    }
}

const deleteNoteRelation = async (docId: string): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.note_relations.findOne().where('id').eq(docId).exec()
    if (doc) {
        await doc.remove()
    }
}

const bulkInsertNoteRelations = async (noteRelations: NoteRelationDocType[]): Promise<void> => {
    const dbInstance = await initializeDB()
    await dbInstance.note_relations.bulkInsert(noteRelations)
}

const noteRelationService = {
    fetchNoteRelation,
    fetchNoteRelationAsJson,
    fetchNoteRelations,
    fetchNoteRelationsAsJson,
    addNoteRelation,
    updateNoteRelation,
    deleteNoteRelation,
    bulkInsertNoteRelations,
}
export default noteRelationService
