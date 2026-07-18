/**
 * Public entry point for consuming this module from a host application.
 *
 *   import {
 *     RichTextEditor,
 *     EditorModuleRoutes,
 *     documentsApi,
 *     useAutosave,
 *   } from '@yourorg/enterprise-editor-module-ui';
 */
export { default as RichTextEditor } from './components/editor/RichTextEditor';
export { default as EditorModuleRoutes } from './routes';
export { default as Dashboard } from './pages/Dashboard';
export { default as DocumentList } from './pages/DocumentList';
export { default as EditorPage } from './pages/Editor';

export { default as documentsApi } from './api/documents.api';
export { default as revisionsApi } from './api/revisions.api';
export { default as autosaveApi } from './api/autosave.api';
export { categoriesApi, tagsApi } from './api/taxonomy.api';
export { default as httpClient } from './api/httpClient';

export { default as useAutosave, SAVE_STATUS } from './hooks/useAutosave';
export { default as useDocument } from './hooks/useDocument';
export { default as useDebounce } from './hooks/useDebounce';

export { ToastProvider, useToast } from './components/common/Toast';
export { default as StatusBadge } from './components/common/StatusBadge';
