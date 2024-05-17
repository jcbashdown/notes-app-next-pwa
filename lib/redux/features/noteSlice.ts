import { type PayloadAction } from '@reduxjs/toolkit'
import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import { createAppSlice } from '@/lib/redux/createAppSlice'
import { NoteDocType } from '@/lib/rxdb/types/noteTypes'
import noteService from '@/lib/rxdb/service/noteService'

const { fetchNotesAsJson, fetchNoteTopicsAsJson, fetchNoteAsJson } = noteService

interface IdNoteMap {
    [id: string]: NoteDocType
}

export type ConfigureOrderState = {
    notes: NoteDocType[]
    notesById: IdNoteMap
    noteTopics: NoteDocType[]
    currentNoteTopic: NoteDocType | null
    status: 'idle' | 'loading' | 'failed'
}

const initialState: ConfigureOrderState = {
    notes: [],
    notesById: {},
    noteTopics: [],
    currentNoteTopic: null,
    status: 'idle',
}

export const noteSlice = createAppSlice({
    name: 'noteSlice',
    initialState,
    reducers: (create) => ({
        fetchNotesFromRxDB: create.asyncThunk<readonly DeepReadonlyObject<NoteDocType>[]>(
            async () => {
                const notes = await fetchNotesAsJson()
                return notes
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<readonly DeepReadonlyObject<NoteDocType>[]>) => {
                    state.status = 'idle'
                    const notes = action.payload as NoteDocType[]
                    state.notes = notes
                    state.notesById = notes.reduce<IdNoteMap>((memo, note) => {
                        memo[note.id] = note
                        return memo
                    }, {})
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
        fetchNoteTopicsFromRxDB: create.asyncThunk<readonly DeepReadonlyObject<NoteDocType>[]>(
            async () => {
                const noteTopics = await fetchNoteTopicsAsJson()
                return noteTopics
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<readonly DeepReadonlyObject<NoteDocType>[]>) => {
                    state.status = 'idle'
                    state.noteTopics = action.payload as NoteDocType[]
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
    }),
    selectors: {
        selectNote: (state, id: string) => state.notesById[id],
        selectNotes: (state) => state.notes,
        selectNoteTopics: (state) => state.noteTopics,
        selectStatus: (state) => state.status,
    },
})

export const { fetchNotesFromRxDB, fetchNoteTopicsFromRxDB } = noteSlice.actions
export const { selectNotes, selectStatus, selectNoteTopics, selectNote } = noteSlice.selectors
