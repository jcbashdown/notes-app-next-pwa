import db from '@/lib/rxdb/database'

import { NoteDocType } from '@/lib/rxdb/types/noteTypes'

const fetchNotes = async (): Promise<NoteDocType[]> => {
    //TODO - use a decorator to await?
    const dbInstance = await db
    const docs = await dbInstance['notes'].find().exec()
    return docs.map((doc) => doc.toJSON()) as NoteDocType[]
}

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

export const noteService = {
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
}
