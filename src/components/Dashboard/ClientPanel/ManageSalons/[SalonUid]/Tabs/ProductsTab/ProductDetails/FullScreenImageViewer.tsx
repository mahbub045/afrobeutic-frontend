import { FullScreenImageViewerProps } from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import { ChevronLeft, ChevronRight, LoaderPinwheel, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  isOpen,
  images,
  currentImageIndex,
  onClose,
  onImageChange,
  productName = "Product",
}) => {
  const [isImageLoading, setIsImageLoading] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsImageLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handlePreviousImage = React.useCallback(() => {
    if (currentImageIndex > 0) {
      onImageChange(currentImageIndex - 1);
      setIsImageLoading(true);
    }
  }, [currentImageIndex, onImageChange]);

  const handleNextImage = React.useCallback(() => {
    if (currentImageIndex < images.length - 1) {
      onImageChange(currentImageIndex + 1);
      setIsImageLoading(true);
    }
  }, [currentImageIndex, images.length, onImageChange]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePreviousImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePreviousImage, handleNextImage, onClose]);

  const currentImage =
    images.length > 0
      ? images[Math.min(currentImageIndex, images.length - 1)]
      : undefined;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:outline-none"
        aria-label="Close fullscreen"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main image container */}
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {currentImage ? (
          <div className="relative h-full w-full">
            <Image
              src={currentImage}
              alt={`${productName}-fullscreen-${currentImageIndex}`}
              fill
              className="h-full w-full object-contain"
              onLoadingComplete={() => setIsImageLoading(false)}
              quality={100}
              priority
            />

            {/* Loading spinner */}
            {isImageLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
                <LoaderPinwheel className="text-primary h-10 w-10 animate-spin" />
              </div>
            )}

            {/* Previous button */}
            {currentImageIndex > 0 && (
              <button
                type="button"
                aria-label="Previous image"
                onClick={handlePreviousImage}
                className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30 focus:outline-none"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Next button */}
            {currentImageIndex < images.length - 1 && (
              <button
                type="button"
                aria-label="Next image"
                onClick={handleNextImage}
                className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30 focus:outline-none"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        ) : (
          <div className="text-lg text-white/70">No image</div>
        )}
      </div>

      {/* Image counter */}
      <div className="border-t border-white/10 bg-black/50 px-6 py-3 text-center text-sm text-white/70">
        {currentImageIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default FullScreenImageViewer;
