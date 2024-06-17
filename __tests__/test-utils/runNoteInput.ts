import { Page } from 'playwright'
import KeyPressesFromNoteGenerator, { SINGLE_KEYPRESSES } from '@/__tests__/test-utils/keyPressesFromNoteGenerator'
//TODO - this should be a class now
let currentInputDataId = ''
//returns the selector for the input with current focus or null
const findFocusInput = async (page: any) => {
    let focusInput = page.locator(':focus')
    const tagName = await focusInput.evaluate((node: any) => node.tagName.toLowerCase())

    if (tagName !== 'input' && tagName !== 'textarea') {
        focusInput = null
    }
    return focusInput
}
async function getInputId(focusInput: any): Promise<string> {
    return await focusInput?.evaluate((node: any) => node.getAttribute('data-id'))
}
async function loopUntilChangedOrTimeout(currentFocus: any = null): Promise<boolean> {
    console.log('detecting change')
    const timeout = 3000 // 1 second
    const interval = 100 // check every 100ms
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
        const newInputDataId = await getInputId(currentFocus)

        if (newInputDataId !== currentInputDataId) {
            currentInputDataId = newInputDataId
            console.log('selection changed')
            return true
        }

        // Wait for the specified interval before checking again
        await new Promise((resolve) => setTimeout(resolve, interval))
    }

    // Return the existing focus which may be null or may just not have changed
    console.log('selection unchanged')
    return false
}

export default async function runNoteInput(noteInput: string, page: Page) {
    const focusInput = await findFocusInput(page)
    await loopUntilChangedOrTimeout(focusInput)
    const keyPressesFromNoteGenerator = new KeyPressesFromNoteGenerator()
    keyPressesFromNoteGenerator.setNote(noteInput)
    const keyPresses = keyPressesFromNoteGenerator.getKeyPresses()
    for (const keyPress of keyPresses) {
        if (SINGLE_KEYPRESSES.includes(keyPress)) {
            focusInput.press(keyPress)
            console.log('pressed', keyPress)
            //chrome seems to miss keypresses sometimes if you have loads of ArrowRight (or ArrowLeft?) in a row.
            await page.waitForTimeout(20)
        } else if (keyPress !== 'FOCUS') {
            if ((await getInputId(focusInput)).match(/topic/i)) {
                focusInput.fill(keyPress)
                console.log('filled topic', keyPress)
                await page.waitForTimeout(200)
            } else {
                focusInput.pressSequentially(keyPress[0])
                console.log('filled', keyPress[0])
                //The first character may change the focus
                await loopUntilChangedOrTimeout(focusInput)
                focusInput.pressSequentially(keyPress.slice(1))
                console.log('filled', keyPress.slice(1))
                await page.waitForTimeout(200)
            }
        } else {
            await loopUntilChangedOrTimeout(focusInput)
        }
    }
}
