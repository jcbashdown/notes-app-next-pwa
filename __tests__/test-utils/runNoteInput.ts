import { Page } from 'playwright'
import KeyPressesFromNoteGenerator, {
    FOCUS_CHANGERS,
    SINGLE_KEYPRESSES,
} from '@/__tests__/test-utils/keyPressesFromNoteGenerator'
//returns the selector for the input with current focus or null
const findFocusInput = async (page: any) => {
    let focusInput = await page.evaluateHandle(() => document.activeElement)
    const tagName = await focusInput.evaluate((node: any) => node.tagName.toLowerCase())

    if (tagName !== 'input' && tagName !== 'textarea') {
        focusInput = null
    }
    return page.locator(':focus')
}
async function getInputId(focusInput: any): Promise<string> {
    return await focusInput?.evaluate((node: any) => node.getAttribute('data-id'))
}
async function loopUntilChangedOrTimeout(fn: Function, currentFocus: any = null) {
    console.log('detecting change')
    const timeout = 3000 // 1 second
    const interval = 100 // check every 100ms
    const startTime = Date.now()

    const currentInputDataId = await getInputId(currentFocus)
    while (Date.now() - startTime < timeout) {
        let result = await fn()
        const newInputDataId = await getInputId(result)

        if (newInputDataId !== currentInputDataId) {
            console.log('selection changed')
            return result
        }

        // Wait for the specified interval before checking again
        await new Promise((resolve) => setTimeout(resolve, interval))
    }

    // Return the existing focus which may be null or may just not have changed
    console.log('selection unchanged')
    return currentFocus
}

export default async function runNoteInput(noteInput: string, page: Page) {
    let focusInput = await loopUntilChangedOrTimeout(async () => await findFocusInput(page))
    const keyPressesFromNoteGenerator = new KeyPressesFromNoteGenerator()
    keyPressesFromNoteGenerator.setNote(noteInput)
    const keyPresses = keyPressesFromNoteGenerator.getKeyPresses()
    for (const keyPress of keyPresses) {
        if (SINGLE_KEYPRESSES.includes(keyPress)) {
            focusInput.press(keyPress)
            console.log('pressed', keyPress)
            //chrome seems to miss keypresses sometimes if you have loads of ArrowRight (or ArrowLeft?) in a row.
            await page.waitForTimeout(5)
        } else if (keyPress !== 'FOCUS') {
            if ((await getInputId(focusInput)).match(/topic/i)) {
                focusInput.fill(keyPress)
                console.log('filled topic', keyPress)
                await page.waitForTimeout(200)
            } else {
                focusInput.pressSequentially(keyPress[0])
                console.log('filled', keyPress[0])
                //The first character may change the focus
                focusInput = await loopUntilChangedOrTimeout(async () => await findFocusInput(page), focusInput)
                focusInput.pressSequentially(keyPress.slice(1))
                console.log('filled', keyPress.slice(1))
                await page.waitForTimeout(200)
            }
        } else {
            focusInput = await loopUntilChangedOrTimeout(async () => await findFocusInput(page), focusInput)
        }
    }
}
