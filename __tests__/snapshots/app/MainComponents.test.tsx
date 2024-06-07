import { render, act } from '@testing-library/react'
import e2eTestFixture from '@/fixtures/e2e-test-fixture.json'
import StoreProvider from '@/app/StoreProvider'
import Menu from '@/components/Menu'
import NoteTopics from '@/components/NoteTopics'

export default function MainComponentsWithFixtureFromE2ETests() {
    return (
        <>
            {/* Menu Section */}
            <Menu />
            {/* Notes List */}
            <div className="space-y-4">
                <NoteTopics />
            </div>
        </>
    )
}

it('renders homepage with e2e fixtures unchanged', async () => {
    const { container } = await act(async () =>
        render(
            <StoreProvider fixture={e2eTestFixture}>
                <MainComponentsWithFixtureFromE2ETests />
            </StoreProvider>
        )
    )
    expect(container).toMatchSnapshot()
})
