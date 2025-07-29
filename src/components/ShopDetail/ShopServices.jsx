import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ShopServices = ({
  services,
  isOwner,
  onEdit,
  onDelete,
  showMenu,
  setShowMenu,
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xl text-pink-500">Our Services</h3>
        <button className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-6 h-8 rounded-lg shadow transition">
          Show all
        </button>
      </div>
      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((product) => {
            // Lấy post object đúng key
            const postObj = product.Post || product.post || {};
            const firstMedia =
              postObj.media && postObj.media.length > 0
                ? postObj.media[0]
                : null;
            const imageUrl =
              firstMedia &&
              firstMedia.image_url &&
              firstMedia.image_url !== "string"
                ? firstMedia.image_url
                : "/placeholder.svg";
            return (
              <div
                key={product.post_id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-w-16 aspect-h-10">
                  <img
                    src={imageUrl}
                    alt={postObj.title}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {isOwner && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="relative">
                        <button
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 shadow-lg transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(
                              showMenu === product.post_id
                                ? null
                                : product.post_id
                            );
                          }}
                          aria-label="More options"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                        {showMenu === product.post_id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl z-30 transform origin-top-right transition-all duration-200 ease-out">
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 rounded-t-xl transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(product);
                                setShowMenu(null);
                              }}
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-b-xl transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(product);
                                setShowMenu(null);
                              }}
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                    {postObj.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 group-hover:text-gray-600">
                    {postObj.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                      ${product.price}
                    </span>
                    {!isOwner && (
                      <button
                        onClick={() => {
                          navigate(`/order/customize/${product.shop_id}`, {
                            state: {
                              shopId: product.shop_id,
                              product: {
                                id: product.post_id,
                                name: postObj.title,
                                description: postObj.description,
                                basePrice: product.price,
                                image: imageUrl,
                              },
                              postDetails: postObj,
                            },
                          });
                        }}
                        className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition-all duration-300 hover:scale-105"
                      >
                        Customize Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-12 text-lg italic bg-white/80 backdrop-blur-sm rounded-xl shadow border border-dashed border-pink-200">
          No products yet. Create your first marketplace post to start selling!
        </div>
      )}
    </div>
  );
};

export default ShopServices;
