'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/redux/store'
import { fetchNotesFromRxDB } from '@/lib/redux/features/noteSlice'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null)
    useEffect(() => {
        console.log('StoreProvider mounted')

        return () => {
            console.log('StoreProvider unmounted')
        }
    }, [])

    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
        //sync the store with rxdb
        //TODO - fix expected args error
        storeRef.current.dispatch(fetchNotesFromRxDB())
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
