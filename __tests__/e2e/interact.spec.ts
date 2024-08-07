//TODO - try to find missing test cases with playwright coverage
import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import runNoteInput from '@/__tests__/test-utils/runNoteInput'
import e2eTestFixture from '@/fixtures/e2e-test-fixture.json'
import testWithSimpleNoteInput from '@/fixtures/test-with-simple-note-input.json'
import testWithNoteInputWithDeletions from '@/fixtures/test-with-note-input-with-deletions.json'

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

async function uploadFile(page: any, filePath: string) {
    await page.locator('#menuButton').click()
    //await page.getByRole('link', { name: 'Upload notes' }).click()
    const input = page.locator('input[type=file]')
    await input.setInputFiles(path.join(__dirname, filePath))
}

//Interact and then check the generated notes and relationships are what's expected
test('test some random interactions for regressions', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await uploadFile(page, '../../fixtures/notes.json')
    await page.locator('.space-y-4 > .bg-white > input').press('ArrowDown')
    await page.waitForTimeout(100)

    await page.locator('.pl-1').first().press('ArrowDown')
    await page.waitForTimeout(100)
    await page.locator('li > ul > li > .p-1 > .pl-1').press('ArrowDown')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowUp')
    await page.waitForTimeout(100)
    await page.locator('li > ul > li > .p-1 > input:nth-child(2)').press('ArrowUp')
    await page.waitForTimeout(100)
    await page.locator('input:nth-child(2)').first().press('ArrowUp')
    await page.waitForTimeout(100)
    await page.locator('.space-y-4 > .bg-white > input').press('ArrowUp')
    await page.waitForTimeout(100)
    await page.getByPlaceholder('Add a new note...').fill('New note')
    await page.waitForTimeout(100)
    await page.getByPlaceholder('Add a new note...').press('Enter')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(1).press('Enter')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(2).fill('+')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).fill('This note supports the New note topic')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).press('Enter')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').fill('-')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').fill('This note opposes the New note topic')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('Enter')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(3) > .p-1 > .pl-1').fill('T')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(3) > .p-1 > input:nth-child(2)').fill('This note is related')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(3) > .p-1 > input:nth-child(2)').press('Enter')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(4) > .p-1 > .pl-1').press('Tab')

    await page.waitForTimeout(100)
    await page.locator('li:nth-child(4) > .p-1 > .pl-1').fill('+')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(4) > .p-1 > input:nth-child(2)').fill('This note supports the related note')

    await page.waitForTimeout(100)
    await page.locator('li:nth-child(4) > .p-1 > input:nth-child(2)').press('Tab')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(3) > ul > li > .p-1 > input:nth-child(2)').press('ArrowDown')
    await page.waitForTimeout(100)
    await page.locator('div:nth-child(2) > input[type=text]').fill('This is the root note')
    await page.waitForTimeout(100)
    await page.locator('div:nth-child(2) > input[type=text]').press('ArrowDown')
    await page.waitForTimeout(100)
    await page.locator('.pl-1').first().press('ArrowDown')
    await page.waitForTimeout(100)
    await page.locator('li > ul > li > .p-1 > .pl-1').press('ArrowDown')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').fill('')
    await page.waitForTimeout(100)
    //TODO Not sure why...
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').fill('')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').fill('')
    await page.waitForTimeout(100)
    await page.locator('li > ul > li > .p-1 > input:nth-child(2)').press('ArrowUp')
    await page.waitForTimeout(100)
    await page.locator('input:nth-child(2)').first().press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('input:nth-child(2)').first().press('ArrowRight')
    await page.waitForTimeout(100)
    await page.locator('input:nth-child(2)').first().fill('')
    await page.waitForTimeout(100)
    //TODO Not sure why...
    await page.locator('.pl-1').first().fill('')
    await page.locator('.pl-1').first().fill('')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(2).press('ArrowUp')
    await page.waitForTimeout(100)
    await page.locator('.space-y-4 > div > input').first().press('ArrowUp')
    await page.waitForTimeout(100)
    await page.getByPlaceholder('Add a new note...').fill('Hello again!')
    await page.waitForTimeout(100)
    await page.getByPlaceholder('Add a new note...').press('Enter')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).click()
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).click()
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(3).fill('')
    await page.waitForTimeout(100)
    await page.locator('div:nth-child(2) > input[type=text]').fill('New note')
    await page.waitForTimeout(100)
    await page.locator('.space-y-4 > div > input[type=text]').first().click()
    await page.waitForTimeout(100)
    await page.getByRole('textbox').nth(2).click()
    await page.waitForTimeout(100)
    await page.click('#menuButton')
    await page.waitForTimeout(100)
    // Set up the download listener
    await page.waitForTimeout(100)
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

test('test with simple note input', async ({ page }) => {
    test.slow()
    await page.goto('http://localhost:3000/')
    await uploadFile(page, '../../fixtures/notes.json')
    await page.waitForTimeout(500)
    await runNoteInput(simpleNoteInput, page)
    await page.waitForTimeout(500)

    await page.click('#menuButton')
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

//For example...
const aNewNote = 'A new Note'
const thisNoteOpposes = '- This note opposes "a new Note"'
const thisNoteIsRelatedToOpposing = 'This is related to the opposing note'
const thisNoteSupports = '+ This note supports "a new Note"'
const thisNoteIsRelatedToANewNote = 'This note is related to a new Note.'

const complexNoteInput = `
${aNewNote}|Enter|
    ${thisNoteOpposes}
        ${thisNoteIsRelatedToOpposing}|Tab|upWithArrowLeft|ArrowUp|ArrowUp|
    ${thisNoteSupports}|ArrowRight|ArrowDown|
    |Backspace|${thisNoteIsRelatedToANewNote}`

test('test with complex note input', async ({ page }) => {
    test.slow()
    await page.goto('http://localhost:3000/')
    await uploadFile(page, '../../fixtures/notes.json')
    await page.waitForTimeout(500)
    await runNoteInput(complexNoteInput, page)
    await page.waitForTimeout(500)

    await page.click('#menuButton')
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
        'downloads/test-with-complex-note-input/',
        path.basename(downloadPath)
    )

    // Save the downloaded file to a specific location
    await download.saveAs(downloadFilePath)

    // Read the downloaded file contents
    const fileContents = fs.readFileSync(downloadFilePath, 'utf8')

    // Assert the file contents
    expect(
        removeIds(
            JSON.parse(fileContents).sort((a: any, b: any) => {
                if (a.text < b.text) {
                    return -1
                }
                if (a.text > b.text) {
                    return 1
                }
                return 0
            })
        )
    ).toEqual(
        removeIds(
            testWithSimpleNoteInput.sort((a: any, b: any) => {
                if (a.text < b.text) {
                    return -1
                }
                if (a.text > b.text) {
                    return 1
                }
                return 0
            })
        )
    )
})

const deletionsCount =
    thisNoteIsRelatedToANewNote.length +
    thisNoteSupports.length +
    thisNoteIsRelatedToOpposing.length +
    thisNoteOpposes.length +
    6 //for the number of additional backspaces to move from an empty note to the note above via deletion

const aWholeNewNote = 'A whole new note'
const noteInputWithDeletions = `
${aNewNote}|Enter|
    ${thisNoteOpposes}
        ${thisNoteIsRelatedToOpposing}|Tab|upWithArrowLeft|ArrowUp|ArrowUp|
    ${thisNoteSupports}|ArrowRight|ArrowDown|
    |Backspace|${thisNoteIsRelatedToANewNote}|backspaces(${deletionsCount})
    ${aWholeNewNote}`

test('test with note input deletions', async ({ page }) => {
    test.slow()
    await page.goto('http://localhost:3000/')
    await uploadFile(page, '../../fixtures/notes.json')
    await page.waitForTimeout(500)
    await runNoteInput(noteInputWithDeletions, page)
    await page.waitForTimeout(500)

    await page.click('#menuButton')
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
        'downloads/test-with-note-input-with-deletions/',
        path.basename(downloadPath)
    )

    // Save the downloaded file to a specific location
    await download.saveAs(downloadFilePath)

    // Read the downloaded file contents
    const fileContents = fs.readFileSync(downloadFilePath, 'utf8')

    // Assert the file contents
    expect(
        removeIds(
            JSON.parse(fileContents).sort((a: any, b: any) => {
                if (a.text < b.text) {
                    return -1
                }
                if (a.text > b.text) {
                    return 1
                }
                return 0
            })
        )
    ).toEqual(
        removeIds(
            testWithNoteInputWithDeletions.sort((a: any, b: any) => {
                if (a.text < b.text) {
                    return -1
                }
                if (a.text > b.text) {
                    return 1
                }
                return 0
            })
        )
    )
})

//TODO
//- later, ensure upload when already notes present works as expected
//- ensure double upload works as expected
