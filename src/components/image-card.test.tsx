// src/components/image-card.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageCard from "@/components/image-card";
import { useAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { fetchLikeCount, hasLiked, likeImage, unlikeImage } from "@/lib/api";
import { Heart, User } from "lucide-react";
import { Image } from "@/types";

// Mock dependencies
jest.mock("@/hooks/use-auth");
jest.mock("swr");
jest.mock("@/lib/api");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
jest.mock("lucide-react", () => ({
  User: () => <div>UserIcon</div>,
  Heart: () => <div>HeartIcon</div>,
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <div onClick={onClick}>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    title,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  ),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockFetchLikeCount = fetchLikeCount as jest.MockedFunction<
  typeof fetchLikeCount
>;
const mockHasLiked = hasLiked as jest.MockedFunction<typeof hasLiked>;
const mockLikeImage = likeImage as jest.MockedFunction<typeof likeImage>;
const mockUnlikeImage = unlikeImage as jest.MockedFunction<typeof unlikeImage>;

describe("ImageCard", () => {
  const mockImage = {
    id: "test-image-id",
    urls: {
      thumb: "https://example.com/image.jpg",
    },
    alt_description: "Test image description",
    user: {
      name: "Test User",
    },
    description: "Awesome image",
    tag: [],
  } as unknown as Image;

  const mockOnImageClick = jest.fn();
  const mockOnAuthRequired = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isError: undefined,
    });

    mockUseSWR.mockImplementation((key) => {
      if (typeof key === "string" && key.includes("/count/")) {
        return { data: { count: 10 }, mutate: jest.fn() };
      }
      if (typeof key === "string" && key.includes("/has-liked/")) {
        return { data: { hasLiked: false }, mutate: jest.fn() };
      }
      return { data: undefined, mutate: jest.fn() };
    });

    mockFetchLikeCount.mockResolvedValue({ count: 10 });
    mockHasLiked.mockResolvedValue({ hasLiked: false });
    mockLikeImage.mockResolvedValue({});
    mockUnlikeImage.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with image data", () => {
    render(
      <ImageCard
        image={mockImage}
        onImageClick={mockOnImageClick}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    expect(screen.getByAltText("Test image description")).toBeInTheDocument();
    expect(screen.getByText("Test image description")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("calls onImageClick when card is clicked", async () => {
    render(
      <ImageCard
        image={mockImage}
        onImageClick={mockOnImageClick}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    const card = screen.getByAltText("Test image description").parentElement!;
    await userEvent.click(card);

    expect(mockOnImageClick).toHaveBeenCalledWith(mockImage);
  });

  it("shows auth required when unauthenticated user tries to like", async () => {
    render(
      <ImageCard
        image={mockImage}
        onImageClick={mockOnImageClick}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    const likeButton = screen.getByRole("button", { name: /hearticon/i });
    await userEvent.click(likeButton);

    expect(mockOnAuthRequired).toHaveBeenCalled();
    expect(mockLikeImage).not.toHaveBeenCalled();
  });

  it("handles like action for authenticated user", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user1",
        username: "",
      },
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isError: undefined,
    });

    const mockMutateLikeCount = jest.fn();
    const mockMutateHasLiked = jest.fn();

    mockUseSWR.mockImplementation((key) => {
      if (typeof key === "string" && key.includes("/count/")) {
        return { data: { count: 10 }, mutate: mockMutateLikeCount };
      }
      if (typeof key === "string" && key.includes("/has-liked/")) {
        return { data: { hasLiked: false }, mutate: mockMutateHasLiked };
      }
      return { data: undefined, mutate: jest.fn() };
    });

    render(
      <ImageCard
        image={mockImage}
        onImageClick={mockOnImageClick}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    const likeButton = screen.getByRole("button", { name: /hearticon/i });
    await userEvent.click(likeButton);

    // Check optimistic updates
    expect(mockMutateHasLiked).toHaveBeenCalledWith({ hasLiked: true }, false);
    expect(mockMutateLikeCount).toHaveBeenCalledWith({ count: 11 }, false);

    // Check API call
    await waitFor(() => {
      expect(mockLikeImage).toHaveBeenCalledWith(mockImage.id);
    });

    // Check final revalidation
    expect(mockMutateHasLiked).toHaveBeenCalledTimes(2);
    expect(mockMutateLikeCount).toHaveBeenCalledTimes(2);
  });

  it("handles unlike action for authenticated user", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user1",
        username: "",
      },
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isError: undefined,
    });

    const mockMutateLikeCount = jest.fn();
    const mockMutateHasLiked = jest.fn();

    mockUseSWR.mockImplementation((key) => {
      if (typeof key === "string" && key.includes("/count/")) {
        return { data: { count: 10 }, mutate: mockMutateLikeCount };
      }
      if (typeof key === "string" && key.includes("/has-liked/")) {
        return { data: { hasLiked: true }, mutate: mockMutateHasLiked };
      }
      return { data: undefined, mutate: jest.fn() };
    });

    render(
      <ImageCard
        image={mockImage}
        onImageClick={mockOnImageClick}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    const likeButton = screen.getByRole("button", { name: /hearticon/i });
    await userEvent.click(likeButton);

    // Check optimistic updates
    expect(mockMutateHasLiked).toHaveBeenCalledWith({ hasLiked: false }, false);
    expect(mockMutateLikeCount).toHaveBeenCalledWith({ count: 9 }, false);

    // Check API call
    await waitFor(() => {
      expect(mockUnlikeImage).toHaveBeenCalledWith(mockImage.id);
    });

    // Check final revalidation
    expect(mockMutateHasLiked).toHaveBeenCalledTimes(2);
    expect(mockMutateLikeCount).toHaveBeenCalledTimes(2);
  });

  it("reverts optimistic updates on API error", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user1",
        username: "",
      },
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isError: undefined,
    });

    const mockMutateLikeCount = jest.fn();
    const mockMutateHasLiked = jest.fn();

    mockUseSWR.mockImplementation((key) => {
      if (typeof key === "string" && key.includes("/count/")) {
        return { data: { count: 10 }, mutate: mockMutateLikeCount };
      }
      if (typeof key === "string" && key.includes("/has-liked/")) {
        return { data: { hasLiked: false }, mutate: mockMutateHasLiked };
      }
      return { data: undefined, mutate: jest.fn() };
    });

    mockLikeImage.mockRejectedValue(new Error("API Error"));

    render(
      <ImageCard
        image={mockImage}
        onImageClick={mockOnImageClick}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    const likeButton = screen.getByRole("button", { name: /hearticon/i });
    await userEvent.click(likeButton);

    // Check optimistic updates
    expect(mockMutateHasLiked).toHaveBeenCalledWith({ hasLiked: true }, false);
    expect(mockMutateLikeCount).toHaveBeenCalledWith({ count: 11 }, false);

    // Check error handling
    await waitFor(() => {
      expect(mockMutateHasLiked).toHaveBeenCalledWith(
        { hasLiked: false },
        false
      );
      expect(mockMutateLikeCount).toHaveBeenCalledWith({ count: 10 }, false);
    });
  });

  it("handles numeric likeCountData directly", () => {
    mockUseSWR.mockImplementation((key) => {
      if (typeof key === "string" && key.includes("/count/")) {
        return { data: 15, mutate: jest.fn() };
      }
      return { data: undefined, mutate: jest.fn() };
    });

    render(
      <ImageCard
        image={mockImage}
        onImageClick={mockOnImageClick}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
