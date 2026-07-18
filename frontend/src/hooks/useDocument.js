import { useCallback, useEffect, useState } from 'react';
import documentsApi from '../api/documents.api';

export default function useDocument(documentId) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(Boolean(documentId));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const res = await documentsApi.getOne(documentId);
      setDocument(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { document, loading, error, refetch, setDocument };
}
