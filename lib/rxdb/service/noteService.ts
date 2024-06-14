import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import initializeDB, { NoteDocument } from '@/lib/rxdb/database'

import { NoteDocType } from '@/lib/rxdb/types/noteTypes'

//READ
//TODO - use a decorator to await?
const fetchNotes = async (): Promise<NoteDocument[]> => {
    const dbInstance = await initializeDB()
    return await dbInstance.notes.find().exec()
}
const fetchNoteTopics = async (): Promise<NoteDocument[]> => {
    const dbInstance = await initializeDB()
    return await dbInstance.notes.find().where('topic').eq(true).exec()
}

const fetchNote = async (id: string): Promise<NoteDocument | null> => {
    const dbInstance = await initializeDB()
    return await dbInstance.notes.findOne().where('id').eq(id).exec()
}

const fetchNotesAsJson = async (): Promise<DeepReadonlyObject<NoteDocType[]>> => {
    const fetchNotesQueryResult = await fetchNotes()
    return fetchNotesQueryResult.map((note) => note.toJSON())
}

const fetchNoteTopicsAsJson = async (): Promise<DeepReadonlyObject<NoteDocType[]>> => {
    const fetchNoteTopicsQueryResult = await fetchNoteTopics()
    return fetchNoteTopicsQueryResult.map((note) => note.toJSON())
}

const fetchNoteAsJson = async (id: string): Promise<DeepReadonlyObject<NoteDocType> | null> => {
    const note = await fetchNote(id)
    return note?.toJSON() || null
}

const noteById = async (id: string): Promise<NoteDocType | null> => {
    return await fetchNoteAsJson(id)
}

//CREATE
const addNote = async (doc: NoteDocType): Promise<NoteDocType> => {
    const dbInstance = await initializeDB()
    await dbInstance.notes.insert(doc)
    return doc
}

const bulkInsertNotes = async (notes: NoteDocType[]): Promise<void> => {
    const dbInstance = await initializeDB()
    await dbInstance.notes.bulkInsert(notes)
}

//UPDATE
const updateNote = async (docId: string, changes: Partial<NoteDocType>): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.notes.findOne().where('id').eq(docId).exec()
    if (doc) {
        await doc.update({
            $set: changes,
        })
    }
}

//DESTROY
const deleteNote = async (docId: string): Promise<void> => {
    const dbInstance = await initializeDB()
    const doc = await dbInstance.notes.findOne().where('id').eq(docId).exec()
    if (doc) {
        await doc.remove()
    }
}

const noteService = {
    fetchNote,
    fetchNoteAsJson,
    fetchNotes,
    fetchNotesAsJson,
    fetchNoteTopics,
    fetchNoteTopicsAsJson,
    noteById,
    addNote,
    updateNote,
    deleteNote,
    bulkInsertNotes,
}
export default noteService
