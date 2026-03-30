'use client';

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card w-96 bg-base-200 shadow-md">
        <div className="card-body text-center">
          <h2 className="card-title justify-center">Something went wrong</h2>
          <p className="text-sm opacity-70">{error.message}</p>
          <div className="card-actions justify-center mt-4">
            <button className="btn btn-primary" onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
