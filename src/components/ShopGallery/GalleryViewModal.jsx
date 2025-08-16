import React, { useState, useEffect } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";

const GalleryViewModal = ({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onEdit,
  onDelete,
  isOwner = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentImageIndex(currentIndex);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "+":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentImageIndex]);

  const handlePrevious = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    resetImageTransform();
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    resetImageTransform();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetImageTransform = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    if (!images[currentImageIndex]) return;

    try {
      const response = await fetch(
        images[currentImageIndex].image || images[currentImageIndex].images
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gallery-${images[currentImageIndex].title || "image"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const currentImage = images[currentImageIndex];

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold">{currentImage.title}</h3>
            <span className="text-sm text-gray-300">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Zoom Out (-)  "
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn size={20} />
            </button>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Rotate"
            >
              <RotateCw size={20} />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Download"
            >
              <Download size={20} />
            </button>

            {/* Owner Actions */}
            {isOwner && (
              <>
                <div className="w-px h-6 bg-white/30 mx-2" />
                <button
                  onClick={() => onEdit?.(currentImage)}
                  className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-full transition-colors"
                  title="Edit"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => onDelete?.(currentImage)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}

            <div className="w-px h-6 bg-white/30 mx-2" />

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            title="Previous (Arrow Left)"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            title="Next (Arrow Right)"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="flex-1 flex items-center justify-center p-20 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage.image || currentImage.images}
          alt={currentImage.title}
          className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${
              position.x / zoom
            }px, ${position.y / zoom}px)`,
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
          draggable={false}
        />
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-6">
        <div className="text-center text-white">
          <p className="text-sm text-gray-300">
            Sử dụng phím mũi tên để điều hướng • +/- để zoom • ESC để đóng
          </p>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl p-3">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index);
                  resetImageTransform();
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? "border-white scale-110"
                    : "border-transparent hover:border-white/50"
                }`}
              >
                <img
                  src={img.image || img.images}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryViewModal;
