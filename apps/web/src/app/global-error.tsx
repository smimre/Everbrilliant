'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#0f172a', color: '#f1f5f9' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: '4rem' }}>
          <h1 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem' }}>Application Error</h1>
          <p style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>
            <strong style={{ color: '#f1f5f9' }}>Message:</strong> {error?.message || 'Unknown error'}
          </p>
          {error?.digest && (
            <p style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>
              <strong style={{ color: '#f1f5f9' }}>Digest:</strong> {error.digest}
            </p>
          )}
          {error?.stack && (
            <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
              {error.stack}
            </pre>
          )}
          <button onClick={reset} style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
