import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import e2eTestFixture from '@/fixtures/e2e-test-fixture.json'
import testWithSimpleNoteInput from '@/fixtures/test-with-simple-note-input.json'
import KeyPressesFromNoteGenerator, {
    FOCUS_CHANGERS,
    SINGLE_KEYPRESSES,
} from '@/__tests__/test-utils/keyPressesFromNoteGenerator'

function removeIds(json: any): any {
    if (Array.isArray(json)) {
        return json.map((obj) => removeIds(obj))
    } else if (typeof json === 'object' && json !== null) {
        const { id, ...rest } = json
        const newObj: any = {}
        for (const key in rest) {
            newObj[key] = removeIds(rest[key])
        }
        return newObj
    }
    return json
}

//Interact and then check the generated notes and relationships are what's expected
test('test some random interactions for regressions', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.locator('.space-y-4 > .bg-white > input').press('ArrowDown')

    await page.locator('.pl-1').first().press('ArrowDown')
    await page.locator('li > ul > li > .p-1 > .pl-1').press('ArrowDown')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowUp')
    await page.locator('li > ul > li > .p-1 > input:nth-child(2)').press('ArrowUp')
    await page.locator('input:nth-child(2)').first().press('ArrowUp')
    await page.locator('.space-y-4 > .bg-white > input').press('ArrowUp')
    await page.getByPlaceholder('Add a new note...').fill('New note')
    await page.getByPlaceholder('Add a new note...').press('Enter')
    await page.getByRole('textbox').nth(1).press('Enter')
    await page.getByRole('textbox').nth(2).fill('+')
    await page.getByRole('textbox').nth(3).fill('This note supports the New note topic')
    await page.getByRole('textbox').nth(3).press('Enter')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').fill('-')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').fill('This note opposes the New note topic')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('Enter')
    await page.locator('li:nth-child(3) > .p-1 > .pl-1').fill('T')
    await page.locator('li:nth-child(3) > .p-1 > input:nth-child(2)').fill('This note is related')
    await page.locator('li:nth-child(3) > .p-1 > input:nth-child(2)').press('Enter')
    await page.locator('li:nth-child(4) > .p-1 > .pl-1').press('Tab')
    await page.locator('li:nth-child(4) > .p-1 > .pl-1').fill('+')
    await page.locator('li:nth-child(4) > .p-1 > input:nth-child(2)').fill('This note supports the related note')
    await page.locator('li:nth-child(4) > .p-1 > input:nth-child(2)').press('Tab')
    await page.locator('li:nth-child(3) > ul > li > .p-1 > input:nth-child(2)').press('ArrowDown')
    await page.locator('div:nth-child(2) > input').fill('This is the root note')
    await page.locator('div:nth-child(2) > input').press('ArrowDown')
    await page.locator('.pl-1').first().press('ArrowDown')
    await page.locator('li > ul > li > .p-1 > .pl-1').press('ArrowDown')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').fill('')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').fill('')
    await page.locator('li > ul > li > .p-1 > input:nth-child(2)').press('ArrowUp')
    await page.locator('input:nth-child(2)').first().press('ArrowRight')
    await page.locator('input:nth-child(2)').first().press('ArrowRight')
    await page.locator('input:nth-child(2)').first().fill('')
    await page.locator('.pl-1').first().fill('')
    await page.getByRole('textbox').nth(2).press('ArrowUp')
    await page.locator('.space-y-4 > div > input').first().press('ArrowUp')
    await page.getByPlaceholder('Add a new note...').fill('Hello again!')
    await page.getByPlaceholder('Add a new note...').press('Enter')
    await page.getByRole('textbox').nth(3).click()
    await page.getByRole('textbox').nth(3).click()
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.getByRole('textbox').nth(3).fill('')
    await page.locator('div:nth-child(2) > input').fill('New note')
    await page.locator('.space-y-4 > div > input').first().click()
    await page.getByRole('textbox').nth(2).click()
    await page.click('#menuButton')
    // Set up the download listener
    const [download] = await Promise.all([
        page.waitForEvent('download'), // Wait for the download event
        page.click('#download-note-json'),
    ])
    // Wait for the download to complete
    const downloadPath = await download.path()
    const downloadFilePath = path.join(
        __dirname,
        'downloads/test-some-random-interactions-for-regressions/',
        path.basename(downloadPath)
    )

    // Save the downloaded file to a specific location
    await download.saveAs(downloadFilePath)

    // Read the downloaded file contents
    const fileContents = fs.readFileSync(downloadFilePath, 'utf8')

    // Assert the file contents
    expect(removeIds(JSON.parse(fileContents))).toEqual(removeIds(e2eTestFixture))
})

const simpleNoteInput = `
A new Note|Enter|
    + This note supports "a new Note"
    - This note opposes "a new Note"
        This is related to the opposing note|Tab|
    |Backspace|This note is related to a new Note.`

//returns the selector for the input with current focus or null
const findFocusInput = async (page: any) => {
    let focusInput = await page.evaluateHandle(() => document.activeElement)
    const tagName = await focusInput.evaluate((node: any) => node.tagName.toLowerCase())

    if (tagName !== 'input' && tagName !== 'textarea') {
        focusInput = null
    }
    return page.locator(':focus')
}
async function loopUntilChangedOrTimeout(fn: Function, currentFocus: any = null) {
    console.log('detecting change')
    const timeout = 3000 // 1 second
    const interval = 100 // check every 100ms
    const startTime = Date.now()

    const currentInputDataId = await currentFocus?.evaluate((node: any) => node.getAttribute('data-id'))
    while (Date.now() - startTime < timeout) {
        let result = await fn()
        const newInputDataId = await result?.evaluate((node: any) => node.getAttribute('data-id'))

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

test('test with simple note input', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    let focusInput = await loopUntilChangedOrTimeout(async () => await findFocusInput(page))
    const keyPressesFromNoteGenerator = new KeyPressesFromNoteGenerator()
    keyPressesFromNoteGenerator.setNote(simpleNoteInput)
    const keyPresses = keyPressesFromNoteGenerator.getKeyPresses()
    for (const keyPress of keyPresses) {
        if (SINGLE_KEYPRESSES.includes(keyPress)) {
            focusInput.press(keyPress)
            console.log('pressed', keyPress)
        } else {
            focusInput.press(keyPress[0])
            console.log('filled', keyPress[0])
            //The first character may change the focus
            focusInput = await loopUntilChangedOrTimeout(async () => await findFocusInput(page), focusInput)
            console.log(keyPress.slice(1))
            focusInput.pressSequentially(keyPress.slice(1))
            console.log('filled', keyPress.slice(1))
            await page.waitForTimeout(2000)
        }
        if (FOCUS_CHANGERS.includes(keyPress)) {
            focusInput = await loopUntilChangedOrTimeout(async () => await findFocusInput(page), focusInput)
        }
    }
    //wait for 10 seconds
    await page.click('#menuButton')
    // Set up the download listener
    const [download] = await Promise.all([
        page.waitForEvent('download'), // Wait for the download event
        page.click('#download-note-json'),
    ])
    // Wait for the download to complete
    const downloadPath = await download.path()
    const downloadFilePath = path.join(__dirname, 'downloads/test-with-simple-note-input/', path.basename(downloadPath))

    // Save the downloaded file to a specific location
    await download.saveAs(downloadFilePath)

    // Read the downloaded file contents
    const fileContents = fs.readFileSync(downloadFilePath, 'utf8')

    // Assert the file contents
    expect(removeIds(JSON.parse(fileContents))).toEqual(removeIds(testWithSimpleNoteInput))
})

//TODO - try an alternative approach - use page.keyboard which (with sufficient delay) should keep focus correctly.

const complexNoteInput = `
A new Note
    - This note opposes "a new Note"
        This is related to the opposing note|Tab|upWithArrowLeft|ArrowUp|
    + This note supports "a new Note"|downWithArrowRight|ArrowDown|ArrowDown|
    |Backspace|This note is related to a new Note.
`
