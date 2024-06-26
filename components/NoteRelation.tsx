// NoteRelation.tsx
import { NoteRelationTypeEnum } from '@/lib/rxdb/types/noteTypes'
import { useCursorFocus } from '@/lib/hooks/useCursorFocus'
import { calculateActionFromInput, inputTypes } from '@/lib/redux/utils/calculateActionFromInput'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import {
    moveCursorForward,
    noteSlice,
    selectNote,
    updateRelationshipType,
    setCursorSelection,
    insertAtStartOfNoteText,
    selectIsCurrentTopicChild,
} from '@/lib/redux/features/noteSlice'
import useOrderedDispatch from '@/lib/hooks/useOrderedDispatch'

interface NoteProps {
    noteId: string
    parentNoteId: string
    relationshipType: NoteRelationTypeEnum
    previousNoteId: string
}

const NoteRelation: React.FC<NoteProps> = ({ noteId, parentNoteId, relationshipType, previousNoteId }) => {
    const { handleFocus, registerInputRef, handleSelect } = useCursorFocus()
    const inputIdentifier = `${parentNoteId}---${noteId}_relationship`

    const note = useAppSelector((state) => selectNote(state, noteId))
    const isCurrentTopicChild = useAppSelector((state) => selectIsCurrentTopicChild(state, noteId))
    const dispatch = useAppDispatch()

    const orderedDispatch = useOrderedDispatch(dispatch)

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value
        //filter value to only include valid options ['', '+', '-']
        let value = newValue.trim().replace(/[^+-]/g, '')[0] || ''
        if (value !== relationshipType) {
            orderedDispatch(updateRelationshipType, [
                { parentNoteId, noteId, relationshipType: value as NoteRelationTypeEnum },
            ])
        }
        //whatever is typed, move to the text input
        if ((value && newValue.length > 1) || newValue.length > 0) {
            //if something other than a relationship character is typed then insert it at the beginning of the text input
            let substringToInsert = newValue
            if (['+', '-'].includes(newValue[0])) {
                substringToInsert = newValue.slice(1)
            }
            orderedDispatch(moveCursorForward, [])
            orderedDispatch(insertAtStartOfNoteText, [{ noteId, text: substringToInsert }])
            orderedDispatch(setCursorSelection, [
                { selectionStart: substringToInsert.length, selectionEnd: substringToInsert.length },
            ])
        }
    }

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        //TODO - dry this up with Note keydown
        const target = e.target as HTMLInputElement
        const { selectionStart, selectionEnd } = target
        const newRelationshipType = target.value.trim()
        const key = e.key
        if (['Enter', 'Tab', 'ArrowDown', 'ArrowUp'].includes(key)) {
            e.preventDefault()
        } else if (key === 'Backspace' && selectionStart === 0 && selectionEnd === 0) {
            e.preventDefault()
        } else if (!['ArrowLeft', 'ArrowRight'].includes(key)) {
            return
        }
        const actionFunctions = calculateActionFromInput(
            key,
            newRelationshipType,
            note.text,
            noteId,
            parentNoteId,
            previousNoteId,
            { selectionStart, selectionEnd },
            inputTypes.RELATIONSHIP,
            isCurrentTopicChild,
            noteSlice
        )
        for (const fnMap of actionFunctions) {
            orderedDispatch(fnMap.fn, fnMap.args)
        }
    }

    return (
        <input
            type="text"
            //value={relationshipType || '•'}
            value={relationshipType}
            className="pl-1"
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

export default NoteRelation
