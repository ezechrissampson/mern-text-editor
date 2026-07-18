import React from 'react';

export default function StatusBadge({ status }) {
  return <span className={`badge rounded-pill badge-status-${status}`}>{status}</span>;
}
