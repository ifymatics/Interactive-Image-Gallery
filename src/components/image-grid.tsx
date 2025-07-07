"use client";

import type { Image } from "@/types";
import ImageCard from "@/components/image-card";

interface ImageGridProps {
  images: Image[];
  onImageClick: (image: Image) => void;
  onAuthRequired: () => void;
}

export default function ImageGrid({
  images,
  onImageClick,
  onAuthRequired,
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onImageClick={onImageClick}
          onAuthRequired={onAuthRequired}
        />
      ))}
    </div>
  );
}
