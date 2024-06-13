export const FOCUS_CHANGERS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace']
export const SINGLE_KEYPRESSES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Backspace']
export const NOT_LINE_TEXT = [
    'upWithArrowLeft',
    'downWithArrowRight',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Enter',
    'Tab',
    'Backspace',
]

export default class KeyPressesFromNoteGenerator {
    constructor() {
        this.keyPresses = []
        this.note = null
    }

    setNote = (note) => {
        this.note = note
    }

    getKeyPresses = () => {
        return this.generateKeyPresses()
    }

    generateKeyPresses() {
        const note = this.note
        const lines = note.split('\n')
        let keyPresses = lines
            .reduce((memo, item) => {
                if (item === '') return memo
                const withoutIndent = item.replace(/\s{4}/g, '')
                const withCommandsSplitOut = withoutIndent.split('|')
                let lineText = ''
                const withLeftAndRight = withCommandsSplitOut.reduce((memo, item) => {
                    if (!NOT_LINE_TEXT.includes(item)) {
                        lineText = item
                    }
                    //TODO - down with arrowright only makes sense from the start of an input. This approach won't work because the text you input on this line won't be the text you need to press through
                    if (item === 'downWithArrowRight' || item === 'upWithArrowLeft') {
                        memo = memo.concat(this.expandLeftAndRight(item, lineText))
                    } else if (item.includes('backspaces')) {
                        const num = parseInt(item.match(/\d+/)[0])
                        memo = memo.concat(Array(num).fill('Backspace'))
                        memo.push('FOCUS')
                    } else {
                        memo.push(item)
                        if (FOCUS_CHANGERS.includes(item)) {
                            memo.push('FOCUS')
                        }
                    }
                    return memo
                }, [])
                memo = memo.concat(withLeftAndRight)
                memo.push('Enter')
                memo.push('FOCUS')
                return memo
            }, [])
            .filter((keyPress) => keyPress !== '')
        //remove the last keyPress if it's enter
        const last = keyPresses.slice(-2)
        if (last[0] === 'Enter') {
            return keyPresses.slice(0, -2)
        } else {
            return keyPresses
        }
    }

    /*
     * upWithArrowLeft and downWithArrowRight must be the first navigation commands on the line otherwise the number or presses will be wrong
     * This still allows us to test arrow right and left
     * If we need something else then you have to manually type the number of ArrowLefts and Rights
     */
    expandLeftAndRight(command, lineText) {
        let commandUnit = ''
        let presses = null
        if (command === 'downWithArrowRight') {
            commandUnit = 'ArrowRight'
        } else {
            commandUnit = 'ArrowLeft'
        }
        if (lineText[0] === '+' || lineText[0] === '-') {
            presses = Array(lineText.length).fill(commandUnit)
        } else {
            presses = Array(lineText.length + 1).fill(commandUnit)
        }
        presses.push('FOCUS')
        return presses
    }
}
