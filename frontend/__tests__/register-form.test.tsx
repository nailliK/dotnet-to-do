import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from '@/app/register/register-form';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSignIn = vi.fn();
const mockFetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('renders username and password fields', () => {
    render(<RegisterForm/>);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders create account button', () => {
    render(<RegisterForm/>);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<RegisterForm/>);
    expect(screen.getByText('Log in')).toHaveAttribute('href', '/login');
  });

  it('calls register API then signs in on success', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    mockSignIn.mockResolvedValue({ error: null });
    render(<RegisterForm/>);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userName: 'newuser', password: 'password123' }),
      }));
    });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'newuser',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('redirects to home after successful registration', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    mockSignIn.mockResolvedValue({ error: null });
    render(<RegisterForm/>);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows error when registration fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ title: 'Username already exists' }),
    });
    render(<RegisterForm/>);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existing' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Username already exists');
    });
  });

  it('does not call signIn when registration fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ title: 'Error' }),
    });
    render(<RegisterForm/>);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
