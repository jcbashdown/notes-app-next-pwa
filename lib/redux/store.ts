import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { noteSlice } from '@/lib/redux/features/noteSlice'

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(noteSlice)

// `makeStore` encapsulates the store configuration to allow
// creating unique store instances, which is particularly important for
// server-side rendering (SSR) scenarios. In SSR, separate store instances
// are needed for each request to prevent cross-request state pollution.
export const makeStore = () => {
    return configureStore({
        reducer: rootReducer,
    })
}

// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>
// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch']
