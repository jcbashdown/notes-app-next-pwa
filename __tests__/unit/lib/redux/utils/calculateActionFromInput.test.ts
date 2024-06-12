const mockSlice = {
    actions: {
        initFromRxDB: jest.fn(),
        addEmptyNote: jest.fn(),
        addAndSwitchToTopicNote: jest.fn(),
        updateNoteText: jest.fn(),
        updateRelationshipType: jest.fn(),
        setCursorSelection: jest.fn(),
        setCursorPosition: jest.fn(),
        nestNote: jest.fn(),
        setNoteTopic: jest.fn(),
        moveCursorBack: jest.fn(),
        moveCursorForward: jest.fn(),
        moveDown: jest.fn(),
        moveUp: jest.fn(),
        deleteNote: jest.fn(),
        setNewTopicText: jest.fn(),
        reduceNoteNesting: jest.fn(),
    },
} //TODO - find a better way to keep this in sync with the slice actions

const fakeDispatcher = (fnMaps: { fn: Function; args: any[] }[]) => {
    for (const fnMap of fnMaps) {
        fnMap.fn(...fnMap.args)
    }
}

import {
    calculateActionFromInput,
    calculateActionFromTopicInput,
    calculateActionFromNewTopicInput,
    inputTypes,
} from '@/lib/redux/utils/calculateActionFromInput'

describe('calculateActionFromInput', () => {
    describe('when its a relationship or text input', () => {
        describe('when key is backspace', () => {
            describe('and the note is not at the lowest level', () => {
                it('deletes the note, moves back twice and sets the cursor position to the end when the relationshipType and text is empty and the action happens from a text input', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.TEXT,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(2)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).toHaveBeenCalledWith('noteId')
                })
                it('moves back when the action happens from the start of the input even if the relationship text is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '+',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.TEXT,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('moves back when the action happens from the start of the input even if the note text is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            'abc',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.TEXT,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('does nothing if the action happens from the middle of the text input when it has content', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            'abc',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 1, selectionEnd: 1 },
                            inputTypes.TEXT,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).not.toHaveBeenCalled()
                    expect(mockSlice.actions.setCursorSelection).not.toHaveBeenCalled()
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('deletes the note, moves back once and sets the cursor position to the end when the relationshipType and text is empty and the action happens from a relationship input', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.RELATIONSHIP,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).toHaveBeenCalledWith('noteId')
                })
                it('it moves back when the cursor is at the start of a relationship input even if the relationship is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '+',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.RELATIONSHIP,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('it moves back when the cursor is at the start of a relationship input even if the note text is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            'abc',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.RELATIONSHIP,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('it does nothing if the action happens from the end of the relationship input if the input is full', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '+',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 1, selectionEnd: 1 },
                            inputTypes.RELATIONSHIP,
                            true,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).not.toHaveBeenCalled()
                    expect(mockSlice.actions.setCursorSelection).not.toHaveBeenCalled()
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
            })
            describe('and the note is not at the lowest level', () => {
                it('moves back when the action happens from the start of the text input', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.TEXT,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('moves back when the action happens from the start of the text input even if the relationship text is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '+',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.TEXT,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('moves back when the action happens from the start of the input even if the note text is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            'abc',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.TEXT,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                        selectionStart: 999999,
                        selectionEnd: 999999,
                    })
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalled()
                })
                it('does nothing when the action happens from the middle of the input if the note text is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            'abc',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 1, selectionEnd: 1 },
                            inputTypes.TEXT,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).not.toHaveBeenCalled()
                    expect(mockSlice.actions.setCursorSelection).not.toHaveBeenCalled()
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalledWith()
                })
                it('reduces the note nesting when the relationshipType and text is empty and the action happens from a relationship input', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.RELATIONSHIP,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.reduceNoteNesting).toHaveBeenCalledWith({
                        oldParentId: 'parentId',
                        targetNoteId: 'noteId',
                    })
                    expect(mockSlice.actions.moveCursorBack).not.toHaveBeenCalled()
                    expect(mockSlice.actions.setCursorSelection).not.toHaveBeenCalled()
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalledWith()
                })
                it('it reduces the note nesting when the cursor is at the start of a relationship input even if the relationship is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '+',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.RELATIONSHIP,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.reduceNoteNesting).toHaveBeenCalledWith({
                        oldParentId: 'parentId',
                        targetNoteId: 'noteId',
                    })
                    expect(mockSlice.actions.moveCursorBack).not.toHaveBeenCalled()
                    expect(mockSlice.actions.setCursorSelection).not.toHaveBeenCalled()
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalledWith()
                })
                it('it reduces the note nesting when the cursor is at the start of a relationship input even if the note text is not empty', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '',
                            'abc',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 0, selectionEnd: 0 },
                            inputTypes.RELATIONSHIP,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).toHaveBeenCalledTimes(1)
                    expect(mockSlice.actions.reduceNoteNesting).toHaveBeenCalledWith({
                        oldParentId: 'parentId',
                        targetNoteId: 'noteId',
                    })
                    expect(mockSlice.actions.moveCursorBack).not.toHaveBeenCalled()
                    expect(mockSlice.actions.setCursorSelection).not.toHaveBeenCalled()
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalledWith()
                })
                it('it does nothing when the cursor is at the end of a full relationship input', async () => {
                    fakeDispatcher(
                        calculateActionFromInput(
                            'Backspace',
                            '+',
                            '',
                            'noteId',
                            'parentId',
                            'previousNoteId',
                            { selectionStart: 1, selectionEnd: 1 },
                            inputTypes.RELATIONSHIP,
                            false,
                            mockSlice
                        )
                    )
                    expect(mockSlice.actions.reduceNoteNesting).not.toHaveBeenCalled()
                    expect(mockSlice.actions.moveCursorBack).not.toHaveBeenCalled()
                    expect(mockSlice.actions.setCursorSelection).not.toHaveBeenCalled()
                    expect(mockSlice.actions.deleteNote).not.toHaveBeenCalledWith()
                })
            })
        })
        describe('when key is Enter', () => {
            it('it creates a new empty note if the noteText is not empty', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'Enter',
                        '',
                        'abc',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.TEXT,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.addEmptyNote).toHaveBeenCalledWith('parentId')

                expect(mockSlice.actions.addEmptyNote.mock.invocationCallOrder[0]).toBeLessThan(
                    mockSlice.actions.moveCursorForward.mock.invocationCallOrder[0]
                )
            })
            it('it returns an empty array of actions if the noteText is empty', async () => {
                expect(
                    calculateActionFromInput(
                        'Enter',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.TEXT,
                        false,
                        mockSlice
                    )
                ).toEqual([])
            })
            it('it creates a new empty note if the note Text is not empty and the action happens in a relationship input', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'Enter',
                        '',
                        'abc',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(2)
                expect(mockSlice.actions.addEmptyNote).toHaveBeenCalledWith('parentId')
                expect(mockSlice.actions.addEmptyNote.mock.invocationCallOrder[0]).toBeLessThan(
                    mockSlice.actions.moveCursorForward.mock.invocationCallOrder[0]
                )
            })
            it('it returns an empty array of actions if the noteText is empty and the action happens in a relationship input', async () => {
                expect(
                    calculateActionFromInput(
                        'Enter',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is Tab', () => {
            it('it nests the current note under the preceeding note vertically if the noteText is not empty and the action happens in a text input', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'Tab',
                        '',
                        'abc',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 2, selectionEnd: 3 },
                        inputTypes.TEXT,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.nestNote).toHaveBeenCalledWith({
                    oldParentId: 'parentId',
                    newParentId: 'previousNoteId',
                    targetNoteId: 'noteId',
                })
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 2,
                    selectionEnd: 3,
                })
            })
            it('it nests the current note under the preceeding note vertically if the relationshipType is not empty and the action happsn in a text input', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'Tab',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 4, selectionEnd: 6 },
                        inputTypes.TEXT,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.nestNote).toHaveBeenCalledWith({
                    oldParentId: 'parentId',
                    newParentId: 'previousNoteId',
                    targetNoteId: 'noteId',
                })
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 4,
                    selectionEnd: 6,
                })
            })
            it('it returns an empty array of actions if the noteText and relationshipType is empty', async () => {
                expect(
                    calculateActionFromInput(
                        'Tab',
                        '',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.TEXT,
                        false,
                        mockSlice
                    )
                ).toEqual([])
            })
            it('it nests the current note under the preceeding note vertically if the the noteText is not empty and the action happens in a relationship input', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'Tab',
                        '',
                        'abc',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.nestNote).toHaveBeenCalledWith({
                    oldParentId: 'parentId',
                    newParentId: 'previousNoteId',
                    targetNoteId: 'noteId',
                })
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 0,
                    selectionEnd: 0,
                })
            })
            it('it nests the current note under the preceeding note vertically if the relationshipType is not empty and the action happens in a relationship input', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'Tab',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.nestNote).toHaveBeenCalledWith({
                    oldParentId: 'parentId',
                    newParentId: 'previousNoteId',
                    targetNoteId: 'noteId',
                })
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 0,
                    selectionEnd: 0,
                })
            })
            it('it returns an empty array of actions if the noteText and relationshipType is empty and the action happens in a relationship input', async () => {
                expect(
                    calculateActionFromInput(
                        'Tab',
                        '',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is ArrowUp', () => {
            it('it moves the cursor up no matter what the rest of the state ', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'ArrowUp',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveUp).toHaveBeenCalledTimes(1)
            })
        })
        describe('when key is ArrowDown', () => {
            it('it moves the cursor down no matter what the rest of the state ', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'ArrowDown',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveDown).toHaveBeenCalledTimes(1)
            })
        })
        describe('when key is ArrowLeft', () => {
            it('when the cursor is at the start of the input it moves back', async () => {
                fakeDispatcher(
                    calculateActionFromInput(
                        'ArrowLeft',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 999999,
                    selectionEnd: 999999,
                })
            })
            it('when the cursor is in the middle of the input it does nothing', async () => {
                expect(
                    calculateActionFromInput(
                        'ArrowLeft',
                        '+',
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: 1, selectionEnd: 1 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is ArrowRight', () => {
            it('when the cursor is at the end of the input it moves forward', async () => {
                const inputText = 'text'
                fakeDispatcher(
                    calculateActionFromInput(
                        'ArrowRight',
                        '+',
                        inputText,
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: inputText.length, selectionEnd: inputText.length },
                        inputTypes.TEXT,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 0,
                    selectionEnd: 0,
                })
            })
            it('when the cursor is in the middle of the input it does nothing', async () => {
                const inputText = 'text'
                expect(
                    calculateActionFromInput(
                        'ArrowRight',
                        '+',
                        inputText,
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: inputText.length - 2, selectionEnd: inputText.length - 2 },
                        inputTypes.TEXT,
                        false,
                        mockSlice
                    )
                ).toEqual([])
            })
            it('when the cursor is at the end of a relationship input it moves forward to the next input', async () => {
                const relInputText = '+'
                fakeDispatcher(
                    calculateActionFromInput(
                        'ArrowRight',
                        relInputText,
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: relInputText.length, selectionEnd: relInputText.length },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 0,
                    selectionEnd: 0,
                })
            })
            it('when the cursor is in the middle of a relationship input it does nothing', async () => {
                const relInputText = '+'
                expect(
                    calculateActionFromInput(
                        'ArrowRight',
                        relInputText,
                        '',
                        'noteId',
                        'parentId',
                        'previousNoteId',
                        { selectionStart: relInputText.length - 2, selectionEnd: relInputText.length - 2 },
                        inputTypes.RELATIONSHIP,
                        false,
                        mockSlice
                    )
                ).toEqual([])
            })
        })
    })
    describe('when the input is a topic input', () => {
        describe('when key is backspace', () => {
            it('deletes the note, moves back once and sets the cursor position to the end when the text is empty', async () => {
                fakeDispatcher(
                    calculateActionFromTopicInput(
                        'Backspace',
                        '',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 999999,
                    selectionEnd: 999999,
                })
                expect(mockSlice.actions.deleteNote).toHaveBeenCalledWith('noteId')
            })
            it('does nothing when the action happens from the start of the input even if the text is not empty', async () => {
                expect(
                    calculateActionFromTopicInput(
                        'Backspace',
                        'abc',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is Enter', () => {
            it('it creates a new empty note if the input is not empty', async () => {
                fakeDispatcher(
                    calculateActionFromTopicInput(
                        'Enter',
                        'abc',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.addEmptyNote).toHaveBeenCalledWith('noteId')

                expect(mockSlice.actions.addEmptyNote.mock.invocationCallOrder[0]).toBeLessThan(
                    mockSlice.actions.moveCursorForward.mock.invocationCallOrder[0]
                )
            })
            it('it returns an empty array of actions if the input is empty', async () => {
                expect(
                    calculateActionFromTopicInput(
                        'Enter',
                        '',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is Tab', () => {
            it('it returns an empty array of actions in all circumstances', async () => {
                expect(
                    calculateActionFromTopicInput(
                        'Tab',
                        'abc',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is ArrowUp', () => {
            it('it moves the cursor up to the new topic input no matter what the rest of the state ', async () => {
                fakeDispatcher(
                    calculateActionFromTopicInput(
                        'ArrowUp',
                        'abc',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
            })
        })
        describe('when key is ArrowDown', () => {
            it('it moves the cursor down no matter what the rest of the state ', async () => {
                fakeDispatcher(
                    calculateActionFromTopicInput(
                        'ArrowDown',
                        'abc',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
            })
        })
        describe('when key is ArrowLeft', () => {
            it('when the cursor is at the start of the input it moves back to the new topic input', async () => {
                fakeDispatcher(
                    calculateActionFromTopicInput(
                        'ArrowLeft',
                        '',
                        'noteId',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorBack).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 999999,
                    selectionEnd: 999999,
                })
            })
            it('when the cursor is in the middle of the input it does nothing', async () => {
                expect(
                    calculateActionFromTopicInput(
                        'ArrowLeft',
                        'abc',
                        'noteId',
                        { selectionStart: 1, selectionEnd: 1 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is ArrowRight', () => {
            it('when the cursor is at the end of the input it moves forward', async () => {
                const inputText = 'text'
                fakeDispatcher(
                    calculateActionFromTopicInput(
                        'ArrowRight',
                        inputText,
                        'noteId',
                        { selectionStart: inputText.length, selectionEnd: inputText.length },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 0,
                    selectionEnd: 0,
                })
            })
            it('when the cursor is in the middle of the input it does nothing', async () => {
                const inputText = 'text'
                expect(
                    calculateActionFromTopicInput(
                        'ArrowRight',
                        inputText,
                        'noteId',
                        { selectionStart: inputText.length - 2, selectionEnd: inputText.length - 2 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
    })
    describe('when its a new topic input', () => {
        describe('when key is backspace', () => {
            it('and the relationshipType and text is empty', async () => {
                expect(
                    calculateActionFromNewTopicInput('Backspace', '', { selectionStart: 0, selectionEnd: 0 }, mockSlice)
                ).toEqual([])
            })
        })
        describe('when key is Enter', () => {
            it('it creates a new empty note if the input is not empty', async () => {
                fakeDispatcher(
                    calculateActionFromNewTopicInput('Enter', 'abc', { selectionStart: 0, selectionEnd: 0 }, mockSlice)
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.addAndSwitchToTopicNote).toHaveBeenCalledWith('abc')
                expect(mockSlice.actions.setNewTopicText).toHaveBeenCalledWith('')

                expect(mockSlice.actions.addAndSwitchToTopicNote.mock.invocationCallOrder[0]).toBeLessThan(
                    mockSlice.actions.moveCursorForward.mock.invocationCallOrder[0]
                )
                expect(mockSlice.actions.moveCursorForward.mock.invocationCallOrder[0]).toBeLessThan(
                    mockSlice.actions.setNewTopicText.mock.invocationCallOrder[0]
                )
            })
            it('it returns an empty array of actions if the input is empty', async () => {
                expect(
                    calculateActionFromNewTopicInput('Enter', '', { selectionStart: 0, selectionEnd: 0 }, mockSlice)
                ).toEqual([])
            })
        })
        describe('when key is Tab', () => {
            it('it returns an empty array of actions in all circumstances', async () => {
                expect(
                    calculateActionFromNewTopicInput('Tab', 'abc', { selectionStart: 0, selectionEnd: 0 }, mockSlice)
                ).toEqual([])
            })
        })
        describe('when key is ArrowUp', () => {
            it('it returns an empty array of actions in all circumstances', async () => {
                expect(
                    calculateActionFromNewTopicInput(
                        'ArrowUp',
                        'abc',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is ArrowDown', () => {
            it('it moves the cursor down no matter what the rest of the state ', async () => {
                fakeDispatcher(
                    calculateActionFromNewTopicInput(
                        'ArrowDown',
                        'abc',
                        { selectionStart: 0, selectionEnd: 0 },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
            })
        })
        describe('when key is ArrowLeft', () => {
            it('when the cursor is at the start of the input it moves back to the new topic input', async () => {
                expect(
                    calculateActionFromNewTopicInput('ArrowLeft', '', { selectionStart: 0, selectionEnd: 0 }, mockSlice)
                ).toEqual([])
            })
            it('when the cursor is in the middle of the input it does nothing', async () => {
                expect(
                    calculateActionFromNewTopicInput(
                        'ArrowLeft',
                        'abc',
                        { selectionStart: 1, selectionEnd: 1 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
        describe('when key is ArrowRight', () => {
            it('when the cursor is at the end of the input it moves forward', async () => {
                const inputText = 'text'
                fakeDispatcher(
                    calculateActionFromNewTopicInput(
                        'ArrowRight',
                        inputText,
                        { selectionStart: inputText.length, selectionEnd: inputText.length },
                        mockSlice
                    )
                )
                expect(mockSlice.actions.moveCursorForward).toHaveBeenCalledTimes(1)
                expect(mockSlice.actions.setCursorSelection).toHaveBeenCalledWith({
                    selectionStart: 0,
                    selectionEnd: 0,
                })
            })
            it('when the cursor is in the middle of the input it does nothing', async () => {
                const inputText = 'text'
                expect(
                    calculateActionFromNewTopicInput(
                        'ArrowRight',
                        inputText,
                        { selectionStart: inputText.length - 2, selectionEnd: inputText.length - 2 },
                        mockSlice
                    )
                ).toEqual([])
            })
        })
    })
})
