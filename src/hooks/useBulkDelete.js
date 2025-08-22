import { useCallback, useMemo, useState } from 'react';
import bulkDeleteApi from '../utils/bulkDeleteApi';

// Maps contentType to api method
const apiMap = {
  posts: bulkDeleteApi.deletePosts,
  cards: bulkDeleteApi.deleteCards,
  'table-posts': bulkDeleteApi.deleteTablePosts,
  'table-structures': bulkDeleteApi.deleteTableStructures,
  categories: bulkDeleteApi.deleteCategories,
  subcategories: bulkDeleteApi.deleteSubcategories,
  'social-media': bulkDeleteApi.deleteSocialMedia,
  'header-components': bulkDeleteApi.deleteHeaderComponents,
};

export default function useBulkDelete(
  contentType,
  onSuccess,
  onError
) {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = useCallback((id) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids) => {
    setSelectedItems(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback((id) => selectedItems.has(id), [selectedItems]);

  const selectedCount = useMemo(() => selectedItems.size, [selectedItems]);

  const performBulkDelete = useCallback(async (overrideType) => {
    const type = overrideType || contentType;
    const apiFn = apiMap[type];
    if (!apiFn) {
      onError?.({ message: `Unsupported content type: ${type}` });
      return;
    }
    const ids = Array.from(selectedItems);
    if (ids.length === 0) return;

    setIsLoading(true);
    try {
      const result = await apiFn(ids);
      onSuccess?.(result, ids);
      clearSelection();
    } catch (err) {
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, selectedItems, onSuccess, onError, clearSelection]);

  return {
    selectedItems,
    selectedCount,
    isLoading,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    performBulkDelete,
  };
}
