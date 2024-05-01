'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/redux/store'
import { Car, Rate, configureOrderSlice } from '@/lib/redux/store'

export default function StoreProvider({
    children,
    cars,
    rates,
    car,
}: {
    children: React.ReactNode
    cars: Car[]
    rates: Rate[]
    car: string
}) {
    const storeRef = useRef<AppStore>()
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
        storeRef.current.dispatch(configureOrderSlice.actions.setCars(cars))
        storeRef.current.dispatch(configureOrderSlice.actions.setRates(rates))
        storeRef.current.dispatch(configureOrderSlice.actions.setCar(car))
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
