import React from 'react';

export default function SkeletonRow() {
  return (
    <tr aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <td key={i}><div className="placeholder-glow"><span className="placeholder col-8" /></div></td>
      ))}
    </tr>
  );
}
