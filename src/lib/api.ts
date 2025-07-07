import axios from "axios";
import type {
  UnsplashApiResponse,
  Comment,
  AuthCredentials,
  User,
  LikeCount,
  HasLiked,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const UNSPLASH_API_URL = "https://api.unsplash.com";
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const unsplashApi = axios.create({
  baseURL: UNSPLASH_API_URL,
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  },
});

// --- Image Fetching ---
export const fetchImages = async (
  page: number,
  perPage: number
): Promise<UnsplashApiResponse> => {
  const response = await unsplashApi.get("/search/photos", {
    params: {
      query: "nature",
      page,
      per_page: perPage,
    },
  });
  return response.data;
};

// --- Authentication ---
export const getMe = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    return null;
  }
};

export const register = async (credentials: AuthCredentials): Promise<void> => {
  await api.post("/auth/register", credentials);
};

export const login = async (credentials: AuthCredentials): Promise<void> => {
  await api.post("/auth/login", credentials);
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

// --- Comments ---
export const fetchComments = async (imageId: string): Promise<Comment[]> => {
  const response = await api.get(`/comments`, { params: { imageId } });
  return response.data;
};

export const postComment = async (data: {
  imageId: string;
  text: string;
}): Promise<Comment> => {
  const response = await api.post("/comments", data);
  return response.data;
};

// --- Likes ---
export const fetchLikeCount = async (imageId: string): Promise<LikeCount> => {
  const response = await api.get("/likes/count", { params: { imageId } });
  return response.data;
};

export const hasLiked = async (imageId: string): Promise<HasLiked> => {
  const response = await api.get("/likes/has-liked", { params: { imageId } });
  return response.data;
};

export const likeImage = async (imageId: string): Promise<void> => {
  await api.post("/likes", null, { params: { imageId } });
};

export const unlikeImage = async (imageId: string): Promise<void> => {
  await api.delete("/likes", { params: { imageId } });
};
