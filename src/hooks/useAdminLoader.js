import { useState, useCallback } from "react";
import useCakeLoader from "./useCakeLoader";
import useFetchProgress from "./useFetchProgress";

const useAdminLoader = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const cakeLoader = useCakeLoader("Đang tải dữ liệu...");
  const fetchProgress = useFetchProgress();

  const startTableLoading = useCallback(() => {
    setTableLoading(true);
  }, []);

  const stopTableLoading = useCallback(() => {
    setTableLoading(false);
  }, []);

  const startDeleteLoading = useCallback((id) => {
    setDeleteLoading((prev) => ({ ...prev, [id]: true }));
  }, []);

  const stopDeleteLoading = useCallback((id) => {
    setDeleteLoading((prev) => ({ ...prev, [id]: false }));
  }, []);

  const startActionLoading = useCallback(() => {
    setActionLoading(true);
  }, []);

  const stopActionLoading = useCallback(() => {
    setActionLoading(false);
  }, []);

  const withTableLoading = useCallback(
    async (asyncFunction) => {
      startTableLoading();
      try {
        const result = await asyncFunction();
        return result;
      } finally {
        stopTableLoading();
      }
    },
    [startTableLoading, stopTableLoading]
  );

  const withDeleteLoading = useCallback(
    async (id, asyncFunction) => {
      startDeleteLoading(id);
      try {
        const result = await asyncFunction();
        return result;
      } finally {
        stopDeleteLoading(id);
      }
    },
    [startDeleteLoading, stopDeleteLoading]
  );

  const withActionLoading = useCallback(
    async (asyncFunction) => {
      startActionLoading();
      try {
        const result = await asyncFunction();
        return result;
      } finally {
        stopActionLoading();
      }
    },
    [startActionLoading, stopActionLoading]
  );

  // Enhanced withLoading with progress tracking
  const withLoadingAndProgress = useCallback(
    async (asyncFunction, loadingMessage = "Đang tải dữ liệu...") => {
      cakeLoader.startLoading(loadingMessage);

      try {
        const result = await fetchProgress.trackFetchProgress(
          asyncFunction,
          (progress, stage) => {
            cakeLoader.updateProgress(progress);
          }
        );
        return result;
      } finally {
        cakeLoader.stopLoading();
      }
    },
    [cakeLoader, fetchProgress]
  );

  return {
    // Cake loader
    ...cakeLoader,

    // Fetch progress
    ...fetchProgress,

    // Table loading
    tableLoading,
    startTableLoading,
    stopTableLoading,
    withTableLoading,

    // Delete loading
    deleteLoading,
    startDeleteLoading,
    stopDeleteLoading,
    withDeleteLoading,

    // Action loading
    actionLoading,
    startActionLoading,
    stopActionLoading,
    withActionLoading,

    // Enhanced loading with progress
    withLoadingAndProgress,
  };
};

export default useAdminLoader;
