"use client";

import NextImage from "next/image";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Image as UnsplashImage } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "./ui/separator";
import CommentSection from "./comment-section";
import TagDisplay from "./tag-display";
import { useAuth } from "@/hooks/use-auth";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { fetchLikeCount, hasLiked, likeImage, unlikeImage } from "@/lib/api";

interface ImageDetailsModalProps {
  image: UnsplashImage;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthRequired: () => void;
  isAuthLoading: boolean;
}

export default function ImageDetailsModal({
  image,
  isOpen,
  onOpenChange,
  onAuthRequired,
  isAuthLoading,
}: ImageDetailsModalProps) {
  const { user } = useAuth();

  const { data: likeCountData, mutate: mutateLikeCount } = useSWR(
    image?.id ? `/likes/count/${image.id}` : null,
    () => fetchLikeCount(image.id),
    { revalidateOnFocus: false }
  );

  const { data: hasLikedData, mutate: mutateHasLiked } = useSWR(
    user && image?.id ? `/likes/has-liked/${image.id}` : null,
    () => hasLiked(image.id),
    { revalidateOnFocus: false }
  );

  // const likeCount = likeCountData?.count ?? 0;
  const isLiked = hasLikedData?.hasLiked ?? false;
  let likeCount = 0;
  // console.log("hasLikedData " + isLiked);
  if (typeof likeCountData === "number") {
    likeCount = likeCountData;
  } else if (likeCountData && typeof likeCountData.count === "number") {
    likeCount = likeCountData.count;
  }

  const handleLikeClick = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col md:flex-row gap-0">
        <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-muted">
          <NextImage
            src={image.urls.regular}
            alt={image.alt_description || "Detailed view"}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 66vw"
            data-ai-hint="nature landscape"
          />
        </div>
        <ScrollArea className="w-full md:w-1/3 h-1/2 md:h-full">
          <div className="p-6 flex flex-col h-full">
            <DialogHeader className="mb-4 text-left">
              <DialogTitle className="font-headline text-2xl md:text-3xl">
                {image.alt_description || "Untitled"}
              </DialogTitle>
              <DialogDescription>by {image.user.name}</DialogDescription>
            </DialogHeader>

            {image.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {image.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed h-auto w-auto p-1"
                onClick={handleLikeClick}
                disabled={isAuthLoading || !user}
                title={user ? (isLiked ? "Unlike" : "Like") : "Login to like"}
              >
                <Heart
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isLiked && "fill-destructive text-destructive"
                  )}
                />
                <span className="sr-only">Like</span>
              </Button>
              <span className="text-base font-medium">{likeCount}</span>
              <span className="text-sm text-muted-foreground">likes</span>
            </div>

            <TagDisplay tags={image.tags} />

            <Separator className="my-6" />

            <div className="flex-grow flex flex-col">
              <CommentSection
                imageId={image.id}
                onAuthRequired={onAuthRequired}
                isAuthLoading={isAuthLoading}
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
