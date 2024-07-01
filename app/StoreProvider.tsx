'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/redux/store'
import { initFromRxDB, initFromFixture, setNoteTopic, setCursorPosition } from '@/lib/redux/features/noteSlice'

export default function StoreProvider({ children, fixture = null }: { children: React.ReactNode; fixture: any }) {
    const storeRef = useRef<AppStore | null>(null)

    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
        //sync the store with rxdb
        if (fixture) {
            storeRef.current
                .dispatch(initFromFixture(fixture))
                .unwrap()
                .then((initializationData) => {
                    const { noteTopics } = initializationData
                    //TODO - remove this in future - user must select manually. Using
                    //it now so we don't have to implement selection yet
                    //if (noteTopics.length > 0) {
                    //storeRef.current!.dispatch(setNoteTopic(noteTopics[0].id))
                    //}
                })
        } else {
            storeRef.current
                .dispatch(initFromRxDB())
                .unwrap()
                .then((initializationData) => {
                    const { noteTopics } = initializationData
                    //TODO - remove this in future - user must select manually. Using
                    //it now so we don't have to implement selection yet
                    //if (noteTopics.length > 0) {
                    //storeRef.current!.dispatch(setNoteTopic(noteTopics[0].id))
                    //}
                })
        }
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
