import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

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
    expect(fileContents).toContain('Expected content in the file')
})
