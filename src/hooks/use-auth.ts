"use client";

import useSWR, { useSWRConfig } from "swr";
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "@/lib/api";
import type { User, AuthCredentials } from "@/types";
import { useCallback } from "react";

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<User | null>("/auth/me", getMe, {
    shouldRetryOnError: false, // Don't retry on 401/403
  });
  const { cache } = useSWRConfig();

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        await apiLogin(credentials);
        await mutate(); // Re-fetches /auth/me to get user
      } catch (err) {
        console.error("Login failed", err);
        throw err; // Re-throw to be caught in the form
      }
    },
    [mutate]
  );

  const signup = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        await apiRegister(credentials);
        await mutate(); // Re-fetches /auth/me to get user
      } catch (err) {
        console.error("Signup failed", err);
        throw err; // Re-throw to be caught in the form
      }
    },
    [mutate]
  );

  // const logout = useCallback(async () => {
  //   try {
  //     await apiLogout();
  //     // @ts-ignore
  //     cache.clear();
  //     await mutate(null, false); // Set user to null without revalidation
  //   } catch (err) {
  //     console.error("Logout failed", err);
  //   }
  // }, [mutate, cache]);
  const logout = useCallback(async () => {
    try {
      await apiLogout();

      // ✅ Check if cache has a clear function (like Map)
      if (typeof (cache as any).clear === "function") {
        // (cache as Map<any, any>).clear();
      }

      await mutate(null, false);
    } catch (err) {
      console.error("Logout failed", err);
      await mutate(null, false); // Still remove user
    }
  }, [mutate, cache]);

  return {
    user: user ?? null,
    isLoading,
    isError: error,
    login,
    signup,
    logout,
  };
}
