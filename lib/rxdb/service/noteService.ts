import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import initializeDB, { NoteDocument } from '@/lib/rxdb/database'

import { NoteDocType } from '@/lib/rxdb/types/noteTypes'

const db = initializeDB()

//TODO - use a decorator to await?
const fetchNotes = async (): Promise<NoteDocument[]> => {
    const dbInstance = await db
    return await dbInstance.notes.find().exec()
}

const fetchNotesAsJson = async (): Promise<DeepReadonlyObject<NoteDocType[]>> => {
    const fetchNotesQueryResult = await fetchNotes()
    return fetchNotesQueryResult.map((note) => note.toJSON())
}
//TODO - rest of file

const addNote = async (doc: NoteDocType): Promise<void> => {
    const dbInstance = await db
    await dbInstance.notes.insert(doc)
}

const updateNote = async (docId: string, changes: Partial<NoteDocType>): Promise<void> => {
    const dbInstance = await db
    const doc = await dbInstance.notes.findOne().where('id').eq(docId).exec()
    if (doc) {
        await doc.update({
            $set: changes,
        })
    }
}

const deleteNote = async (docId: string): Promise<void> => {
    const dbInstance = await db
    const doc = await dbInstance.notes.findOne().where('id').eq(docId).exec()
    if (doc) {
        await doc.remove()
    }
}

const noteService = {
    fetchNotes,
    fetchNotesAsJson,
    addNote,
    updateNote,
    deleteNote,
}
export default noteService
