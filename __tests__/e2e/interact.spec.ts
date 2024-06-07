import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import e2eTestFixture from '@/fixtures/e2e-test-fixture.json'

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

//We don't really want deterministic ulid code getting into prod...? This approach can't really work because of that
//Or is it okay?

//Interact and then check the generated notes and relationships are what's expected
test('test', async ({ page }) => {
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
    await page.getByPlaceholder('Add a new note...').fill('Newnote')
    await page.getByPlaceholder('Add a new note...').press('Enter')
    await page.getByRole('textbox').nth(1).press('Enter')
    await page.getByRole('textbox').nth(2).fill('+')
    await page.getByRole('textbox').nth(3).fill('This note supports the Newnote topic')
    await page.getByRole('textbox').nth(3).press('Enter')
    await page.locator('li:nth-child(2) > .p-1 > .pl-1').fill('-')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').fill('This not opposes the Newnote topic')
    await page.locator('li:nth-child(2) > .p-1 > input:nth-child(2)').press('Enter')
    await page.locator('li:nth-child(3) > .p-1 > .pl-1').fill('T')
    await page.locator('li:nth-child(3) > .p-1 > input:nth-child(2)').fill('This note is related')
    await page.locator('li:nth-child(3) > .p-1 > input:nth-child(2)').press('Enter')
    await page.locator('li:nth-child(4) > .p-1 > .pl-1').press('Tab')
    await page.locator('li:nth-child(4) > .p-1 > .pl-1').fill('+')
    await page.locator('li:nth-child(4) > .p-1 > input:nth-child(2)').fill('This note supports the related note')
    await page.locator('li:nth-child(4) > .p-1 > input:nth-child(2)').press('Tab')
    await page.locator('li:nth-child(3) > ul > li > .p-1 > input:nth-child(2)').press('ArrowDown')
    await page.locator('div:nth-child(2) > input').fill('This is the rootnote')
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
    await page.getByPlaceholder('Add a new note...').fill('Helloagain!')
    await page.getByPlaceholder('Add a new note...').press('Enter')
    await page.getByRole('textbox').nth(3).click()
    await page.getByRole('textbox').nth(3).click()
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.getByRole('textbox').nth(3).press('ArrowRight')
    await page.getByRole('textbox').nth(3).fill('')
    await page.locator('div:nth-child(2) > input').fill('Newnot')
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
    const downloadFilePath = path.join(__dirname, 'downloads', path.basename(downloadPath))

    // Save the downloaded file to a specific location
    await download.saveAs(downloadFilePath)

    // Read the downloaded file contents
    const fileContents = fs.readFileSync(downloadFilePath, 'utf8')

    // Assert the file contents
    expect(removeIds(JSON.parse(fileContents))).toEqual(removeIds(e2eTestFixture))
})
