// NoteTopic.tsx
//
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { noteSlice, selectNote, updateNoteText, selectCurrentNoteTopic } from '@/lib/redux/features/noteSlice'
import { useCursorFocus } from '@/lib/hooks/useCursorFocus'
import { adjustWhitespace } from '@/lib/helpers/textHelpers'

import { calculateActionFromTopicInput, inputTypes } from '@/lib/redux/utils/calculateActionFromInput'
import { NoteDocType } from '@/lib/rxdb/types/noteTypes'
import NotesList from '@/components/NotesList'

interface NoteTopicProps {
    noteTopic: NoteDocType
}

export default function NoteTopic({ noteTopic }: NoteTopicProps) {
    const { handleFocus, registerInputRef, handleSelect } = useCursorFocus()
    const note = useAppSelector((state) => selectNote(state, noteTopic.id))
    const currentTopicId = useAppSelector(selectCurrentNoteTopic)
    const inputIdentifier = `${note.id}_topic`

    const dispatch = useAppDispatch()
    //TODO - understand why I don't need to specify the type of state even in
    //strict mode
    const handleKeyDown = (e: React.KeyboardEvent) => {
        //DRY up with Note
        const target = e.target as HTMLInputElement
        const { selectionStart, selectionEnd } = target
        const newText = target.value.trim()
        const key = e.key
        if (['Enter', 'ArrowDown', 'ArrowUp'].includes(key)) {
            e.preventDefault()
        } else if (!['ArrowLeft', 'ArrowRight', 'Backspace'].includes(key)) {
            return
        }
        const actionFunctions = calculateActionFromTopicInput(
            key,
            newText,
            note.id,
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
        if (value !== note.text) {
            dispatch(updateNoteText({ noteId: note.id, text: value }))
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <input
                type="text"
                value={note.text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                ref={registerInputRef(inputIdentifier)}
                onFocus={(event) =>
                    handleFocus({
                        event,
                        elementIdentifier: inputIdentifier,
                    })
                }
            />
            {note.id === currentTopicId ? <NotesList noteId={note.id} /> : null}
        </div>
    )
}
