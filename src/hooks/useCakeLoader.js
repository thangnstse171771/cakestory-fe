import { useState, useCallback } from "react";

const useCakeLoader = (initialLoadingText = "Đang tải dữ liệu...") => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(initialLoadingText);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(
    (text = initialLoadingText) => {
      setLoadingText(text);
      setIsLoading(true);
      setProgress(0);
    },
    [initialLoadingText]
  );

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((newProgress) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  }, []);

  const withLoading = useCallback(
    async (asyncFunction, loadingMessage = initialLoadingText) => {
      startLoading(loadingMessage);

      try {
        const result = await asyncFunction();
        setProgress(100);
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, initialLoadingText]
  );

  return {
    isLoading,
    loadingText,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    withLoading,
  };
};

export default useCakeLoader;
