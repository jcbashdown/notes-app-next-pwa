import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import initializeDB, { NoteDocument } from '@/lib/rxdb/database'

import { NoteDocType } from '@/lib/rxdb/types/noteTypes'

//READ
//TODO - use a decorator to await?
const rxdbFetchNotes = async (): Promise<NoteDocument[]> => {
    const dbInstance = await initializeDB()
    return await dbInstance.notes.find().exec()
}
const rxdbFetchNoteTopics = async (): Promise<NoteDocument[]> => {
    const dbInstance = await initializeDB()
    return await dbInstance.notes.find().where('topic').eq(true).exec()
}

const rxdbFetchNote = async (id: string): Promise<NoteDocument | null> => {
    const dbInstance = await initializeDB()
    return await dbInstance.notes.findOne().where('id').eq(id).exec()
}

const rxdbFetchNotesAsJson = async (): Promise<DeepReadonlyObject<NoteDocType[]>> => {
    const fetchNotesQueryResult = await rxdbFetchNotes()
    return fetchNotesQueryResult.map((note) => note.toJSON())
}

const rxdbFetchNoteTopicsAsJson = async (): Promise<DeepReadonlyObject<NoteDocType[]>> => {
    const fetchNoteTopicsQueryResult = await rxdbFetchNoteTopics()
    return fetchNoteTopicsQueryResult.map((note) => note.toJSON())
}

const rxdbFetchNoteAsJson = async (id: string): Promise<DeepReadonlyObject<NoteDocType> | null> => {
    const note = await rxdbFetchNote(id)
    return note?.toJSON() || null
}

const rxdbNoteById = async (id: string): Promise<NoteDocType | null> => {
    return await rxdbFetchNoteAsJson(id)
}

//CREATE
const rxdbAddNote = async (doc: NoteDocType): Promise<NoteDocType> => {
    const dbInstance = await initializeDB()
    await dbInstance.notes.insert(doc)
    return doc
}

const rxdbBulkInsertNotes = async (notes: NoteDocType[]): Promise<void> => {
    const dbInstance = await initializeDB()
    await dbInstance.notes.bulkInsert(notes)
}

//UPDATE
const rxdbUpdateNote = async (docId: string, changes: Partial<NoteDocType>): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.notes.findOne(docId).exec()
    if (doc) {
        await doc.patch(changes)
    }
}
const rxdbInsertOrUpdateNote = async (note: Partial<NoteDocType>): Promise<void> => {
    const dbInstance = await initializeDB()
    await dbInstance.notes.upsert(note)
}

//DESTROY
const rxdbDeleteNote = async (docId: string): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.notes.findOne().where('id').eq(docId).exec()
    if (doc) {
        await doc.remove()
    }
}

const noteService = {
    rxdbFetchNote,
    rxdbFetchNoteAsJson,
    rxdbFetchNotes,
    rxdbFetchNotesAsJson,
    rxdbFetchNoteTopics,
    rxdbFetchNoteTopicsAsJson,
    rxdbNoteById,
    rxdbAddNote,
    rxdbUpdateNote,
    rxdbInsertOrUpdateNote,
    rxdbDeleteNote,
    rxdbBulkInsertNotes,
}
export default noteService
