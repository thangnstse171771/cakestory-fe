import React from "react";

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section Skeleton */}
          <div className="space-y-6">
            <div className="aspect-square rounded-3xl bg-gray-200 animate-pulse"></div>
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-8">
            <div>
              <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-2/3 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Price Skeleton */}
            <div className="bg-gray-100 rounded-2xl p-6">
              <div className="w-1/2 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Size Selection Skeleton */}
            <div>
              <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 rounded-xl animate-pulse"
                  ></div>
                ))}
              </div>
            </div>

            {/* Quantity Skeleton */}
            <div>
              <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="w-20 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex gap-4">
              <div className="flex-1 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="w-24 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Total Price Skeleton */}
            <div className="bg-gray-100 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <div className="w-1/3 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/2 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Information Skeleton */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-16">
          <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse mb-6"></div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-32 h-32 bg-gray-200 rounded-2xl animate-pulse"></div>

            <div className="flex-1">
              <div className="w-1/3 h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-32 h-12 bg-gray-200 rounded-xl animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div>
          <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
