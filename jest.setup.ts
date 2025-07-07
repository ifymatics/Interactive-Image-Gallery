import "@testing-library/jest-dom";
import "whatwg-fetch";

// Mock console methods to keep test output clean
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
