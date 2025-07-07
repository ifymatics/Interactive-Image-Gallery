// import type { Config } from "jest";

// const config: Config = {
//   preset: "ts-jest",
//   testEnvironment: "jsdom",

//   clearMocks: true,
//   collectCoverage: true,
//   coverageDirectory: "coverage",
//   coverageProvider: "v8",

//   // Transform TypeScript and modern JavaScript
//   transform: {
//     "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
//   },

//   // Allow ESM libraries like lucide-react to be transformed
//   transformIgnorePatterns: [
//     "node_modules/(?!lucide-react|@radix-ui|framer-motion)",
//   ],

//   // Resolve `@/` to `src/`
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/src/$1",

//     // Optional: mock static imports like CSS/images if needed
//     "\\.(css|less|scss|sass)$": "identity-obj-proxy",
//     "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.ts",
//   },

//   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

//   testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
// };

// export default config;
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },

  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json", // ✅ Explicitly use the right config
    },
  },

  transformIgnorePatterns: [
    "node_modules/(?!lucide-react|@radix-ui|framer-motion)",
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.ts",
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};

export default config;
