import { type PayloadAction } from '@reduxjs/toolkit'
import { DeepReadonlyObject } from 'event-reduce-js/dist/lib/types'
import { createAppSlice } from '@/lib/redux/createAppSlice'
import { NoteDocType } from '@/lib/rxdb/types/noteTypes'
import noteService from '@/lib/rxdb/service/noteService'

const { fetchNotesAsJson } = noteService

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
                    state.notes = action.payload as NoteDocType[]
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
