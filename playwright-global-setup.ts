import fs from 'fs'
import path from 'path'

export default async function globalTeardown() {
    //return early if no downloads dir
    if (!fs.existsSync(path.join(__dirname, '__tests__/e2e/downloads/'))) {
        return
    }
    fs.rmSync(path.join(__dirname, '__tests__/e2e/downloads/'), { recursive: true })
}
