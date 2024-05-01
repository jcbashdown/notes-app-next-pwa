import { render } from '@testing-library/react'
import Index from '@/app/page'

it('renders homepage unchanged', () => {
    const { container } = render(<Index />)
    expect(container).toMatchSnapshot()
})
