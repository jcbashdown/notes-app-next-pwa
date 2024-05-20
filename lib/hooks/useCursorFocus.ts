import { useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import {
    setCursorPosition,
    selectCursorPosition,
    setCursorSelection,
    selectCursorSelection,
    selectRenderOrder,
} from '@/lib/redux/features/noteSlice'

type focusProps = {
    elementIdentifier: string
    event: React.FocusEvent<HTMLInputElement>
}

interface UseCursorFocusReturn {
    handleFocus: (focusProps: focusProps) => void
    registerInputRef: (elementIdentifier: string) => (el: HTMLInputElement) => void
    handleSelect: (el: React.FocusEvent<HTMLInputElement>) => void
}

interface inputMap {
    [key: string]: HTMLInputElement
}

export const useCursorFocus = (): UseCursorFocusReturn => {
    const dispatch = useAppDispatch()
    const cursorPosition = useAppSelector(selectCursorPosition)
    const cursorSelection = useAppSelector(selectCursorSelection)
    const renderOrder = useAppSelector(selectRenderOrder)
    const inputRefs = useRef<inputMap>({})

    //Focus if cursor position changed in redux
    useEffect(() => {
        if (cursorPosition !== null) {
            const newElement = renderOrder.indexToId[cursorPosition]
            if (inputRefs.current[newElement]) {
                if (document.activeElement !== inputRefs.current[newElement]) {
                    inputRefs.current[newElement]!.focus()
                }
                if (
                    cursorSelection &&
                    cursorSelection.selectionStart !== null &&
                    cursorSelection.selectionEnd !== null
                ) {
                    inputRefs.current[newElement].setSelectionRange(
                        cursorSelection.selectionStart,
                        cursorSelection.selectionEnd
                    )
                }
            }
        }
    }, [cursorPosition, cursorSelection, renderOrder])

    const handleFocus = ({ elementIdentifier }: focusProps) => {
        const newCursorPosition = renderOrder.idToIndex[elementIdentifier]
        if (cursorPosition !== newCursorPosition) {
            dispatch(setCursorPosition(newCursorPosition))
        }
    }

    const handleSelect = (event: React.FocusEvent<HTMLInputElement>) => {
        const { selectionStart, selectionEnd } = event.target
        dispatch(setCursorSelection({ selectionStart, selectionEnd }))
    }

    const registerInputRef = (elementIdentifier: string) => (el: HTMLInputElement) => {
        inputRefs.current[elementIdentifier] = el
    }

    return { handleFocus, registerInputRef, handleSelect }
}
