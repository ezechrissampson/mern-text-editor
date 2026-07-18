import React from 'react';

export default function Offline() {
  return (
    <div className="editor-shell d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <h1 className="fw-bold">You're offline</h1>
      <p className="text-secondary">Changes will sync once your connection is restored. Autosaved drafts are safe.</p>
    </div>
  );
}
