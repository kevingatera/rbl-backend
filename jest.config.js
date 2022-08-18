export default {
  testEnvironment: "node",
  // solve issue of jest not detecting that we closed the mongo connection
  // https://stackoverflow.com/a/71143815
  globalTeardown: '<rootDir>/tests/utils/teardown-globals.js',
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts}",
    "!src/**/*.{tsx,cjs}",
  ],
}

