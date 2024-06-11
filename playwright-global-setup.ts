import fs from 'fs'
import path from 'path'

export default async function globalTeardown() {
    fs.rmSync(path.join(__dirname, '__tests__/e2e/downloads/'), { recursive: true })
}
