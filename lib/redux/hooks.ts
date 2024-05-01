import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, AppStore, RootState } from './store'

//Docs say do this from 9.1.0 but it's not working for me - don't have enough time to look into this now.
// Use throughout your app instead of plain `useDispatch` and `useSelector`
//export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
//export const useAppSelector = useSelector.withTypes<RootState>()
//export const useAppStore = useStore.withTypes<AppStore>()
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore as () => AppStore
