import { useCallback, useRef, useEffect } from 'react'
import { AppDispatch } from '@/lib/redux/store' // Adjust the import according to your store setup

interface ActionFnArgs {
    fn: any
    args: any[]
}

let actionQueue: ActionFnArgs[] = [] // Shared queue across all components
let permQueue: ActionFnArgs[] = [] // Shared queue across all components
let isProcessing = false

const useOrderedDispatch = (dispatch: AppDispatch) => {
    const processQueue = useCallback(async () => {
        if (isProcessing) return
        isProcessing = true
        while (actionQueue.length > 0) {
            const { fn, args } = actionQueue.shift()!
            console.log(fn, args)
            console.log(permQueue)
            if (args.length) {
                await dispatch(fn(...args)).unwrap()
            } else {
                await dispatch(fn()).unwrap()
            }
        }
        isProcessing = false
    }, [dispatch])

    useEffect(() => {
        processQueue()
    }, [processQueue])

    const addToQueue = useCallback(
        (fn: any, args: any[]) => {
            actionQueue.push({ fn, args })
            permQueue.push({ fn, args })
            processQueue()
        },
        [processQueue]
    )

    return addToQueue
}

export default useOrderedDispatch
