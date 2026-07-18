import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import EditorModuleRoutes from './routes';
import { ToastProvider } from './components/common/Toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/theme.css';

/**
 * Standalone shell for local development of this module. When embedding
 * into a host application, use <EditorModuleRoutes /> directly inside
 * the host's own <BrowserRouter> instead of this App wrapper.
 */
export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <EditorModuleRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}
