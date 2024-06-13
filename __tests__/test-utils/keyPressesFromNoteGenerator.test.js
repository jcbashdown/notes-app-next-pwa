import KeyPressesFromNoteGenerator from './keyPressesFromNoteGenerator'

const simpleNoteInput = `
A new Note
    + This note supports "a new Note"
    - This note opposes "a new Note"
        This is related to the opposing note|Tab|
    This note is related to a new Note.`

const complexNoteInput = `
A new Note
    - This note opposes "a new Note"
        This is related to the opposing note|Tab|upWithArrowLeft|ArrowUp|
    + This note supports "a new Note"|downWithArrowRight|ArrowDown|ArrowDown|
    |Backspace|This note is related to a new Note.
`

describe('keyPressesFromNoteGenerator', () => {
    it('should return an array of key presses for a simple note', () => {
        const keyPressesFromNoteGenerator = new KeyPressesFromNoteGenerator()
        keyPressesFromNoteGenerator.setNote(simpleNoteInput)
        const keyPresses = keyPressesFromNoteGenerator.getKeyPresses()
        expect(keyPresses).toEqual([
            'A new Note',
            'Enter',
            'FOCUS',
            '+ This note supports "a new Note"',
            'Enter',
            'FOCUS',
            '- This note opposes "a new Note"',
            'Enter',
            'FOCUS',
            'This is related to the opposing note',
            'Tab',
            'Enter',
            'FOCUS',
            'This note is related to a new Note.',
        ])
    })
    it('should return an array of key presses for a complex note', () => {
        const keyPressesFromNoteGenerator = new KeyPressesFromNoteGenerator()
        keyPressesFromNoteGenerator.setNote(complexNoteInput)
        const keyPresses = keyPressesFromNoteGenerator.getKeyPresses()
        expect(keyPresses).toEqual([
            'A new Note',
            'Enter',
            'FOCUS',
            '- This note opposes "a new Note"',
            'Enter',
            'FOCUS',
            'This is related to the opposing note',
            'Tab',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'ArrowLeft',
            'FOCUS',
            'ArrowUp',
            'FOCUS',
            'Enter',
            'FOCUS',
            '+ This note supports "a new Note"',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'ArrowRight',
            'FOCUS',
            'ArrowDown',
            'FOCUS',
            'ArrowDown',
            'FOCUS',
            'Enter',
            'FOCUS',
            'Backspace',
            'FOCUS',
            'This note is related to a new Note.',
        ])
    })
})
