import React, { useState } from 'react';
import { detectProvider, toEmbedUrl } from '../../../constants/embedProviders';

export default function EmbedModal({ onClose, onInsert }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleInsert = () => {
    const provider = detectProvider(url);
    if (!provider) {
      setError('URL must be from a supported provider (YouTube, Vimeo, Twitter/X, GitHub Gist, CodePen, Spotify, Google Maps).');
      return;
    }
    onInsert({ src: toEmbedUrl(url, provider), provider, title: `${provider} embed` });
  };

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content editor-card">
          <div className="modal-header">
            <h5 className="modal-title">Embed Content</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="form-label small">Paste a URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
            />
            {error && <div className="text-danger small mt-2">{error}</div>}
            <div className="form-text mt-2">
              Supported: YouTube, Vimeo, Twitter/X, GitHub Gist, CodePen, Spotify, Google Maps.
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-editor-primary" onClick={handleInsert}>Insert Embed</button>
          </div>
        </div>
      </div>
    </div>
  );
}
