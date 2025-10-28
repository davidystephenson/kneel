import kneelMaker from '../src/kneelMaker'
import kneel from '../src/kneel'
import { z } from 'zod'

// Mock the kneel function
jest.mock('../src/kneel')
const mockKneel = jest.mocked(kneel)

describe('kneelMaker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should create a function that calls kneel with transformed props', async () => {
      const mockResponse = { id: 1, message: 'success' }
      mockKneel.mockResolvedValueOnce(mockResponse)

      const make = jest.fn((props) => ({
        ...props,
        url: `https://api.example.com${props.url}`
      }))

      const madeKneel = kneelMaker({ make })

      const inputSchema = z.object({ name: z.string() })
      const outputSchema = z.object({ id: z.number(), message: z.string() })

      const result = await madeKneel({
        url: '/users',
        method: 'POST',
        inputSchema,
        outputSchema,
        input: { name: 'John' }
      })

      expect(make).toHaveBeenCalledWith({
        url: '/users',
        method: 'POST',
        inputSchema,
        outputSchema,
        input: { name: 'John' }
      })

      expect(mockKneel).toHaveBeenCalledWith({
        url: 'https://api.example.com/users',
        method: 'POST',
        inputSchema,
        outputSchema,
        input: { name: 'John' }
      })

      expect(result).toEqual(mockResponse)
    })

    it('should pass through props unchanged when make returns same props', async () => {
      const mockResponse = { data: 'test' }
      mockKneel.mockResolvedValueOnce(mockResponse)

      const make = jest.fn((props) => props)
      const madeKneel = kneelMaker({ make })

      const originalProps = {
        url: 'https://api.example.com/data',
        method: 'GET'
      }

      const result = await madeKneel(originalProps)

      expect(make).toHaveBeenCalledWith(originalProps)
      expect(mockKneel).toHaveBeenCalledWith(originalProps)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('debug functionality', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'info').mockImplementation()
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should log input and output when debug is enabled', async () => {
      const mockResponse = { success: true }
      mockKneel.mockResolvedValueOnce(mockResponse)

      const make = jest.fn((props) => ({
        ...props,
        headers: { 'X-API-Key': 'secret' }
      }))

      const madeKneel = kneelMaker({ make, debug: true })

      const inputProps = {
        url: '/test',
        method: 'GET'
      }

      await madeKneel(inputProps)

      expect(consoleSpy).toHaveBeenCalledWith('kneelMaker input', inputProps)
      expect(consoleSpy).toHaveBeenCalledWith('kneelMaker output', {
        ...inputProps,
        headers: { 'X-API-Key': 'secret' }
      })
    })

    it('should not log when debug is disabled', async () => {
      const mockResponse = { success: true }
      mockKneel.mockResolvedValueOnce(mockResponse)

      const make = jest.fn((props) => props)
      const madeKneel = kneelMaker({ make, debug: false })

      await madeKneel({
        url: '/test',
        method: 'GET'
      })

      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not log when debug is undefined', async () => {
      const mockResponse = { success: true }
      mockKneel.mockResolvedValueOnce(mockResponse)

      const make = jest.fn((props) => props)
      const madeKneel = kneelMaker({ make })

      await madeKneel({
        url: '/test',
        method: 'GET'
      })

      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should propagate errors from kneel', async () => {
      const error = new Error('Network error')
      mockKneel.mockRejectedValueOnce(error)

      const make = jest.fn((props) => props)
      const madeKneel = kneelMaker({ make })

      await expect(madeKneel({
        url: '/test',
        method: 'GET'
      })).rejects.toThrow('Network error')
    })

    it('should handle errors from make function', async () => {
      const make = jest.fn(() => {
        throw new Error('Make function error')
      })
      const madeKneel = kneelMaker({ make })

      await expect(madeKneel({
        url: '/test',
        method: 'GET'
      })).rejects.toThrow('Make function error')
    })
  })

  describe('TypeScript generics', () => {
    it('should maintain type safety with input and output schemas', async () => {
      const mockResponse = { id: 123, name: 'Test User', active: true }
      mockKneel.mockResolvedValueOnce(mockResponse)

      const make = jest.fn((props) => props)
      const madeKneel = kneelMaker({ make })

      const inputSchema = z.object({
        name: z.string(),
        email: z.string().email()
      })

      const outputSchema = z.object({
        id: z.number(),
        name: z.string(),
        active: z.boolean()
      })

      const result = await madeKneel({
        url: '/users',
        method: 'POST',
        inputSchema,
        outputSchema,
        input: {
          name: 'Test User',
          email: 'test@example.com'
        }
      })

      expect(typeof result.id).toBe('number')
      expect(typeof result.name).toBe('string')
      expect(typeof result.active).toBe('boolean')
    })
  })

  describe('complex make transformations', () => {
    it('should handle complex transformations', async () => {
      const mockResponse = { success: true }
      mockKneel.mockResolvedValueOnce(mockResponse)

      const make = jest.fn((props) => ({
        ...props,
        url: `https://api.${process.env.NODE_ENV || 'development'}.example.com${props.url}`,
        headers: {
          ...(props.headers || {}),
          'User-Agent': 'kneel-client/1.0',
          'Accept': 'application/json'
        },
        debug: true
      }))

      const madeKneel = kneelMaker({ make })

      await madeKneel({
        url: '/api/data',
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' }
      })

      expect(mockKneel).toHaveBeenCalledWith({
        url: 'https://api.test.example.com/api/data',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer token',
          'User-Agent': 'kneel-client/1.0',
          'Accept': 'application/json'
        },
        debug: true
      })
    })
  })
})