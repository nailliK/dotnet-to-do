'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Card from '@/components/ui/card';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card
        title="Login"
        actions={[{ label: 'Sign In', type: 'submit', style: 'primary', fullWidth: true }]}
      >
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="form-control">
          <label className="label" htmlFor="login-username">
            <span className="label-text">Username</span>
          </label>
          <input
            id="login-username"
            name="username"
            type="text"
            className="input input-bordered w-full"
            required
            minLength={3}
            maxLength={50}
          />
        </div>
        <div className="form-control mt-2">
          <label className="label" htmlFor="login-password">
            <span className="label-text">Password</span>
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            className="input input-bordered w-full"
            required
            minLength={8}
          />
        </div>
      </Card>
      <p className="text-center mt-4 text-sm">
        Don&apos;t have an account? <br/>
        <a href="/register" className="link link-primary">
          Register
        </a>
      </p>
    </form>
  );
}
