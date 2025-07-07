// src/components/comment-section.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "@/components/comment-section";
import { useAuth } from "@/hooks/use-auth";
import useSWR, { MutatorOptions } from "swr";
import { postComment } from "@/lib/api";

// Mock dependencies
jest.mock("@/hooks/use-auth");
jest.mock("swr");
jest.mock("@/lib/api");
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className}>Skeleton</div>
  ),
}));
jest.mock("lucide-react", () => ({
  MessageSquare: () => <div>MessageIcon</div>,
}));
jest.mock("./comment-form", () => ({
  __esModule: true,
  default: ({
    onSubmit,
    isDisabled,
  }: {
    onSubmit: (text: string) => void;
    isDisabled: boolean;
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit("Test comment");
      }}
    >
      <button type="submit" disabled={isDisabled}>
        Submit Comment
      </button>
    </form>
  ),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockPostComment = postComment as jest.MockedFunction<typeof postComment>;

describe("CommentSection", () => {
  const mockImageId = "test-image-id";
  const mockOnAuthRequired = jest.fn();
  const mockMutate = jest.fn();

  const mockComments = [
    {
      id: "1",
      imageId: mockImageId,
      user: { username: "user1" },
      text: "First comment",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      imageId: mockImageId,
      user: { username: "user2" },
      text: "Second comment",
      createdAt: new Date(Date.now() - 100000).toISOString(),
    },
  ];

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isError: undefined,
    });

    mockUseSWR.mockReturnValue({
      data: mockComments,
      mutate: mockMutate,
      isLoading: false,
      error: undefined,
      isValidating: false,
    });

    mockPostComment.mockResolvedValue({
      id: "new-comment-id",
      imageId: mockImageId,
      user: {
        username: "testuser",
        id: "",
      },
      text: "Test comment",
      createdAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state correctly", () => {
    mockUseSWR.mockReturnValue({
      isLoading: true,
      data: undefined,
      error: undefined,
      mutate: function <MutationData = unknown>(
        data?: unknown,
        opts?: boolean | MutatorOptions<unknown, MutationData> | undefined
      ): Promise<unknown> {
        throw new Error("Function not implemented.");
      },
      isValidating: false,
    });
    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    expect(screen.getAllByText("Skeleton").length).toBe(2);
  });

  it("renders empty state when no comments exist", () => {
    mockUseSWR.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
      mutate: function <MutationData = unknown>(
        data?: unknown,
        opts?: boolean | MutatorOptions<unknown, MutationData> | undefined
      ): Promise<unknown> {
        throw new Error("Function not implemented.");
      },
      isValidating: false,
    });
    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    expect(
      screen.getByText("Be the first to leave a comment.")
    ).toBeInTheDocument();
  });

  it("displays comments correctly", () => {
    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    expect(screen.getByText("First comment")).toBeInTheDocument();
    expect(screen.getByText("Second comment")).toBeInTheDocument();
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
  });

  it("shows auth required when submitting without being logged in", async () => {
    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    const submitButton = screen.getByText("Submit Comment");
    await userEvent.click(submitButton);

    expect(mockOnAuthRequired).toHaveBeenCalled();
    expect(mockPostComment).not.toHaveBeenCalled();
  });

  it("handles successful comment submission with optimistic update", async () => {
    const mockUser = { username: "testuser", id: "4" };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isError: undefined,
    });

    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    const submitButton = screen.getByText("Submit Comment");
    await userEvent.click(submitButton);

    // Check optimistic update
    expect(mockMutate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          imageId: mockImageId,
          user: mockUser,
          text: "Test comment",
          createdAt: expect.any(String),
        }),
        ...mockComments,
      ]),
      false
    );

    // Check final update after API call
    await waitFor(() => {
      expect(mockPostComment).toHaveBeenCalledWith({
        imageId: mockImageId,
        text: "Test comment",
      });
      expect(mockMutate).toHaveBeenCalledTimes(2); // Once for optimistic, once for revalidation
    });
  });

  it("handles comment submission error and reverts optimistic update", async () => {
    const mockUser = { username: "testuser", id: "1" };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isError: undefined,
    });

    const testError = new Error("Failed to post comment");
    mockPostComment.mockRejectedValueOnce(testError);

    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    const submitButton = screen.getByText("Submit Comment");
    await userEvent.click(submitButton);

    // Check optimistic update
    expect(mockMutate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          text: "Test comment",
        }),
        ...mockComments,
      ]),
      false
    );

    // Check error handling
    await waitFor(() => {
      expect(mockPostComment).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledTimes(2); // Once for optimistic, once for revalidation
    });
  });

  it("disables form when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: true,
      isError: undefined,
    });

    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={true}
      />
    );

    const submitButton = screen.getByText("Submit Comment");
    expect(submitButton).toBeDisabled();
  });

  it("filters comments by imageId", () => {
    const mixedComments = [
      ...mockComments,
      {
        id: "3",
        imageId: "other-image-id",
        user: { username: "user3" },
        text: "Comment for other image",
        createdAt: new Date().toISOString(),
      },
    ];

    mockUseSWR.mockReturnValue({
      data: mixedComments,
      isLoading: false,
      error: undefined,
      mutate: function <MutationData = unknown>(
        data?: unknown,
        opts?: boolean | MutatorOptions<unknown, MutationData> | undefined
      ): Promise<unknown> {
        throw new Error("Function not implemented.");
      },
      isValidating: false,
    });

    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    expect(screen.getByText("First comment")).toBeInTheDocument();
    expect(screen.getByText("Second comment")).toBeInTheDocument();
    expect(
      screen.queryByText("Comment for other image")
    ).not.toBeInTheDocument();
  });
});
