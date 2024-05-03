import { type PayloadAction } from '@reduxjs/toolkit'
import { createAppSlice } from '@/lib/redux/createAppSlice'
import { NoteDocType } from '@/lib/rxdb/types/noteTypes'
import db from '@/lib/rxdb/database'

export type ConfigureOrderState = {
    notes: NoteDocType[]
    status: 'idle' | 'loading' | 'failed'
}

const initialState: ConfigureOrderState = {
    notes: [],
    status: 'idle',
}

export const noteSlice = createAppSlice({
    name: 'noteSlice',
    initialState,
    reducers: (create) => ({
        fetchNotesFromRxDB: create.asyncThunk(
            async () => {
                const dbInstance = await db
                const notes = await dbInstance.notes.find().exec()
                return notes
            },
            {
                pending: (state) => {
                    state.status = 'loading'
                },
                fulfilled: (state, action: PayloadAction<NoteDocType[]>) => {
                    state.status = 'idle'
                    state.notes = action.payload
                },
                rejected: (state) => {
                    state.status = 'failed'
                },
            }
        ),
    }),
    selectors: {
        selectNotes: (state) => state.notes,
        selectStatus: (state) => state.status,
    },
})

export const { fetchNotesFromRxDB } = noteSlice.actions
export const { selectNotes, selectStatus } = noteSlice.selectors
