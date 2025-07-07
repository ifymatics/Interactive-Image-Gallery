// src/app/page.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { useAuth } from "@/hooks/use-auth";
import useSWR, { MutatorOptions } from "swr";

// Mock the necessary components and hooks
jest.mock("@/hooks/use-auth");
jest.mock("swr");
jest.mock("@/components/ui/pagination", () => ({
  Pagination: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PaginationContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PaginationItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PaginationPrevious: ({
    onClick,
    className,
  }: {
    onClick: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      Previous
    </button>
  ),
  PaginationNext: ({
    onClick,
    className,
  }: {
    onClick: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      Next
    </button>
  ),
  PaginationLink: ({
    onClick,
    isActive,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
  }) => (
    <button onClick={onClick} data-active={isActive}>
      {children}
    </button>
  ),
  PaginationEllipsis: () => <span>...</span>,
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className}>Skeleton</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

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
      {images.map((image, i) => (
        <button key={i} onClick={() => onImageClick(image)}>
          Image {i + 1}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/components/image-details-modal", () => ({
  __esModule: true,
  default: ({
    image,
    isOpen,
    onOpenChange,
  }: {
    image: any;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (isOpen ? <div>Image Details Modal: {image.id}</div> : null),
}));

jest.mock("@/components/auth-modal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Auth Modal</div> : null,
}));

jest.mock("@/components/icons", () => ({
  Icons: {
    logo: () => <div>Logo</div>,
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe("Home Component", () => {
  const mockImages = [
    {
      id: "1",
      urls: { regular: "" },
      user: { name: "User 1" },
      description: "Image 1",
    },
    {
      id: "2",
      urls: { regular: "" },
      user: { name: "User 2" },
      description: "Image 2",
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
      data: { results: mockImages, total_pages: 3 },
      error: null,
      isLoading: false,
      mutate: function <MutationData = unknown>(
        data?: unknown,
        opts?: boolean | MutatorOptions<unknown, MutationData> | undefined
      ): Promise<unknown> {
        throw new Error("Function not implemented.");
      },
      isValidating: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<Home />);
    expect(screen.getByText("ImageVerse")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("displays loading skeletons when images are loading", () => {
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
    render(<Home />);
    expect(screen.getAllByText("Skeleton").length).toBeGreaterThan(1);
  });

  it("displays error message when images fail to load", () => {
    mockUseSWR.mockReturnValue({
      error: new Error("Failed to load"),
      data: undefined,
      mutate: function <MutationData = unknown>(
        data?: unknown,
        opts?: boolean | MutatorOptions<unknown, MutationData> | undefined
      ): Promise<unknown> {
        throw new Error("Function not implemented.");
      },
      isValidating: false,
      isLoading: false,
    });
    render(<Home />);
    expect(screen.getByText(/Failed to load images/i)).toBeInTheDocument();
  });

  it("renders images when loaded", () => {
    render(<Home />);
    expect(screen.getByText("Image 1")).toBeInTheDocument();
    expect(screen.getByText("Image 2")).toBeInTheDocument();
  });

  describe("Pagination", () => {
    it("renders pagination controls when there are multiple pages", () => {
      render(<Home />);
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("changes page when pagination controls are clicked", () => {
      render(<Home />);

      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      expect(mockUseSWR).toHaveBeenCalledWith(
        ["/images", 2, 8],
        expect.any(Function)
      );
    });

    it("disables previous button on first page", () => {
      render(<Home />);
      const prevButton = screen.getByText("Previous");
      expect(prevButton).toHaveClass("opacity-50");
    });

    it("disables next button on last page", () => {
      mockUseSWR.mockReturnValue({
        data: { results: mockImages, total_pages: 3 },
        error: null,
        isLoading: false,
        mutate: function <MutationData = unknown>(
          data?: unknown,
          opts?: boolean | MutatorOptions<unknown, MutationData> | undefined
        ): Promise<unknown> {
          throw new Error("Function not implemented.");
        },
        isValidating: false,
      });

      render(<Home />);

      // Click to last page
      const page3Button = screen.getByText("3");
      fireEvent.click(page3Button);

      const nextButton = screen.getByText("Next");
      expect(nextButton).toHaveClass("opacity-50");
    });
  });

  describe("Authentication", () => {
    it("opens auth modal when login button is clicked", async () => {
      render(<Home />);

      const loginButton = screen.getByText("Login");
      await userEvent.click(loginButton);

      expect(screen.getByText("Auth Modal")).toBeInTheDocument();
    });

    it("shows user avatar when logged in", () => {
      mockUseAuth.mockReturnValue({
        user: {
          username: "testuser",
          id: "",
        },
        login: jest.fn(),
        signup: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        isError: undefined,
      });

      render(<Home />);

      expect(screen.getByText("T")).toBeInTheDocument(); // Avatar fallback
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });

    it("calls logout when logout is clicked", async () => {
      const mockLogout = jest.fn();
      mockUseAuth.mockReturnValue({
        user: {
          username: "testuser",
          id: "",
        },
        login: jest.fn(),
        signup: jest.fn(),
        logout: mockLogout,
        isLoading: false,
        isError: undefined,
      });

      render(<Home />);

      // Open dropdown
      const avatarButton = screen.getByText("T");
      await userEvent.click(avatarButton);

      // Click logout
      const logoutButton = screen.getByText("Logout");
      await userEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("Image Selection", () => {
    it("opens image modal when image is clicked", async () => {
      render(<Home />);

      const firstImage = screen.getByText("Image 1");
      fireEvent.click(firstImage);

      expect(screen.getByText(/Image Details Modal/)).toBeInTheDocument();
    });

    it("closes image modal when closed", async () => {
      render(<Home />);

      // Open modal
      const firstImage = screen.getByText("Image 1");
      fireEvent.click(firstImage);

      // Close modal
      const modal = screen.getByText(/Image Details Modal/);
      fireEvent.keyDown(modal, { key: "Escape" });

      await waitFor(() => {
        expect(
          screen.queryByText(/Image Details Modal/)
        ).not.toBeInTheDocument();
      });
    });
  });
});
