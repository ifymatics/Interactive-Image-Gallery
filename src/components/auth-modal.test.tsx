import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthModal from "./auth-modal";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

// Mock the toast hook
jest.mock("@/hooks/use-toast");
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({
  toast: mockToast,
});

// Mock the form schema for testing validation
const formSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});
type FormValues = z.infer<typeof formSchema>;

describe("AuthModal", () => {
  const mockOnLogin = jest.fn();
  const mockOnSignup = jest.fn();
  const mockOnOpenChange = jest.fn();

  const renderAuthModal = (isOpen = true) => {
    return render(
      <AuthModal
        isOpen={isOpen}
        onOpenChange={mockOnOpenChange}
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders closed when isOpen is false", () => {
    renderAuthModal(false);
    expect(screen.queryByText("Welcome to ImageVerse")).not.toBeInTheDocument();
  });

  it("renders login form by default", () => {
    renderAuthModal();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("switches between login and signup tabs", async () => {
    renderAuthModal();

    // Click signup tab
    fireEvent.click(screen.getByText("Sign Up"));
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

    // Click login tab
    fireEvent.click(screen.getByText("Login"));
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  describe("Form Validation", () => {
    it("shows validation errors for short inputs", async () => {
      renderAuthModal();

      // Submit with empty fields
      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      expect(
        await screen.findAllByText(/must be at least 3 characters/)
      ).toHaveLength(2);
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it("allows submission with valid inputs", async () => {
      renderAuthModal();
      const testValues: FormValues = {
        username: "testuser",
        password: "testpass",
      };

      // Fill out form
      await userEvent.type(
        screen.getByLabelText("Username"),
        testValues.username
      );
      await userEvent.type(
        screen.getByLabelText("Password"),
        testValues.password
      );

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(testValues);
      });
    });
  });

  describe("Authentication Flow", () => {
    it("calls onLogin with form values for login", async () => {
      renderAuthModal();
      const testValues: FormValues = {
        username: "testuser",
        password: "testpass",
      };

      // Fill out form
      await userEvent.type(
        screen.getByLabelText("Username"),
        testValues.username
      );
      await userEvent.type(
        screen.getByLabelText("Password"),
        testValues.password
      );

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(testValues);
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("calls onSignup with form values for signup", async () => {
      renderAuthModal();
      const testValues: FormValues = {
        username: "newuser",
        password: "newpass",
      };

      // Switch to signup tab
      fireEvent.click(screen.getByText("Sign Up"));

      // Fill out form
      await userEvent.type(
        screen.getByLabelText("Username"),
        testValues.username
      );
      await userEvent.type(
        screen.getByLabelText("Password"),
        testValues.password
      );

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      await waitFor(() => {
        expect(mockOnSignup).toHaveBeenCalledWith(testValues);
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("shows error toast when login fails", async () => {
      const error = new Error("Invalid credentials");
      mockOnLogin.mockRejectedValueOnce(error);
      renderAuthModal();

      // Fill out form
      await userEvent.type(screen.getByLabelText("Username"), "testuser");
      await userEvent.type(screen.getByLabelText("Password"), "wrongpass");

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials or user not found.",
        });
      });
    });

    it("shows error toast when signup fails", async () => {
      const error = new Error("Username taken");
      mockOnSignup.mockRejectedValueOnce(error);
      renderAuthModal();

      // Switch to signup tab
      fireEvent.click(screen.getByText("Sign Up"));

      // Fill out form
      await userEvent.type(screen.getByLabelText("Username"), "takenuser");
      await userEvent.type(screen.getByLabelText("Password"), "testpass");

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

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
      };
      mockOnSignup.mockRejectedValueOnce(serverError);
      renderAuthModal();

      // Switch to signup tab
      fireEvent.click(screen.getByText("Sign Up"));

      // Fill out form
      await userEvent.type(screen.getByLabelText("Username"), "takenuser");
      await userEvent.type(screen.getByLabelText("Password"), "testpass");

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: "destructive",
          title: "Signup Failed",
          description: "Username is already taken",
        });
      });
    });
  });
});
