// module.exports = {
//   preset: "ts-jest",
//   testEnvironment: "jsdom",
//   roots: ["<rootDir>/src"],
//   modulePaths: ["<rootDir>/src"],
//   moduleDirectories: ["node_modules", "src"],
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
//   transform: {
//     "^.+\\.(ts|tsx)$": [
//       "ts-jest",
//       {
//         tsconfig: "tsconfig.jest.json",
//         diagnostics: {
//           warnOnly: true,
//         },
//       },
//     ],
//   },
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/src/$1",
//     "\\.(css|less|scss|sass)$": "identity-obj-proxy",
//   },
// };
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!lucide-react)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
