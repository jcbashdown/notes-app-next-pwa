export const FOCUS_CHANGERS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace']
export const SINGLE_KEYPRESSES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Backspace']

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
                const withTabs = item.replace(/\s{4}/g, '')
                const withCommandsSplitOut = withTabs.split('|')
                const lineText = withCommandsSplitOut[0]
                const withLeftAndRight = withCommandsSplitOut.reduce((memo, item) => {
                    if (item === 'downWithArrowRight' || item === 'upWithArrowLeft') {
                        memo = memo.concat(this.expandLeftAndRight(item, lineText))
                    } else {
                        memo.push(item)
                    }
                    return memo
                }, [])
                memo = memo.concat(withLeftAndRight)
                memo.push('Enter')
                return memo
            }, [])
            .filter((keyPress) => keyPress !== '')
        //remove the last keyPress if it's enter
        const last = keyPresses.pop()
        if (last === 'Enter') {
            return keyPresses
        } else {
            keyPresses.push(last)
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
        if (command === 'downWithArrowRight') {
            commandUnit = 'ArrowRight'
        } else {
            commandUnit = 'ArrowLeft'
        }
        if (lineText[0] === '+' || lineText[0] === '-') {
            return Array(lineText.length).fill(commandUnit)
        } else {
            return Array(lineText.length + 1).fill(commandUnit)
        }
    }
}
