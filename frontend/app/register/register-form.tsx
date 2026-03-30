'use client';

import {signIn} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import Card from '@/components/ui/card';

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({userName: username, password}),
    });

    if (!res.ok) {
      try {
        const data = await res.json();
        setError(data.errors ? Object.values(data.errors).flat().join(', ') : data.title || 'Registration failed');
      } catch {
        setError('Registration failed');
      }
      return;
    }

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Registered but failed to sign in');
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card
        title="Register"
        actions={[{label: 'Create Account', type: 'submit', style: 'primary', fullWidth: true}]}
      >
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="form-control">
          <label className="label" htmlFor="register-username">
            <span className="label-text">Username</span>
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            className="input input-bordered w-full"
            required
            minLength={3}
            maxLength={50}
          />
        </div>
        <div className="form-control mt-2">
          <label className="label" htmlFor="register-password">
            <span className="label-text">Password</span>
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            className="input input-bordered w-full"
            required
            minLength={8}
          />
        </div>
      </Card>
      <p className="text-center mt-4 text-sm">
        Already have an account? <br/>
        <a href="/login" className="link link-primary">
          Log in
        </a>
      </p>
    </form>
  );
}
