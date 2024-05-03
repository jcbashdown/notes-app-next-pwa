'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/redux/store'
import { fetchNotesFromRxDB } from '@/lib/redux/features/noteSlice'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>()
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
        storeRef.current.dispatch(fetchNotesFromRxDB)
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
