"use client";

import useSWR from "swr";
import type { Comment } from "@/types";
import { fetchComments, postComment } from "@/lib/api";
import CommentForm from "./comment-form";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

interface CommentSectionProps {
  imageId: string;
  onAuthRequired: () => void;
  isAuthLoading: boolean;
}

export default function CommentSection({
  imageId,
  onAuthRequired,
  isAuthLoading,
}: CommentSectionProps) {
  const { user } = useAuth();
  const {
    data: comments = [],
    mutate,
    isLoading,
  } = useSWR(imageId ? `/comments/${imageId}` : null, () =>
    fetchComments(imageId)
  );

  const handleAddComment = async (text: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const newCommentOptimistic: Comment = {
      id: new Date().toISOString(), // Temporary ID for optimistic update
      imageId,
      user,
      text,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update the UI
    mutate([newCommentOptimistic, ...comments], false);

    try {
      // Post the comment to the server
      await postComment({ imageId, text });
      // Revalidate to get the definitive data from the server
      mutate();
    } catch (error) {
      console.error("Failed to post comment", error);
      // Revert the optimistic update on error by revalidating
      mutate();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <h3 className="text-sm font-semibold mb-4 flex items-center">
        <MessageSquare className="w-4 h-4 mr-2" />
        Comments (
        {isLoading
          ? "..."
          : comments.filter((comment) => comment.imageId === imageId).length}
        )
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div>
              {comment.imageId === imageId && (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">
                        {comment.user.username}
                      </p>
                      <p
                        className="text-xs text-muted-foreground"
                        title={new Date(comment.createdAt).toLocaleString()}
                      >
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Be the first to leave a comment.
          </p>
        )}
      </div>
      <div className="mt-auto pt-4">
        <CommentForm
          onSubmit={handleAddComment}
          isDisabled={isAuthLoading || !user}
        />
      </div>
    </div>
  );
}

const CommentSkeleton = () => (
  <div className="flex items-start space-x-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);
