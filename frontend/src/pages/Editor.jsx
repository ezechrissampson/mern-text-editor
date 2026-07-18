import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../components/editor/RichTextEditor';
import useDocument from '../hooks/useDocument';
import useAutosave, { SAVE_STATUS } from '../hooks/useAutosave';
import documentsApi from '../api/documents.api';
import { useToast } from '../components/common/Toast';

const SAVE_LABEL = {
  [SAVE_STATUS.IDLE]: '',
  [SAVE_STATUS.SAVING]: 'Saving…',
  [SAVE_STATUS.SAVED]: 'All changes saved',
  [SAVE_STATUS.ERROR]: 'Autosave failed',
  [SAVE_STATUS.CONFLICT]: 'Conflict detected',
};

/**
 * `onRequestMedia` here is where the HOST APPLICATION plugs in its
 * existing Media Manager - e.g. open a modal/route that returns the
 * selected asset's URL. This module never uploads files itself.
 */
export default function EditorPage({ onRequestMedia }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const isNew = !id || id === 'new';

  const { document: doc, setDocument } = useDocument(isNew ? null : id);
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [json, setJson] = useState(null);

  const getPayload = useCallback(() => ({ title, contentHtml: html, contentJson: json, clientVersion: doc?.currentRevision }), [title, html, json, doc]);

  const { status, saveNow } = useAutosave({
    documentId: isNew ? null : id,
    getPayload,
    enabled: !isNew,
  });

  const handleSavePublish = async (nextStatus) => {
    try {
      if (isNew) {
        const res = await documentsApi.create({ title, contentHtml: html, contentJson: json, status: nextStatus });
        pushToast('Document created');
        navigate(`/editor/${res.data._id}`);
      } else {
        const res = await documentsApi.update(id, { title, contentHtml: html, contentJson: json, ...(nextStatus ? { status: nextStatus } : {}) });
        setDocument(res.data);
        pushToast('Document saved');
      }
    } catch (err) {
      pushToast(err.message || 'Save failed', 'error');
    }
  };

  return (
    <div className="container-fluid editor-shell py-4">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <input
          className="form-control form-control-lg border-0 bg-transparent fw-semibold"
          style={{ maxWidth: 600 }}
          placeholder="Document title..."
          value={title || doc?.title || ''}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small">{SAVE_LABEL[status]}</span>
          <button className="btn btn-outline-secondary" onClick={() => handleSavePublish()}>Save Draft</button>
          <button className="btn btn-editor-primary" onClick={() => handleSavePublish('published')}>Publish</button>
        </div>
      </div>

      <RichTextEditor
        content={doc?.contentHtml || ''}
        onChange={(nextHtml, nextJson) => { setHtml(nextHtml); setJson(nextJson); }}
        onRequestMedia={onRequestMedia}
        placeholder="Start writing, or press '/' for commands..."
      />
    </div>
  );
}
