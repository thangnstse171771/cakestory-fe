"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CakeLoader({
  isVisible = true,
  onComplete,
  duration = 5000,
  loadingText = "Đang chuẩn bị bánh ngon...",
  autoStart = true,
  externalProgress = null,
}) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (externalProgress !== null) {
      setProgress(externalProgress);
      if (externalProgress >= 100) {
        setIsLoading(false);
        onComplete?.();
      }
      return;
    }
  }, [externalProgress, onComplete]);

  useEffect(() => {
    if (!autoStart || !isVisible || externalProgress !== null) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsLoading(false);
          onComplete?.();
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, duration / 100);

    return () => clearInterval(interval);
  }, [autoStart, isVisible, duration, onComplete, externalProgress]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
      <div className="flex flex-col items-center justify-center text-center">
        {/* Cupcake Container - Fixed centering */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="relative h-48 w-48 flex items-center justify-center">
            {/* Cupcake wrapper - Centered */}
            <div className="absolute bottom-0 h-24 w-32 rounded-b-3xl bg-gradient-to-b from-amber-200 to-amber-400 shadow-lg">
              <div className="absolute inset-2 rounded-b-3xl bg-gradient-to-b from-amber-100 to-amber-300">
                {/* Wrapper pattern */}
                <div className="absolute inset-x-4 top-2 h-1 bg-amber-500 opacity-30 rounded-full"></div>
                <div className="absolute inset-x-4 top-5 h-1 bg-amber-500 opacity-30 rounded-full"></div>
                <div className="absolute inset-x-4 top-8 h-1 bg-amber-500 opacity-30 rounded-full"></div>
              </div>
            </div>

            {/* Cake base - Centered */}
            <div className="absolute bottom-6 h-20 w-28 rounded-t-full bg-gradient-to-b from-yellow-300 to-orange-400 shadow-md">
              <div className="absolute inset-1 rounded-t-full bg-gradient-to-b from-yellow-200 to-orange-300">
                {/* Cake texture */}
                <div className="absolute left-2 top-3 h-2 w-2 rounded-full bg-red-400 opacity-60"></div>
                <div className="absolute right-3 top-5 h-1.5 w-1.5 rounded-full bg-green-400 opacity-60"></div>
                <div className="absolute left-4 top-8 h-1.5 w-1.5 rounded-full bg-blue-400 opacity-60"></div>
                <div className="absolute right-2 top-2 h-1 w-1 rounded-full bg-purple-400 opacity-60"></div>
              </div>
            </div>

            {/* Cream container - Centered */}
            <div className="absolute top-0 h-32 w-24 overflow-hidden">
              {/* Cream flowing effect */}
              <motion.div
                className="absolute bottom-0 w-full bg-gradient-to-t from-pink-200 via-pink-100 to-white rounded-t-full shadow-lg"
                initial={{ height: 0 }}
                animate={{ height: `${(progress / 100) * 128}px` }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                {/* Cream swirl effect */}
                <div className="absolute inset-x-2 top-2 h-full">
                  <motion.div
                    className="h-full w-full rounded-t-full bg-gradient-to-t from-pink-100 to-white opacity-80"
                    animate={{
                      rotate: progress * 3.6,
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      rotate: { duration: 0.1, ease: "linear" },
                      scale: {
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      },
                    }}
                  />
                </div>

                {/* Cream drips */}
                {progress > 20 && (
                  <motion.div
                    className="absolute -bottom-2 left-2 h-4 w-2 rounded-b-full bg-pink-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  />
                )}
                {progress > 40 && (
                  <motion.div
                    className="absolute -bottom-3 right-3 h-6 w-2 rounded-b-full bg-pink-150"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  />
                )}
                {progress > 60 && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-b-full bg-pink-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                  />
                )}
              </motion.div>

              {/* Cherry on top */}
              {progress > 90 && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 transform"
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <div className="h-4 w-4 rounded-full bg-red-500 shadow-md">
                    <div className="absolute -top-1 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-green-600 rounded-full"></div>
                    <div className="absolute -top-0.5 left-1/2 h-1 w-2 -translate-x-1/2 bg-green-500 rounded-full transform rotate-45"></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sparkles - Positioned relative to center */}
            {progress > 30 && (
              <>
                <motion.div
                  className="absolute -top-8 -left-8 text-yellow-400"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                    scale: {
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                >
                  ✨
                </motion.div>
                <motion.div
                  className="absolute -top-4 -right-10 text-pink-400"
                  animate={{
                    rotate: -360,
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                    scale: {
                      duration: 1.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                >
                  ⭐
                </motion.div>
                <motion.div
                  className="absolute top-0 -left-12 text-purple-400"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                    scale: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                >
                  💫
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Progress text */}
        <motion.div
          className="mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            {Math.round(progress)}%
          </div>
          <div className="text-lg text-gray-600 mt-2">{loadingText}</div>
        </motion.div>

        {/* Progress bar */}
        <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 via-pink-500 to-orange-400 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 bg-pink-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
