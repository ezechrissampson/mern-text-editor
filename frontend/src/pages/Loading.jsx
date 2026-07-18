import React from 'react';

export default function Loading() {
  return (
    <div className="editor-shell d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="spinner-border" style={{ color: 'var(--editor-primary)' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
