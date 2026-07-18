import React from 'react';

export default function StatCard({ icon, label, value, colorClass = 'text-editor-primary' }) {
  return (
    <div className="col-6 col-md-4 col-lg-3">
      <div className="editor-card p-3 h-100">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className={`fs-4 ${colorClass}`}>{icon}</span>
          <span className="text-secondary small">{label}</span>
        </div>
        <div className="fs-3 fw-semibold">{value}</div>
      </div>
    </div>
  );
}
