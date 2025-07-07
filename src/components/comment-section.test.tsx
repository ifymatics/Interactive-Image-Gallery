import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentSection from "./comment-section";
import { useAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { fetchComments, postComment } from "@/lib/api";
import type { Comment } from "@/types";

// Mock the dependencies
jest.mock("swr");
jest.mock("@/hooks/use-auth");
jest.mock("@/lib/api");

const mockUseSWR = useSWR as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockFetchComments = fetchComments as jest.Mock;
const mockPostComment = postComment as jest.Mock;
const mockMutate = jest.fn();

describe("CommentSection", () => {
  const mockImageId = "test-image-123";
  const mockOnAuthRequired = jest.fn();
  const mockComments: Comment[] = [
    {
      id: "1",
      imageId: mockImageId,
      user: { id: "user-1", username: "testuser" },
      text: "First comment",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      imageId: mockImageId,
      user: { id: "user-2", username: "anotheruser" },
      text: "Second comment",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSWR.mockReturnValue({
      data: mockComments,
      mutate: mockMutate,
      isLoading: false,
    });
    mockUseAuth.mockReturnValue({
      user: { id: "current-user", username: "currentuser" },
    });
  });

  it("renders loading state correctly", () => {
    mockUseSWR.mockReturnValue({ isLoading: true });
    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    expect(screen.getAllByTestId("comment-skeleton")).toHaveLength(2);
    expect(screen.getByText("Comments (...)")).toBeInTheDocument();
  });

  it("renders empty state when no comments exist", () => {
    mockUseSWR.mockReturnValue({ data: [], isLoading: false });
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
    expect(screen.getByText("Comments (0)")).toBeInTheDocument();
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
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("anotheruser")).toBeInTheDocument();
    expect(screen.getByText("Comments (2)")).toBeInTheDocument();
  });

  it("shows auth required when submitting without being logged in", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    const input = screen.getByPlaceholderText("Add a comment...");
    const submitButton = screen.getByRole("button", { name: "Post" });

    await userEvent.type(input, "Test comment");
    fireEvent.click(submitButton);

    expect(mockOnAuthRequired).toHaveBeenCalled();
    expect(mockPostComment).not.toHaveBeenCalled();
  });

  it("handles successful comment submission with optimistic update", async () => {
    const newCommentText = "New test comment";
    mockPostComment.mockResolvedValueOnce({});

    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    const input = screen.getByPlaceholderText("Add a comment...");
    const submitButton = screen.getByRole("button", { name: "Post" });

    await userEvent.type(input, newCommentText);
    fireEvent.click(submitButton);

    // Check optimistic update
    expect(mockMutate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          text: newCommentText,
          user: { id: "current-user", username: "currentuser" },
        }),
        ...mockComments,
      ]),
      false
    );

    // Wait for server submission and revalidation
    await waitFor(() => {
      expect(mockPostComment).toHaveBeenCalledWith({
        imageId: mockImageId,
        text: newCommentText,
      });
      expect(mockMutate).toHaveBeenCalledTimes(2);
    });
  });

  it("handles comment submission error and reverts optimistic update", async () => {
    const newCommentText = "New test comment";
    const testError = new Error("Failed to post comment");
    mockPostComment.mockRejectedValueOnce(testError);

    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={false}
      />
    );

    const input = screen.getByPlaceholderText("Add a comment...");
    const submitButton = screen.getByRole("button", { name: "Post" });

    await userEvent.type(input, newCommentText);
    fireEvent.click(submitButton);

    // Check optimistic update
    expect(mockMutate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          text: newCommentText,
          user: { id: "current-user", username: "currentuser" },
        }),
        ...mockComments,
      ]),
      false
    );

    // Wait for error and revalidation
    await waitFor(() => {
      expect(mockPostComment).toHaveBeenCalledWith({
        imageId: mockImageId,
        text: newCommentText,
      });
      expect(mockMutate).toHaveBeenCalledTimes(2); // Once for optimistic, once for revalidate
    });
  });

  it("disables form when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(
      <CommentSection
        imageId={mockImageId}
        onAuthRequired={mockOnAuthRequired}
        isAuthLoading={true}
      />
    );

    const input = screen.getByPlaceholderText("Add a comment...");
    const submitButton = screen.getByRole("button", { name: "Post" });

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("filters comments by imageId", () => {
    const mixedComments = [
      ...mockComments,
      {
        id: "3",
        imageId: "different-image",
        user: { id: "user-3", username: "otheruser" },
        text: "Comment for different image",
        createdAt: new Date().toISOString(),
      },
    ];

    mockUseSWR.mockReturnValue({ data: mixedComments, isLoading: false });

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
      screen.queryByText("Comment for different image")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Comments (2)")).toBeInTheDocument();
  });
});

// Test for CommentSkeleton component
describe("CommentSkeleton", () => {
  it("renders correctly", () => {
    const { container } = render(
      <div className="flex items-start space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 bg-gray-200" />
          <div className="h-4 w-full bg-gray-200" />
        </div>
      </div>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
