import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { useAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { fetchImages } from "@/lib/api";
import type { Image as UnsplashImage } from "@/types";

// Mock the dependencies
jest.mock("swr");
jest.mock("@/hooks/use-auth");
jest.mock("@/lib/api");

const mockUseSWR = useSWR as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockFetchImages = fetchImages as jest.Mock;

describe("Home Component", () => {
  const mockImages: UnsplashImage[] = [
    {
      id: "1",
      urls: {
        regular: "image1.jpg",
        thumb: "",
      },
      user: { name: "User One" },
      description: "First image",
      alt_description: null,
      tags: [],
    },
    {
      id: "2",
      urls: {
        regular: "image2.jpg",
        thumb: "",
      },
      user: { name: "User Two" },
      description: "Second image",
      alt_description: null,
      tags: [],
    },
  ];

  const mockAuthUser = {
    id: "user-1",
    username: "testuser",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock SWR response
    mockUseSWR.mockReturnValue({
      data: { results: mockImages, total_pages: 3 },
      error: null,
      isLoading: false,
    });

    // Mock auth state
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
    });
  });

  it("renders loading state correctly", () => {
    mockUseSWR.mockReturnValue({ isLoading: true });
    render(<Home />);

    expect(screen.getAllByTestId("card-skeleton")).toHaveLength(8); // IMAGES_PER_PAGE
    expect(screen.getByText("ImageVerse")).toBeInTheDocument();
  });

  it("renders error state when image fetch fails", () => {
    mockUseSWR.mockReturnValue({ error: new Error("API Error") });
    render(<Home />);

    expect(screen.getByText(/Failed to load images/)).toBeInTheDocument();
  });

  it("renders images when loaded successfully", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("First image")).toBeInTheDocument();
      expect(screen.getByText("Second image")).toBeInTheDocument();
    });
  });

  it("shows login/signup buttons when not authenticated", () => {
    render(<Home />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("shows user avatar dropdown when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: mockAuthUser,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
    });

    render(<Home />);

    expect(
      screen.getByText(mockAuthUser.username.charAt(0).toUpperCase())
    ).toBeInTheDocument();
  });

  describe("Pagination", () => {
    it("renders pagination when there are multiple pages", () => {
      render(<Home />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("changes page when pagination controls are clicked", async () => {
      render(<Home />);

      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      await waitFor(() => {
        expect(mockFetchImages).toHaveBeenCalledWith(2, 8);
      });
    });

    it("disables previous button on first page", () => {
      render(<Home />);

      const prevButton = screen.getByLabelText("Go to previous page");
      expect(prevButton).toHaveClass("opacity-50");
      expect(prevButton).toHaveAttribute("aria-disabled", "true");
    });

    it("disables next button on last page", () => {
      mockUseSWR.mockReturnValue({
        data: { results: mockImages, total_pages: 3 },
        error: null,
        isLoading: false,
      });

      render(<Home />);

      // Simulate being on last page
      const nextButton = screen.getByLabelText("Go to next page");
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(nextButton).toHaveClass("opacity-50");
      expect(nextButton).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Authentication", () => {
    it("opens auth modal when login button is clicked", async () => {
      render(<Home />);

      const loginButton = screen.getByText("Login");
      await userEvent.click(loginButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("calls logout when logout is clicked", async () => {
      const mockLogout = jest.fn();
      mockUseAuth.mockReturnValue({
        user: mockAuthUser,
        login: jest.fn(),
        signup: jest.fn(),
        logout: mockLogout,
        isLoading: false,
      });

      render(<Home />);

      const avatarButton = screen.getByRole("button", {
        name: mockAuthUser.username.charAt(0).toUpperCase(),
      });
      await userEvent.click(avatarButton);

      const logoutButton = screen.getByText("Logout");
      await userEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("Image Selection", () => {
    it("opens image modal when image is clicked", async () => {
      render(<Home />);

      const firstImage = screen.getByText("First image");
      fireEvent.click(firstImage);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });
});

// Mock components that would normally be imported
jest.mock("@/components/image-grid", () => ({
  __esModule: true,
  default: ({
    images,
    onImageClick,
  }: {
    images: any[];
    onImageClick: (image: any) => void;
  }) => (
    <div>
      {images.map((image) => (
        <div key={image.id} onClick={() => onImageClick(image)}>
          {image.description}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/image-details-modal", () => ({
  __esModule: true,
  default: ({ image, isOpen }: { image: any; isOpen: boolean }) =>
    isOpen ? <div role="dialog">Image Modal: {image.description}</div> : null,
}));

jest.mock("@/components/auth-modal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog">Auth Modal</div> : null,
}));

jest.mock("@/components/icons", () => ({
  Icons: {
    logo: () => <div>Logo</div>,
  },
}));
