// Note.tsx
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { noteSlice, selectNote, updateNoteText, selectIsCurrentTopicChild } from '@/lib/redux/features/noteSlice'
import { useCursorFocus } from '@/lib/hooks/useCursorFocus'
import { adjustWhitespace } from '@/lib/helpers/textHelpers'

import { calculateActionFromInput, inputTypes } from '@/lib/redux/utils/calculateActionFromInput'

interface NoteProps {
    noteId: string
    parentNoteId: string
    relationshipType: string
    previousNoteId: string
}

const Note: React.FC<NoteProps> = ({ noteId, parentNoteId, relationshipType, previousNoteId }) => {
    const { handleFocus, registerInputRef, handleSelect } = useCursorFocus()
    const inputIdentifier = `${parentNoteId}---${noteId}_text`

    const dispatch = useAppDispatch()
    //TODO - understand why I don't need to specify the type of state even in
    //strict mode
    const note = useAppSelector((state) => selectNote(state, noteId))
    const isCurrentTopicChild = useAppSelector((state) => selectIsCurrentTopicChild(state, noteId))

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const target = e.target as HTMLInputElement
        const { selectionStart, selectionEnd } = target
        const newText = adjustWhitespace(target.value)
        const key = e.key
        console.log('key', key)
        if (['Enter', 'Tab', 'ArrowDown', 'ArrowUp'].includes(key)) {
            e.preventDefault()
        } else if (key === 'Backspace' && selectionStart === 0 && selectionEnd === 0) {
            e.preventDefault()
        } else if (!['ArrowLeft', 'ArrowRight'].includes(key)) {
            return
        }
        const actionFunctions = calculateActionFromInput(
            key,
            relationshipType,
            newText,
            noteId,
            parentNoteId,
            previousNoteId,
            { selectionStart, selectionEnd },
            inputTypes.TEXT,
            isCurrentTopicChild,
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
        if (value !== note.text) {
            dispatch(updateNoteText({ noteId, text: value }))
        }
    }

    return (
        <input
            type="text"
            value={note.text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            data-id={inputIdentifier}
            ref={registerInputRef(inputIdentifier)}
            onFocus={(event) =>
                handleFocus({
                    event,
                    elementIdentifier: inputIdentifier,
                })
            }
        />
    )
}

export default Note
