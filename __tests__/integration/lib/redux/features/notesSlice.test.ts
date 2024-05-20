import { removeRxDatabase } from 'rxdb'
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory'
import { makeStore, AppStore } from '@/lib/redux/store'
import { fetchNotesFromRxDB, updateNoteText, addEmptyNote } from '@/lib/redux/features/noteSlice'
import notesFixture from '@/fixtures/notes'
import { selectNotesById } from '@/lib/redux/features/noteSlice'

import { NoteRelationTypeEnum } from '@/lib/rxdb/types/noteTypes'

describe('addEmptyNote reducer', () => {
    let store: AppStore

    beforeAll(async () => {
        store = await makeStore()
        store.dispatch(fetchNotesFromRxDB())
    })

    it('updates the redux store correctly when adding a new note', async () => {
        const parentId = notesFixture[notesFixture.length - 1].id
        const originalNotesById = selectNotesById(store.getState())
        console.log(originalNotesById)
        expect(originalNotesById[parentId].children).toEqual([])
        store.dispatch(addEmptyNote(parentId))
        const notesById = selectNotesById(store.getState())
        console.log(notesById)
        expect(notesById[parentId].children.length).toBe(1)
        const emptyNote = notesById[parentId].children[0]
        expect(notesById[emptyNote.id]).toBeDefined()
        expect(notesById[emptyNote.id].parents).toEqual([
            { id: parentId, relationshipType: NoteRelationTypeEnum.RELATED },
        ])
        expect(notesById[emptyNote.id].text).toBe('')
    })
})

describe('updateNoteText reducer', () => {
    //let store: AppStore

    //beforeAll(async () => {
    ////removeRxDatabase('notes-app-db', getRxStorageDexie())
    //store = await makeStore()
    //})

    //beforeEach(async () => {
    ////Sync the store with rxdb
    //store.dispatch(fetchNotesFromRxDB())
    //})

    xit('updates the redux store correctly when adding a new note', async () => {
        // Arrange
        const parentNoteId = 'parentNote1'
        store.dispatch(addEmptyNote())

        // Act
        await store.dispatch(updateNoteText(`+ Child of ${parentNoteId}`))

        // Assert
        //const updatedNote = store.getState().notes.notesById[noteId!]
        //expect(updatedNote.text).toBe(`Child of ${parentNoteId}`)
        //expect(updatedNote.parents).toEqual([{ id: parentNoteId, relationshipType: NoteRelationTypeEnum.SUPPORTS }])

        //const parentNote = store.getState().notes.notesById[parentNoteId]
        //expect(parentNote.children).toEqual([{ id: noteId, relationshipType: NoteRelationTypeEnum.SUPPORTS }])
    })

    xit('updates rxdb to match redux store after adding a note', async () => {
        // Arrange
        //const parentNoteId = 'parentNote2'
        //await db.notes.insert({ id: parentNoteId, text: 'Parent Note 2', topic: false, children: [], parents: [] })
        //store.dispatch(addEmptyNote())
        //const noteId = Object.keys(store.getState().notes.notesById).find((id) => id !== parentNoteId)
        //// Act
        //await store.dispatch(updateNoteText(`- Child of ${parentNoteId}`))
        //// Assert
        //const rxParentNote = await db.notes.findOne(parentNoteId).exec()
        //expect(rxParentNote!.children).toEqual([{ id: noteId, relationshipType: NoteRelationTypeEnum.OPPOSES }])
        //const rxChildNote = await db.notes.findOne(noteId!).exec()
        //expect(rxChildNote!.text).toBe(`Child of ${parentNoteId}`)
        //expect(rxChildNote!.parents).toEqual([{ id: parentNoteId, relationshipType: NoteRelationTypeEnum.OPPOSES }])
    })
})
