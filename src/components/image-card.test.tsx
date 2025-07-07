import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SWRConfig } from "swr";
import ImageCard from "./image-card";
import * as api from "@/lib/api";
import * as authHook from "@/hooks/use-auth";
import type { Image as UnsplashImage, User } from "@/types";

// Mocks
jest.mock("@/lib/api");
jest.mock("@/hooks/use-auth");

const mockApi = api as jest.Mocked<typeof api>;
const mockAuthHook = authHook as jest.Mocked<typeof authHook>;

const mockImage: UnsplashImage = {
  id: "test-img-1",
  alt_description: "A beautiful test image",
  description: "Detailed description",
  urls: { regular: "regular.jpg", thumb: "thumb.jpg" },
  user: { name: "Test Author" },
  tags: [],
};

const mockUser: User = { id: "1", username: "testuser" };

const renderComponent = (
  user: User | null,
  hasLiked: boolean,
  likeCount: number
) => {
  mockAuthHook.useAuth.mockReturnValue({
    user,
    isLoading: false,
    isError: false,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
  });
  mockApi.fetchLikeCount.mockResolvedValue({ count: likeCount });
  mockApi.hasLiked.mockResolvedValue({ hasLiked });
  mockApi.likeImage.mockResolvedValue();
  mockApi.unlikeImage.mockResolvedValue();

  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <ImageCard
        image={mockImage}
        onImageClick={jest.fn()}
        onAuthRequired={jest.fn()}
      />
    </SWRConfig>
  );
};

describe("ImageCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders image information correctly", async () => {
    renderComponent(null, false, 10);
    expect(await screen.findByText("10")).toBeInTheDocument();
    expect(screen.getByText("A beautiful test image")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "A beautiful test image"
    );
  });

  it("like button is disabled for guests", async () => {
    renderComponent(null, false, 5);
    const likeButton = await screen.findByTitle("Login to like");
    expect(likeButton).toBeDisabled();
  });

  it("allows a logged-in user to like an image", async () => {
    renderComponent(mockUser, false, 5);
    const likeButton = await screen.findByTitle("Like");

    // Initial state
    expect(screen.getByText("5")).toBeInTheDocument();

    fireEvent.click(likeButton);

    // Optimistic UI update
    expect(await screen.findByText("6")).toBeInTheDocument();

    // Check if the correct API was called
    await waitFor(() => {
      expect(mockApi.likeImage).toHaveBeenCalledWith("test-img-1");
      expect(mockApi.unlikeImage).not.toHaveBeenCalled();
    });
  });

  it("allows a logged-in user to unlike an image", async () => {
    renderComponent(mockUser, true, 10);
    const likeButton = await screen.findByTitle("Unlike");

    // Initial state
    expect(screen.getByText("10")).toBeInTheDocument();

    fireEvent.click(likeButton);

    // Optimistic UI update
    expect(await screen.findByText("9")).toBeInTheDocument();

    // Check if the correct API was called
    await waitFor(() => {
      expect(mockApi.unlikeImage).toHaveBeenCalledWith("test-img-1");
      expect(mockApi.likeImage).not.toHaveBeenCalled();
    });
  });
});
