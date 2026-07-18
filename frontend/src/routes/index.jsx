import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import EditorPage from '../pages/Editor';
import DocumentList from '../pages/DocumentList';
import NotFound from '../pages/NotFound';
import Forbidden from '../pages/Forbidden';
import Offline from '../pages/Offline';
import Maintenance from '../pages/Maintenance';

/**
 * Mountable route tree for the Content Editor module. In a host app,
 * nest this under whatever base path the sidebar links to, e.g.
 * <Route path="/content/*" element={<EditorModuleRoutes />} />
 */
export default function EditorModuleRoutes({ onRequestMedia }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/editor/:id" element={<EditorPage onRequestMedia={onRequestMedia} />} />
      <Route path="/drafts" element={<DocumentList status="draft" title="Drafts" />} />
      <Route path="/published" element={<DocumentList status="published" title="Published" />} />
      <Route path="/scheduled" element={<DocumentList status="scheduled" title="Scheduled" />} />
      <Route path="/archived" element={<DocumentList status="archived" title="Archived" />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/offline" element={<Offline />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
