import React from 'react';
import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="editor-shell d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <h1 className="display-4 fw-bold">403</h1>
      <p className="text-secondary">You don't have permission to view this content.</p>
      <Link to="/" className="btn btn-editor-primary">Back to Dashboard</Link>
    </div>
  );
}
