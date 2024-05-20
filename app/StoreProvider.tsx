'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/redux/store'
import { initFromRxDB, setNoteTopic } from '@/lib/redux/features/noteSlice'

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
        storeRef.current
            .dispatch(initFromRxDB())
            .unwrap()
            .then((initializationData) => {
                const { noteTopics } = initializationData
                //TODO - remove this in future - user must select manually. Using
                //it now so we don't have to implement selection yet
                storeRef.current!.dispatch(setNoteTopic(noteTopics[0].id))
            })
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
