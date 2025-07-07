"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AxiosError } from "axios";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." }),
  password: z
    .string()
    .min(3, { message: "Password must be at least 3 characters." }),
});
type FormValues = z.infer<typeof formSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (values: FormValues) => Promise<void>;
  onSignup: (values: FormValues) => Promise<void>;
}

const AuthForm = ({
  isLogin,
  onSubmit,
}: {
  isLogin: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string[] | string }>;
      const serverMessage = axiosError.response?.data?.message;
      let description = isLogin
        ? "Invalid credentials or user not found."
        : "Username may already be taken.";

      if (serverMessage) {
        description = Array.isArray(serverMessage)
          ? serverMessage.join(", ")
          : serverMessage;
      }

      toast({
        variant: "destructive",
        title: isLogin ? "Login Failed" : "Signup Failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="your_username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};

export default function AuthModal({
  isOpen,
  onOpenChange,
  onLogin,
  onSignup,
}: AuthModalProps) {
  const handleAuth = async (isLogin: boolean, values: FormValues) => {
    const authFn = isLogin ? onLogin : onSignup;
    await authFn(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to ImageVerse</DialogTitle>
          <DialogDescription>
            Join the community to comment and engage.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <AuthForm
              isLogin={true}
              onSubmit={(data) => handleAuth(true, data)}
            />
          </TabsContent>
          <TabsContent value="signup">
            <AuthForm
              isLogin={false}
              onSubmit={(data) => handleAuth(false, data)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
