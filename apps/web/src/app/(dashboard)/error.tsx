'use client';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', color: '#f1f5f9' }}>
      <h2 style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Page Error</h2>
      <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
        <strong style={{ color: '#f1f5f9' }}>Message:</strong> {error?.message || 'Unknown error'}
      </p>
      {error?.stack && (
        <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
          {error.stack}
        </pre>
      )}
      <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );
}
