////using transparent memoization rather than something fancy or a dynamic selector
////rates are calculated and stored on term, mileage and initialRentalChanges
//import { makeStore, AppStore } from '@/lib/redux/store'
//import { configureOrderSlice, RateCalculation, selectCalculatedRate } from '@/lib/redux/store'
//import cars from '@/data/cars.json'
//import rates from '@/data/rates.json'
//
//let store: AppStore
//
//beforeEach(() => {
//    //setup the store
//    store = makeStore()
//    store.dispatch(configureOrderSlice.actions.setCars(cars))
//    store.dispatch(configureOrderSlice.actions.setRates(rates))
//})
//
//describe('store', () => {
//    it('should recalculate rates from inital selection', () => {
//        store.dispatch(configureOrderSlice.actions.setCar('polestar-2'))
//        const rate: RateCalculation | null = selectCalculatedRate(store.getState())
//        //default value for initialRental is 9
//        //default value for term is 36
//        //int and floor because that's how the tax man does it.
//        expect(rate?.monthlyRentalRate).toEqual(369) //(rental * lengthOfContract) / (lengthOfContract + initialRental - 1)
//        expect(rate?.initialRentalRate).toEqual(3328) //floor of monthly float * initialRental period in months
//    })
//    it('should recalculate rates from changes in the selection', () => {
//        store.dispatch(configureOrderSlice.actions.setCar('tesla-model-y'))
//        let rate: RateCalculation | null = selectCalculatedRate(store.getState())
//        expect(rate?.monthlyRentalRate).toEqual(481)
//        expect(rate?.initialRentalRate).toEqual(4337)
//        store.dispatch(configureOrderSlice.actions.setMileage(15000))
//        rate = selectCalculatedRate(store.getState())
//        expect(rate?.monthlyRentalRate).toEqual(460)
//        expect(rate?.initialRentalRate).toEqual(4145)
//        store.dispatch(configureOrderSlice.actions.setTerm(48))
//        rate = selectCalculatedRate(store.getState())
//        expect(rate?.monthlyRentalRate).toEqual(456)
//        expect(rate?.initialRentalRate).toEqual(4104)
//        store.dispatch(configureOrderSlice.actions.setInitialRental(1))
//        rate = selectCalculatedRate(store.getState())
//        expect(rate?.monthlyRentalRate).toEqual(532)
//        expect(rate?.initialRentalRate).toEqual(532)
//    })
//})
// @ts-ignore
test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3)
})
