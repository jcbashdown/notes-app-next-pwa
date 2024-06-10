import { Reporter, TestResult, TestCase } from '@playwright/test/reporter'

class CustomReporter implements Reporter {
    constructor() {
        process.env.ALL_TESTS_PASSED = 'true'
    }

    onTestEnd(test: TestCase, result: TestResult) {
        if (result.status !== 'passed') {
            process.env.ALL_TESTS_PASSED = 'false'
        }
    }
}

export default CustomReporter
