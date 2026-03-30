import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '@/app/login/login-form';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSignIn = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders username and password fields', () => {
    render(<LoginForm/>);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginForm/>);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<LoginForm/>);
    expect(screen.getByText('Register')).toHaveAttribute('href', '/register');
  });

  it('calls signIn with credentials on submit', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm/>);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'testuser',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('redirects to home on successful login', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm/>);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows error on failed login', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' });
    render(<LoginForm/>);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });
});
