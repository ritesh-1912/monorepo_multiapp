import Link from 'next/link';

export default function NotFound() {
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>404</h1>
      <p>This page could not be found.</p>
      <Link href="/" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
        Back to home
      </Link>
    </div>
  );
}
