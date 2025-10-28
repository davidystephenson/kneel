// Global test setup
import 'jest'

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks()
})