import { render, act } from '@testing-library/react'
import Home from '@/app/page'

it('renders homepage unchanged', async () => {
    const { container } = await act(async () => render(<Home />))
    expect(container).toMatchSnapshot()
})
