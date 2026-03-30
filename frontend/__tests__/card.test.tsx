import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Card from '@/components/ui/card';

describe('Card', () => {
  it('renders title', () => {
    render(<Card title="Test Card"/>);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Card><p>Child content</p></Card>);
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(<Card><p>Content</p></Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders action buttons', () => {
    const handleClick = vi.fn();
    render(
      <Card actions={[{ label: 'Click me', method: handleClick }]}/>,
    );

    const button = screen.getByText('Click me');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('defaults action button type to button', () => {
    render(
      <Card actions={[{ label: 'Default' }]}/>,
    );
    expect(screen.getByText('Default')).toHaveAttribute('type', 'button');
  });

  it('sets submit type on action button', () => {
    render(
      <Card actions={[{ label: 'Submit', type: 'submit' }]}/>,
    );
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit');
  });

  it('applies full width class', () => {
    render(
      <Card actions={[{ label: 'Wide', fullWidth: true }]}/>,
    );
    expect(screen.getByText('Wide').className).toContain('w-full');
  });

  it('defaults to md size', () => {
    const { container } = render(<Card/>);
    expect(container.firstChild).toHaveClass('card-md');
  });
});
