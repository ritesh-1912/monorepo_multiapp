'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '40vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h2>
      <button
        type="button"
        onClick={reset}
        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
