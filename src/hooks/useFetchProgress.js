import { useState, useCallback } from "react";

const useFetchProgress = () => {
  const [progress, setProgress] = useState(0);

  const trackFetchProgress = useCallback(async (fetchFunction, onProgress) => {
    setProgress(0);

    // Simulate progress based on fetch stages
    const progressStages = [
      { stage: "init", progress: 10 },
      { stage: "connecting", progress: 30 },
      { stage: "fetching", progress: 60 },
      { stage: "processing", progress: 90 },
      { stage: "complete", progress: 100 },
    ];

    let currentStage = 0;

    const updateProgress = (stage) => {
      const stageData = progressStages.find((s) => s.stage === stage);
      if (stageData) {
        setProgress(stageData.progress);
        onProgress?.(stageData.progress, stage);
      }
    };

    try {
      // Stage 1: Init
      updateProgress("init");
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Stage 2: Connecting
      updateProgress("connecting");
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Stage 3: Fetching
      updateProgress("fetching");
      const result = await fetchFunction();

      // Stage 4: Processing
      updateProgress("processing");
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Stage 5: Complete
      updateProgress("complete");

      return result;
    } catch (error) {
      // Nếu có lỗi, vẫn set progress về 0
      setProgress(0);
      throw error;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  return {
    progress,
    trackFetchProgress,
    resetProgress,
    setProgress,
  };
};

export default useFetchProgress;
