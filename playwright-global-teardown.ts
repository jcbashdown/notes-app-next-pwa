import fs from 'fs'
import path from 'path'

export default async function globalTeardown() {
    if (process.env.ALL_TESTS_PASSED === 'true') {
        console.log('All tests have passed! Running teardown logic...')
        // Your custom logic here
        //copy the most resent file in the downloads folder to the e2e test fixture
        //TODO - think harder about this. If we are here then all tests have passed which means nothing except ids has changed vs the fixture
        //At most, we might want a -u style option which automatically updates the fixture from the result when we know the fixture is now wrong
        //But that's probably overkill at this stage
        //const mostRecentFile = getMostRecentFile(path.join(__dirname, '__tests__/e2e/downloads'))
        //if (mostRecentFile) {
        //const destinationPath = path.join(path.join(__dirname, 'fixtures'), 'e2e-test-fixture.json')
        //console.log(mostRecentFile, destinationPath)
        //fs.copyFileSync(mostRecentFile, destinationPath)
        //console.log(`Copied ${mostRecentFile} to ${destinationPath}`)
        //} else {
        //console.log('The directory is empty.')
        //}
        //empty the downloads directory
        //fs.rmSync(path.join(__dirname, '__tests__/e2e/downloads/'), { recursive: true })
    } else {
        console.log('Some tests failed. Skipping teardown logic.')
    }
}

function getMostRecentFile(directory: string): string | null {
    const files = fs.readdirSync(directory)

    if (files.length === 0) {
        return null
    }

    const fileStats = files.map((file) => {
        const filePath = path.join(directory, file)
        const stats = fs.statSync(filePath)
        return { filePath, mtime: stats.mtime }
    })

    fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    return fileStats[0].filePath
}
