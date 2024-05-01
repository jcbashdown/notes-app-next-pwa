import { createSlice, type PayloadAction, configureStore } from '@reduxjs/toolkit'

export type Car = {
    id: number
    slug: string
    name: string
    image: string
}

export type Rate = {
    carId: number
    mileage: number
    term: number
    rental: number
}

export type UI = {
    car: Car | null
    contractSelection: {
        mileage: number
        term: number
        initialRental: number
    }
}

export type RateCalculation = {
    initialRentalRate: number
    monthlyRentalRate: number
}

export type ConfigureOrderState = {
    cars: Car[]
    rates: Rate[]
    ui: UI
    calculatedRate: RateCalculation | null
}

const initialState: ConfigureOrderState = {
    cars: [],
    rates: [],
    ui: {
        car: null,
        contractSelection: {
            mileage: 10000,
            term: 36, //years
            initialRental: 9, //months
        },
    },
    calculatedRate: null,
}

const calculateRate = ({ rates, ui: { car, contractSelection } }: ConfigureOrderState): RateCalculation | null => {
    if (!car) return null
    const { term, mileage, initialRental } = contractSelection
    const ratesRentalValue = rates.find((rate) => {
        return rate.carId === car.id && rate.mileage === mileage && rate.term === term
    })?.rental
    if (!ratesRentalValue) return null
    const monthlyRate = (ratesRentalValue * term) / (term + initialRental - 1)
    return {
        initialRentalRate: Math.floor(monthlyRate * initialRental),
        monthlyRentalRate: Math.floor(monthlyRate),
    }
}

export const configureOrderSlice = createSlice({
    name: 'configureOrder',
    initialState,
    reducers: {
        setCars: (state, action: PayloadAction<Car[]>) => {
            //traditional
            //return {
            //...state,
            //cars: action.payload,
            //}
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.cars = action.payload
        },
        setRates: (state, action: PayloadAction<Rate[]>) => {
            state.rates = action.payload
        },
        //We could potentially have a separate slice for UI
        setCar: (state, action: PayloadAction<string>) => {
            //find the matching object by slug in the array of cars
            state.ui.car = state.cars.find((car) => car.slug === action.payload) || null
            state.calculatedRate = calculateRate(state)
        },
        setMileage: (state, action: PayloadAction<number>) => {
            state.ui.contractSelection.mileage = action.payload
            state.calculatedRate = calculateRate(state)
        },
        setTerm: (state, action: PayloadAction<number>) => {
            state.ui.contractSelection.term = action.payload
            state.calculatedRate = calculateRate(state)
        },
        setInitialRental: (state, action: PayloadAction<number>) => {
            state.ui.contractSelection.initialRental = action.payload
            state.calculatedRate = calculateRate(state)
        },
    },
})

export const selectCar = (state: ConfigureOrderState) => state.ui.car
export const selectContractSelection = (state: ConfigureOrderState) => state.ui.contractSelection
export const selectCalculatedRate = (state: ConfigureOrderState) => state.calculatedRate

export const makeStore = () => {
    return configureStore({
        reducer: configureOrderSlice.reducer,
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
