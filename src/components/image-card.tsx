"use client";

import * as React from "react";
import NextImage from "next/image";
import useSWR from "swr";
import type { Image as UnsplashImage } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchLikeCount, hasLiked, likeImage, unlikeImage } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface ImageCardProps {
  image: UnsplashImage;
  onImageClick: (image: UnsplashImage) => void;
  onAuthRequired: () => void;
}

export default function ImageCard({
  image,
  onImageClick,
  onAuthRequired,
}: ImageCardProps) {
  const { user } = useAuth();

  const { data: likeCountData, mutate: mutateLikeCount } = useSWR(
    `/likes/count/${image.id}`,
    () => fetchLikeCount(image.id),
    { revalidateOnFocus: false }
  );

  const { data: hasLikedData, mutate: mutateHasLiked } = useSWR(
    user ? `/likes/has-liked/${image.id}` : null,
    () => hasLiked(image.id),
    { revalidateOnFocus: false }
  );

  // const likeCount = likeCountData?.count ?? 0;
  const isLiked = hasLikedData?.hasLiked ?? false;
  let likeCount = 0;

  if (typeof likeCountData === "number") {
    likeCount = likeCountData;
  } else if (likeCountData && typeof likeCountData.count === "number") {
    likeCount = likeCountData.count;
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Optionally prompt to log in, for now just block.
      onAuthRequired();
      return;
    }
    // console.log("IMAGE LIKES: " + isLiked);
    // Store original data to revert on error
    const originalHasLiked = hasLikedData;
    const originalLikeCount = likeCountData;

    // Optimistic UI updates
    mutateHasLiked({ hasLiked: !isLiked }, false);
    mutateLikeCount({ count: isLiked ? likeCount - 1 : likeCount + 1 }, false);

    try {
      if (isLiked) {
        await unlikeImage(image.id);
      } else {
        await likeImage(image.id);
      }
      // Revalidate to sync with server state after successful API call
      mutateHasLiked();
      mutateLikeCount();
    } catch (error) {
      console.error("Failed to update like status", error);
      // On error, revert to the original data
      mutateHasLiked(originalHasLiked, false);
      mutateLikeCount(originalLikeCount, false);
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={() => onImageClick(image)}
    >
      <CardContent className="p-0">
        <div className="aspect-square relative">
          <NextImage
            src={image.urls.thumb}
            alt={image.alt_description || "Image from Unsplash"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            data-ai-hint="landscape nature"
          />
        </div>
      </CardContent>
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-lg leading-tight truncate">
          {image.alt_description || "Untitled"}
        </CardTitle>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{image.user.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLikeClick}
            disabled={!user}
            title={user ? (isLiked ? "Unlike" : "Like") : "Login to like"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isLiked && "fill-destructive text-destructive"
              )}
            />
            <span className="sr-only">Like</span>
          </Button>
          <span className="text-sm font-medium">{likeCount}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
