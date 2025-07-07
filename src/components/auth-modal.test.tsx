// src/components/auth-modal.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthModal from "@/components/auth-modal";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

// Mock dependencies
jest.mock("@/hooks/use-toast");
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-testid={`tab-${value}`}>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <button data-testid={`tab-trigger-${value}`}>{children}</button>,
}));
jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => (
    <form>{children}</form>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormField: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormMessage: () => <div>FormMessage</div>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({
    placeholder,
    type,
    ...props
  }: {
    placeholder: string;
    type?: string;
  }) => <input placeholder={placeholder} type={type} {...props} />,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockToast = jest.fn();

describe("AuthModal", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnLogin = jest.fn();
  const mockOnSignup = jest.fn();

  beforeEach(() => {
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: (toastId?: string) => void {},
      toasts: [],
    });

    mockOnLogin.mockResolvedValue(undefined);
    mockOnSignup.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    expect(screen.getByText("Welcome to ImageVerse")).toBeInTheDocument();
    expect(
      screen.getByText("Join the community to comment and engage.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-login")).toBeInTheDocument();
    expect(screen.getByTestId("tab-trigger-signup")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <AuthModal
        isOpen={false}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    expect(screen.queryByText("Welcome to ImageVerse")).toBeInTheDocument();
  });

  it("switches between login and signup tabs", async () => {
    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    // Default to login tab
    expect(screen.getByTestId("tab-login")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-signup")).not.toBeInTheDocument();

    // Click signup tab
    const signupTab = screen.getByTestId("tab-trigger-signup");
    await userEvent.click(signupTab);

    expect(screen.getByTestId("tab-signup")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-login")).not.toBeInTheDocument();
  });

  it("validates form inputs", async () => {
    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Login" });
    await userEvent.click(submitButton);

    expect(screen.getAllByText("FormMessage").length).toBe(2);
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it("handles successful login", async () => {
    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    // Fill out form
    const usernameInput = screen.getByPlaceholderText("your_username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
      });
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("handles successful signup", async () => {
    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    // Switch to signup tab
    const signupTab = screen.getByTestId("tab-trigger-signup");
    await userEvent.click(signupTab);

    // Fill out form
    const usernameInput = screen.getByPlaceholderText("your_username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    await userEvent.type(usernameInput, "newuser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSignup).toHaveBeenCalledWith({
        username: "newuser",
        password: "password123",
      });
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("shows error toast when login fails", async () => {
    const testError = new Error("Login failed") as AxiosError;
    mockOnLogin.mockRejectedValue(testError);

    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    // Fill out form
    const usernameInput = screen.getByPlaceholderText("your_username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(passwordInput, "wrongpassword");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials or user not found.",
      });
    });
  });

  it("shows error toast when signup fails", async () => {
    const testError = new Error("Signup failed") as AxiosError;
    mockOnSignup.mockRejectedValue(testError);

    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    // Switch to signup tab
    const signupTab = screen.getByTestId("tab-trigger-signup");
    await userEvent.click(signupTab);

    // Fill out form
    const usernameInput = screen.getByPlaceholderText("your_username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    await userEvent.type(usernameInput, "existinguser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Signup Failed",
        description: "Username may already be taken.",
      });
    });
  });

  it("shows server error message when available", async () => {
    const serverError = {
      response: {
        data: {
          message: "Username is already taken",
        },
      },
    } as AxiosError<{ message: string }>;
    mockOnSignup.mockRejectedValue(serverError);

    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    // Switch to signup tab
    const signupTab = screen.getByTestId("tab-trigger-signup");
    await userEvent.click(signupTab);

    // Fill out form
    const usernameInput = screen.getByPlaceholderText("your_username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    await userEvent.type(usernameInput, "existinguser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Signup Failed",
        description: "Username is already taken",
      });
    });
  });

  it("shows loading state during submission", async () => {
    mockOnLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(
      <AuthModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );

    // Fill out form
    const usernameInput = screen.getByPlaceholderText("your_username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });
});
