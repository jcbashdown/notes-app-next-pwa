import { createSlice, type PayloadAction, configureStore } from '@reduxjs/toolkit'
import { NoteDocType, NoteRelationDocType, NoteRelationTypeEnum } from '@/lib/rxdb/types/noteTypes'

export type ConfigureOrderState = {
    notes: NoteDocType[]
}
const initialState: ConfigureOrderState = {
    notes: [],
}

export const noteSlice = createSlice({
    name: 'noteSlice',
    initialState,
    reducers: {
        //setCars: (state, action: PayloadAction<Car[]>) => {
        ////traditional
        ////return {
        ////...state,
        ////cars: action.payload,
        ////}
        //// Redux Toolkit allows us to write "mutating" logic in reducers. It
        //// doesn't actually mutate the state because it uses the Immer library,
        //// which detects changes to a "draft state" and produces a brand new
        //// immutable state based off those changes
        //state.cars = action.payload
        //},
        //setRates: (state, action: PayloadAction<Rate[]>) => {
        //state.rates = action.payload
        //},
        ////We could potentially have a separate slice for UI
        //setCar: (state, action: PayloadAction<string>) => {
        ////find the matching object by slug in the array of cars
        //state.ui.car = state.cars.find((car) => car.slug === action.payload) || null
        //state.calculatedRate = calculateRate(state)
        //},
        //setMileage: (state, action: PayloadAction<number>) => {
        //state.ui.contractSelection.mileage = action.payload
        //state.calculatedRate = calculateRate(state)
        //},
        //setTerm: (state, action: PayloadAction<number>) => {
        //state.ui.contractSelection.term = action.payload
        //state.calculatedRate = calculateRate(state)
        //},
        //setInitialRental: (state, action: PayloadAction<number>) => {
        //state.ui.contractSelection.initialRental = action.payload
        //state.calculatedRate = calculateRate(state)
        //},
    },
})

//export const selectCar = (state: ConfigureOrderState) => state.ui.car
//export const selectContractSelection = (state: ConfigureOrderState) => state.ui.contractSelection
//export const selectCalculatedRate = (state: ConfigureOrderState) => state.calculatedRate

export const makeStore = () => {
    return configureStore({
        reducer: noteSlice.reducer,
    })
}
