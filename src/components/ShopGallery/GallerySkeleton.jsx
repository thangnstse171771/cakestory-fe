import React from "react";

const GallerySkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative h-64 rounded-2xl overflow-hidden bg-gray-200 animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />

          {/* Content Skeleton */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-4 bg-white/30 rounded mb-2" />
            <div className="h-3 bg-white/20 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GallerySkeleton;
