import { cursorSelectionType } from '@/lib/redux/features/noteSlice'

export enum inputTypes {
    RELATIONSHIP,
    TEXT,
    NEW_TOPIC,
    TOPIC,
}

interface ActionsListItem {
    fn: Function
    args: any[]
}

interface NoteSlice {
    actions: {
        initFromRxDB: Function
        addEmptyNote: Function
        addAndSwitchToTopicNote: Function
        updateNoteText: Function
        updateRelationshipType: Function
        setCursorPosition: Function
        setCursorSelection: Function
        nestNote: Function
        setNoteTopic: Function
        moveCursorBack: Function
        moveCursorForward: Function
        moveUp: Function
        moveDown: Function
        deleteNote: Function
        setNewTopicText: Function
        reduceNoteNesting: Function
    }
} //TODO - find a better way to keep this in sync with the slice actions
export const calculateActionFromInput = (
    key: string,
    relationshipType: string,
    noteText: string,
    noteId: string,
    parentId: string | null,
    previousNoteId: string | null,
    cursorSelection: cursorSelectionType,
    inputType: inputTypes,
    isCurrentTopicChild: boolean,
    noteSlice: Required<NoteSlice>
): ActionsListItem[] => {
    let actions: ActionsListItem[] = []
    if (key === 'Enter') {
        if (noteText !== '') {
            //creates a new empty note and puts the cursor in the relation input
            //A new empty note should always have focus
            //If no empty note is created moving forward is still correct as it means the next note was already empty
            actions.push({ fn: noteSlice.actions.addEmptyNote, args: [parentId] })
            actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
            if (inputType === inputTypes.RELATIONSHIP) {
                actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
            }
        }
    } else if (key === 'Tab') {
        if (noteText !== '' || relationshipType !== '') {
            //nests the current note under the preceeding note vertically
            //unless that note is already a parent
            //No focus change needed
            actions.push({
                fn: noteSlice.actions.nestNote,
                args: [{ oldParentId: parentId, newParentId: previousNoteId, targetNoteId: noteId }],
            })
            actions.push({ fn: noteSlice.actions.setCursorSelection, args: [cursorSelection] })
        }
        //Nest note unless it is the first child already
    } else if (key === 'Backspace') {
        if (isCurrentTopicChild) {
            if (relationshipType === '' && noteText === '') {
                if (inputType === inputTypes.TEXT) {
                    actions.push({ fn: noteSlice.actions.moveCursorBack, args: [] })
                }
                actions.push({ fn: noteSlice.actions.deleteNote, args: [noteId] })
            }
            if (cursorSelection.selectionEnd === 0 && cursorSelection.selectionStart === 0) {
                actions.push({ fn: noteSlice.actions.moveCursorBack, args: [] })
                actions.push({
                    fn: noteSlice.actions.setCursorSelection,
                    args: [{ selectionStart: 999999, selectionEnd: 999999 }],
                })
            }
        } else {
            if (
                cursorSelection.selectionEnd === 0 &&
                cursorSelection.selectionStart === 0 &&
                inputType === inputTypes.RELATIONSHIP
            ) {
                actions.push({
                    fn: noteSlice.actions.reduceNoteNesting,
                    args: [{ oldParentId: parentId, targetNoteId: noteId }],
                })
            }
            if (
                cursorSelection.selectionEnd === 0 &&
                cursorSelection.selectionStart === 0 &&
                inputType === inputTypes.TEXT
            ) {
                actions.push({ fn: noteSlice.actions.moveCursorBack, args: [] })
                actions.push({
                    fn: noteSlice.actions.setCursorSelection,
                    args: [{ selectionStart: 999999, selectionEnd: 999999 }],
                })
            }
        }
    } else if (key === 'ArrowUp') {
        actions.push({ fn: noteSlice.actions.moveUp, args: [] })
    } else if (key === 'ArrowDown') {
        actions.push({ fn: noteSlice.actions.moveDown, args: [] })
    } else if (key === 'ArrowLeft') {
        if (cursorSelection.selectionStart === 0 && cursorSelection.selectionEnd === 0) {
            actions.push({
                fn: noteSlice.actions.setCursorSelection,
                args: [{ selectionStart: 999999, selectionEnd: 999999 }],
            })
            actions.push({ fn: noteSlice.actions.moveCursorBack, args: [] })
        }
    } else if (key === 'ArrowRight') {
        let inputTextLength = 0
        if (inputType === inputTypes.RELATIONSHIP) {
            inputTextLength = relationshipType.length
        } else {
            inputTextLength = noteText.length
        }
        if (cursorSelection.selectionStart === inputTextLength && cursorSelection.selectionEnd === inputTextLength) {
            actions.push({
                fn: noteSlice.actions.setCursorSelection,
                args: [{ selectionStart: 0, selectionEnd: 0 }],
            })
            actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
        }
    }
    return actions
}

export const calculateActionFromTopicInput = (
    key: string,
    noteText: string,
    noteId: string | null,
    cursorSelection: cursorSelectionType,
    noteSlice: Required<NoteSlice>
): ActionsListItem[] => {
    let actions: ActionsListItem[] = []
    if (key === 'Enter') {
        if (noteText !== '') {
            //creates a new empty note and puts the cursor in the relation input
            //A new empty note should always have focus
            //If no empty note is created moving forward is still correct as it means the next note was already empty
            actions.push({ fn: noteSlice.actions.addEmptyNote, args: [noteId] })
            actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
        }
    } else if (key === 'Backspace') {
        if (noteText === '') {
            actions.push({ fn: noteSlice.actions.moveCursorBack, args: [] })
            actions.push({
                fn: noteSlice.actions.setCursorSelection,
                args: [{ selectionStart: 999999, selectionEnd: 999999 }],
            })
            actions.push({ fn: noteSlice.actions.deleteNote, args: [noteId] })
        }
    } else if (key === 'ArrowUp') {
        actions.push({ fn: noteSlice.actions.moveCursorBack, args: [] })
    } else if (key === 'ArrowDown') {
        actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
    } else if (key === 'ArrowLeft') {
        if (cursorSelection.selectionStart === 0 && cursorSelection.selectionEnd === 0) {
            actions.push({
                fn: noteSlice.actions.setCursorSelection,
                args: [{ selectionStart: 999999, selectionEnd: 999999 }],
            })
            actions.push({ fn: noteSlice.actions.moveCursorBack, args: [] })
        }
    } else if (key === 'ArrowRight') {
        let inputTextLength = noteText.length
        if (cursorSelection.selectionStart === inputTextLength && cursorSelection.selectionEnd === inputTextLength) {
            actions.push({
                fn: noteSlice.actions.setCursorSelection,
                args: [{ selectionStart: 0, selectionEnd: 0 }],
            })
            actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
        }
    }
    return actions
}

export const calculateActionFromNewTopicInput = (
    key: string,
    noteText: string,
    cursorSelection: cursorSelectionType,
    noteSlice: Required<NoteSlice>
): ActionsListItem[] => {
    let actions: ActionsListItem[] = []
    if (key === 'Enter') {
        if (noteText !== '') {
            //creates a new empty note and puts the cursor in the relation input
            //A new empty note should always have focus
            //If no empty note is created moving forward is still correct as it means the next note was already empty
            actions.push({ fn: noteSlice.actions.addAndSwitchToTopicNote, args: [noteText] })
            actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
            actions.push({ fn: noteSlice.actions.setNewTopicText, args: [''] })
        }
    } else if (key === 'ArrowDown') {
        actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
    } else if (key === 'ArrowRight') {
        let inputTextLength = noteText.length
        if (cursorSelection.selectionStart === inputTextLength && cursorSelection.selectionEnd === inputTextLength) {
            actions.push({
                fn: noteSlice.actions.setCursorSelection,
                args: [{ selectionStart: 0, selectionEnd: 0 }],
            })
            actions.push({ fn: noteSlice.actions.moveCursorForward, args: [] })
        }
    }
    return actions
}
