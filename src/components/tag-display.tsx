"use client";

import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/types";
import { Tags as TagsIcon } from "lucide-react";

interface TagDisplayProps {
  tags: Tag[];
}

export default function TagDisplay({ tags }: TagDisplayProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center">
        <TagsIcon className="w-4 h-4 mr-2" />
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.title} variant="secondary" className="capitalize">
            {tag.title}
          </Badge>
        ))}
      </div>
    </div>
  );
}
