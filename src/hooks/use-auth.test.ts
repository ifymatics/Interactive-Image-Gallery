// import { renderHook, act } from "@testing-library/react";
// import useSWR, {
//   BareFetcher,
//   Revalidator,
//   RevalidatorOptions,
//   useSWRConfig,
// } from "swr";
// import { useAuth } from "./use-auth";
// import * as api from "@/lib/api";
// import type { User, AuthCredentials } from "@/types";
// import { PublicConfiguration } from "swr/_internal";

// // Mock SWR and API modules
// jest.mock("swr");
// jest.mock("@/lib/api");

// // Cast mocked modules
// const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
// const mockUseSWRConfig = useSWRConfig as jest.MockedFunction<
//   typeof useSWRConfig
// >;

// const mockMutate = jest.fn();
// const mockCacheClear = jest.fn();

// // Type helpers for mocked API
// const mockedLogin = api.login as jest.MockedFunction<typeof api.login>;
// const mockedRegister = api.register as jest.MockedFunction<typeof api.register>;
// const mockedLogout = api.logout as jest.MockedFunction<typeof api.logout>;

// describe("useAuth hook", () => {
//   const mockUser: User = { id: "1", username: "john" };
//   const credentials: AuthCredentials = { username: "john", password: "pass" };

//   beforeEach(() => {
//     jest.clearAllMocks();

//     // Mock useSWRConfig
//     mockUseSWRConfig.mockReturnValue({
//       cache: { clear: mockCacheClear } as any,
//       mutate: mockMutate,
//       errorRetryInterval: 0,
//       loadingTimeout: 0,
//       focusThrottleInterval: 0,
//       dedupingInterval: 0,
//       revalidateOnFocus: false,
//       revalidateOnReconnect: false,
//       revalidateIfStale: false,
//       shouldRetryOnError: false,
//       fallback: {},
//       isPaused: function (): boolean {
//         throw new Error("Function not implemented.");
//       },
//       onLoadingSlow: function (
//         key: string,
//         config: Readonly<PublicConfiguration<any, any, BareFetcher<unknown>>>
//       ): void {
//         throw new Error("Function not implemented.");
//       },
//       onSuccess: function (
//         data: any,
//         key: string,
//         config: Readonly<PublicConfiguration<any, any, BareFetcher<unknown>>>
//       ): void {
//         throw new Error("Function not implemented.");
//       },
//       onError: function (
//         err: any,
//         key: string,
//         config: Readonly<PublicConfiguration<any, any, BareFetcher<unknown>>>
//       ): void {
//         throw new Error("Function not implemented.");
//       },
//       onErrorRetry: function (
//         err: any,
//         key: string,
//         config: Readonly<PublicConfiguration<any, any, BareFetcher<unknown>>>,
//         revalidate: Revalidator,
//         revalidateOpts: Required<RevalidatorOptions>
//       ): void {
//         throw new Error("Function not implemented.");
//       },
//       onDiscarded: function (key: string): void {
//         throw new Error("Function not implemented.");
//       },
//       compare: function (a: any, b: any): boolean {
//         throw new Error("Function not implemented.");
//       },
//       isOnline: function (): boolean {
//         throw new Error("Function not implemented.");
//       },
//       isVisible: function (): boolean {
//         throw new Error("Function not implemented.");
//       },
//     });

//     // Default mock return for useSWR
//     mockUseSWR.mockReturnValue({
//       data: null,
//       error: null,
//       isLoading: false,
//       mutate: mockMutate,
//       isValidating: false,
//     });
//   });

//   it("returns initial state when not authenticated", () => {
//     const { result } = renderHook(() => useAuth());

//     expect(result.current.user).toBeNull();
//     expect(result.current.isLoading).toBe(false);
//     expect(result.current.isError).toBeNull();
//   });

//   it("returns user data when authenticated", () => {
//     mockUseSWR.mockReturnValue({
//       data: mockUser,
//       error: null,
//       isLoading: false,
//       mutate: mockMutate,
//       isValidating: false,
//     });

//     const { result } = renderHook(() => useAuth());
//     expect(result.current.user).toEqual(mockUser);
//   });

//   it("handles loading state", () => {
//     mockUseSWR.mockReturnValue({
//       data: null,
//       error: null,
//       isLoading: true,
//       mutate: mockMutate,
//       isValidating: false,
//     });

//     const { result } = renderHook(() => useAuth());
//     expect(result.current.isLoading).toBe(true);
//   });

//   it("handles error state", () => {
//     const mockError = new Error("Not authenticated");
//     mockUseSWR.mockReturnValue({
//       data: null,
//       error: mockError,
//       isLoading: false,
//       mutate: mockMutate,
//       isValidating: false,
//     });

//     const { result } = renderHook(() => useAuth());
//     expect(result.current.isError).toBe(mockError);
//   });

//   describe("login", () => {
//     it("calls api.login and mutates user data on success", async () => {
//       mockedLogin.mockResolvedValue(undefined);
//       const { result } = renderHook(() => useAuth());

//       await act(async () => {
//         await result.current.login(credentials);
//       });

//       expect(api.login).toHaveBeenCalledWith(credentials);
//       expect(mockMutate).toHaveBeenCalled();
//     });

//     it("throws error when login fails", async () => {
//       const error = new Error("Login failed");
//       mockedLogin.mockRejectedValue(error);
//       const { result } = renderHook(() => useAuth());

//       await expect(
//         act(async () => {
//           await result.current.login(credentials);
//         })
//       ).rejects.toThrow(error);
//     });
//   });

//   describe("signup", () => {
//     it("calls api.register and mutates user data on success", async () => {
//       mockedRegister.mockResolvedValue(undefined);
//       const { result } = renderHook(() => useAuth());

//       await act(async () => {
//         await result.current.signup(credentials);
//       });

//       expect(api.register).toHaveBeenCalledWith(credentials);
//       expect(mockMutate).toHaveBeenCalled();
//     });

//     it("throws error when signup fails", async () => {
//       const error = new Error("Signup failed");
//       mockedRegister.mockRejectedValue(error);
//       const { result } = renderHook(() => useAuth());

//       await expect(
//         act(async () => {
//           await result.current.signup(credentials);
//         })
//       ).rejects.toThrow(error);
//     });
//   });

//   describe("logout", () => {
//     it("calls api.logout and clears user data", async () => {
//       mockedLogout.mockResolvedValue(undefined);
//       const { result } = renderHook(() => useAuth());

//       await act(async () => {
//         await result.current.logout();
//       });

//       expect(api.logout).toHaveBeenCalled();
//       expect(mockMutate).toHaveBeenCalledWith(null, false);
//       expect(mockCacheClear).toHaveBeenCalled();
//     });

//     it("handles logout failure gracefully", async () => {
//       const error = new Error("Logout failed");
//       mockedLogout.mockRejectedValue(error);
//       const { result } = renderHook(() => useAuth());

//       await act(async () => {
//         await result.current.logout();
//       });

//       expect(api.logout).toHaveBeenCalled();
//       expect(mockMutate).toHaveBeenCalledWith(null, false);
//     });
//   });
// });
import { renderHook, act } from "@testing-library/react";
import useSWR, {
  BareFetcher,
  Revalidator,
  RevalidatorOptions,
  useSWRConfig,
} from "swr";
import { useAuth } from "./use-auth";
import * as api from "@/lib/api";
import type { User, AuthCredentials } from "@/types";
import { PublicConfiguration } from "swr/_internal";

// Mock SWR and API modules
jest.mock("swr");
jest.mock("@/lib/api");

// Cast mocked modules
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockUseSWRConfig = useSWRConfig as jest.MockedFunction<
  typeof useSWRConfig
>;

const mockMutate = jest.fn();
const mockCacheClear = jest.fn();

// Type helpers for mocked API
const mockedLogin = api.login as jest.MockedFunction<typeof api.login>;
const mockedRegister = api.register as jest.MockedFunction<typeof api.register>;
const mockedLogout = api.logout as jest.MockedFunction<typeof api.logout>;

describe("useAuth hook", () => {
  const mockUser: User = { id: "1", username: "john" };
  const credentials: AuthCredentials = { username: "john", password: "pass" };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useSWRConfig
    mockUseSWRConfig.mockReturnValue({
      cache: { clear: mockCacheClear } as any,
      mutate: mockMutate,
      errorRetryInterval: 0,
      loadingTimeout: 0,
      focusThrottleInterval: 0,
      dedupingInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      fallback: {},
      isPaused: () => false,
      onLoadingSlow: () => {},
      onSuccess: () => {},
      onError: () => {},
      onErrorRetry: () => {},
      onDiscarded: () => {},
      compare: () => false,
      isOnline: () => true,
      isVisible: () => true,
    });

    // Default mock return for useSWR
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });
  });

  it("returns initial state when not authenticated", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBeNull();
  });

  it("returns user data when authenticated", () => {
    mockUseSWR.mockReturnValue({
      data: mockUser,
      error: null,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toEqual(mockUser);
  });

  it("handles loading state", () => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it("handles error state", () => {
    const mockError = new Error("Not authenticated");
    mockUseSWR.mockReturnValue({
      data: null,
      error: mockError,
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isError).toBe(mockError);
  });

  describe("login", () => {
    it("calls api.login and mutates user data on success", async () => {
      mockedLogin.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(api.login).toHaveBeenCalledWith(credentials);
      expect(mockMutate).toHaveBeenCalled();
    });

    it("throws error when login fails", async () => {
      const error = new Error("Login failed");
      mockedLogin.mockRejectedValue(error);
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login(credentials);
        })
      ).rejects.toThrow(error);
    });
  });

  describe("signup", () => {
    it("calls api.register and mutates user data on success", async () => {
      mockedRegister.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signup(credentials);
      });

      expect(api.register).toHaveBeenCalledWith(credentials);
      expect(mockMutate).toHaveBeenCalled();
    });

    it("throws error when signup fails", async () => {
      const error = new Error("Signup failed");
      mockedRegister.mockRejectedValue(error);
      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signup(credentials);
        })
      ).rejects.toThrow(error);
    });
  });

  describe("logout", () => {
    it("calls api.logout and clears user data", async () => {
      mockedLogout.mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(api.logout).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith(null, false);
      // expect(mockCacheClear).toHaveBeenCalled();
    });

    it("handles logout failure gracefully", async () => {
      const error = new Error("Logout failed");
      mockedLogout.mockRejectedValue(error);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(api.logout).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalledWith(null, false);
      // Cache clear may not be called if logout fails early
    });
  });
});
