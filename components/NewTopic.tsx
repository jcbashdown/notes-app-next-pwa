'use client'
import { useCursorFocus } from '@/lib/hooks/useCursorFocus'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { calculateActionFromNewTopicInput } from '@/lib/redux/utils/calculateActionFromInput'
import { noteSlice, selectNewTopicText, setNewTopicText } from '@/lib/redux/features/noteSlice'
import { adjustWhitespace } from '@/lib/helpers/textHelpers'

export default function NewTopic() {
    const { handleFocus, registerInputRef, handleSelect } = useCursorFocus()
    const newTopicText = useAppSelector(selectNewTopicText)

    const dispatch = useAppDispatch()

    const handleKeyDown = (e: React.KeyboardEvent) => {
        //DRY up with Note
        const target = e.target as HTMLInputElement
        const { selectionStart, selectionEnd } = target
        const newText = target.value.trim()
        const key = e.key
        if (['Enter', 'ArrowDown'].includes(key)) {
            e.preventDefault()
        } else if (!['ArrowRight'].includes(key)) {
            return
        }
        const actionFunctions = calculateActionFromNewTopicInput(
            key,
            newText,
            { selectionStart, selectionEnd },
            noteSlice
        )
        for (const fnMap of actionFunctions) {
            if (fnMap.args.length) {
                dispatch(fnMap.fn(...fnMap.args))
            } else {
                dispatch(fnMap.fn())
            }
        }
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = adjustWhitespace(e.target.value)
        if (value !== newTopicText) {
            dispatch(setNewTopicText(value))
        }
    }

    return (
        <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newTopicText}
            onKeyDown={handleKeyDown}
            placeholder="Add a new note..."
            onSelect={handleSelect}
            ref={registerInputRef('newTopic')}
            onChange={handleChange}
            onFocus={(event) =>
                handleFocus({
                    event,
                    elementIdentifier: 'newTopic',
                })
            }
        />
    )
}
