import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import documentsApi from '../api/documents.api';
import StatusBadge from '../components/common/StatusBadge';
import SkeletonRow from '../components/common/SkeletonRow';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';

/**
 * Generic list page reused for Drafts / Published / Scheduled / Archived
 * via the `status` prop (see routes/index.jsx).
 */
export default function DocumentList({ status, title }) {
  const { pushToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    const res = search
      ? await documentsApi.search(search, { status, page })
      : await documentsApi.list({ status, page, limit: 15 });
    setItems(res.data);
    setTotalPages(res.meta?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const handleDelete = async () => {
    try {
      await documentsApi.remove(confirmDeleteId);
      pushToast('Document deleted');
      setConfirmDeleteId(null);
      load();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleDuplicate = async (id) => {
    await documentsApi.duplicate(id);
    pushToast('Document duplicated');
    load();
  };

  return (
    <div className="container-fluid editor-shell py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{title}</h4>
        <form className="d-flex gap-2" onSubmit={handleSearch}>
          <input className="form-control" placeholder="Search titles, tags..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-outline-secondary" type="submit">Search</button>
        </form>
      </div>

      <div className="editor-card p-3">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th>Title</th><th>Status</th><th>Words</th><th>Reading time</th><th>Updated</th><th /></tr></thead>
            <tbody>
              {loading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
              {!loading && items.map((doc) => (
                <tr key={doc._id}>
                  <td><Link to={`/editor/${doc._id}`}>{doc.title}</Link></td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td>{doc.stats?.wordCount ?? 0}</td>
                  <td>{doc.stats?.readingTimeMinutes ?? 1} min</td>
                  <td>{new Date(doc.updatedAt).toLocaleDateString()}</td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" onClick={() => handleDuplicate(doc._id)}>Duplicate</button>
                      <button className="btn btn-outline-danger" onClick={() => setConfirmDeleteId(doc._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="text-center text-secondary py-4">Nothing here yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination pagination-sm mb-0">
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete document?"
          message="This document will be moved to trash (soft delete) and can be recovered by an admin."
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
