import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsFileEarmarkText, BsCheckCircle, BsClock, BsArchive, BsPencilSquare, BsPlusLg } from 'react-icons/bs';
import documentsApi from '../api/documents.api';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import SkeletonRow from '../components/common/SkeletonRow';

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [countsRes, recentRes] = await Promise.all([
        documentsApi.dashboard(),
        documentsApi.list({ limit: 8, sortBy: 'updatedAt', sortDir: 'desc' }),
      ]);
      setCounts(countsRes.data);
      setRecent(recentRes.data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container-fluid editor-shell py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Content Dashboard</h3>
        <Link to="/editor/new" className="btn btn-editor-primary"><BsPlusLg className="me-1" /> New Content</Link>
      </div>

<div className="row g-3 mb-4">
  <StatCard icon={<BsFileEarmarkText />} label="Drafts" value={counts?.draft ?? 0} />
  <StatCard icon={<BsCheckCircle />} label="Published" value={counts?.published ?? 0} />
  <StatCard icon={<BsClock />} label="Scheduled" value={counts?.scheduled ?? 0} />
  <StatCard icon={<BsArchive />} label="Archived" value={counts?.archived ?? 0} />
</div>

      <div className="editor-card p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <BsPencilSquare />
          <h5 className="mb-0">Recently Edited</h5>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th>Title</th><th>Status</th><th>Words</th><th>Updated</th><th /></tr></thead>
            <tbody>
{!loading && recent?.map((doc) => (
  <tr key={doc._id}>
    <td>{doc.title}</td>
    <td><StatusBadge status={doc.status} /></td>
    <td>{doc.stats?.wordCount ?? 0}</td>
    <td>{new Date(doc.updatedAt).toLocaleString()}</td>
    <td>
      <Link to={`/editor/${doc._id}`} className="btn btn-sm btn-outline-secondary">
        Open
      </Link>
    </td>
  </tr>
))}

{!loading && (recent?.length ?? 0) === 0 && (
  <tr>
    <td colSpan={5} className="text-center text-secondary py-4">
      No content yet. Create your first document.
    </td>
  </tr>
)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
