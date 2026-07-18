import React, { useState } from 'react';

/**
 * Images are NEVER uploaded here - only inserted by URL, either pasted
 * directly or selected from the host app's existing Media Library.
 *
 * `onRequestMedia` (optional prop, supplied by the host application) opens
 * ITS media picker UI and should resolve to a URL string, e.g.:
 *   <RichTextEditor onRequestMedia={() => hostApp.openMediaLibrary()} />
 * If not provided, this modal falls back to a plain "paste URL" flow.
 */
export default function ImagePickerModal({ onClose, onInsert, onRequestMedia }) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [align, setAlign] = useState('center');
  const [error, setError] = useState('');

  const isValidUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleBrowseMedia = async () => {
    if (!onRequestMedia) return;
    const selectedUrl = await onRequestMedia();
    if (selectedUrl) setUrl(selectedUrl);
  };

  const handleInsert = () => {
    if (!isValidUrl(url)) {
      setError('Please enter a valid http(s) image URL.');
      return;
    }
    onInsert({ url, alt, caption, align });
  };

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content editor-card">
          <div className="modal-header">
            <h5 className="modal-title">Insert Image</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {onRequestMedia && (
              <button type="button" className="btn btn-editor-primary w-100 mb-3" onClick={handleBrowseMedia}>
                Browse Media Library
              </button>
            )}
            <div className="mb-2">
              <label className="form-label small">Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://cdn.example.com/media/photo.jpg"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
              />
              {error && <div className="text-danger small mt-1">{error}</div>}
            </div>
            {url && isValidUrl(url) && (
              <img src={url} alt="preview" className="img-fluid rounded mb-2 border" style={{ maxHeight: 180 }} />
            )}
            <div className="mb-2">
              <label className="form-label small">Alt text</label>
              <input type="text" className="form-control" value={alt} onChange={(e) => setAlt(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label small">Caption</label>
              <input type="text" className="form-control" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label small">Alignment</label>
              <select className="form-select" value={align} onChange={(e) => setAlign(e.target.value)}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="full">Full width</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-editor-primary" onClick={handleInsert}>Insert Image</button>
          </div>
        </div>
      </div>
    </div>
  );
}
