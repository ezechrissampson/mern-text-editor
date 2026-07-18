import React, { useState } from 'react';

export default function LinkModal({ editor, onClose }) {
  const [href, setHref] = useState(editor.getAttributes('link').href || '');

  const isSafe = (value) => {
    if (!value) return false;
    if (/^\s*(javascript|data|vbscript):/i.test(value)) return false;
    return /^https?:\/\//i.test(value) || value.startsWith('/') || value.startsWith('#') || /^mailto:/i.test(value);
  };

  const apply = () => {
    if (!isSafe(href)) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    onClose();
  };

  const remove = () => {
    editor.chain().focus().unsetLink().run();
    onClose();
  };

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content editor-card">
          <div className="modal-header">
            <h5 className="modal-title">Insert Link</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <input
              type="url"
              className="form-control"
              placeholder="https://example.com"
              value={href}
              onChange={(e) => setHref(e.target.value)}
            />
            {href && !isSafe(href) && <div className="text-danger small mt-1">Unsafe or invalid URL.</div>}
          </div>
          <div className="modal-footer">
            {editor.isActive('link') && <button className="btn btn-outline-danger me-auto" onClick={remove}>Remove link</button>}
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-editor-primary" onClick={apply} disabled={!isSafe(href)}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
