"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const formSchema = z.object({
  comment: z
    .string()
    .min(3, { message: "Comment must be at least 3 characters long." })
    .max(500, { message: "Comment cannot be longer than 500 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

interface CommentFormProps {
  onSubmit: (text: string) => void;
  isDisabled?: boolean;
}

export default function CommentForm({
  onSubmit,
  isDisabled = false,
}: CommentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  const { formState, reset } = form;

  const handleSubmit = (data: FormValues) => {
    onSubmit(data.comment);
    reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex items-start space-x-2"
      >
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="Leave a comment..."
                  className="resize-none"
                  rows={2}
                  {...field}
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          disabled={formState.isSubmitting || isDisabled}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Submit comment</span>
        </Button>
      </form>
    </Form>
  );
}
