import z from 'zod'
import kneel from '../src/kneel'

describe('kneel', () => {
  let fetchSpy: jest.SpyInstance

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return new Response('{ "message": "hello" }', { status: 200 })
    })
  })

  it('should call fetch once', async () => {
    await kneel({ url: 'https://example.com' })
    expect(fetchSpy).toHaveBeenCalledWith('https://example.com', {})
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('should validate output', async () => {
    const outputSchema = z.object({ message: z.string() })
    type Output = z.infer<typeof outputSchema>
    const expected: Output = { message: 'hello' }
    const parseSpy = jest.spyOn(outputSchema, 'parse')
    const result = await kneel({
      url: 'https://api.example.com/users/1',
      outputSchema
    })
    expect(parseSpy).toHaveBeenCalledWith({ message: 'hello' })
    expect(parseSpy).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expected)
  })

  it('should include custom headers', async () => {
    await kneel({
      url: 'https://api.example.com/data',
      headers: {
        'Authorization': 'Bearer token123',
        'Accept': 'application/json'
      }
    })

    expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/data', {
      headers: {
        'Authorization': 'Bearer token123',
        'Accept': 'application/json'
      }
    })
  })

  describe('with input', () => {
    it('should default to POST and the Content-Type: application/json header', async () => {
      const inputSchema = z.object({
        name: z.string(),
        email: z.string()
      })
      const input = { name: 'Zelda', email: 'zelda@fitzgerald.com' }
      await kneel({
        url: 'https://api.example.com/data',
        inputSchema,
        input
      })
      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('should merge existing headers with Content-Type', async () => {
      const inputSchema = z.object({
        name: z.string(),
        email: z.string()
      })
      const input = { name: 'Zelda', email: 'zelda@fitzgerald.com' }
      await kneel({
        url: 'https://api.example.com/data',
        headers: {
          'Authorization': 'Bearer token',
          'X-Custom': 'value'
        },
        inputSchema,
        input
      })

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer token',
          'X-Custom': 'value',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      })
    })

    describe('with explicit method', () => {
      it('should override the method', async () => {
        const inputSchema = z.object({
          name: z.string(),
          email: z.string()
        })
        const input = { name: 'Zelda', email: 'zelda@fitzgerald.com' }
        await kneel({
          url: 'https://api.example.com/users/1',
          method: 'PUT',
          inputSchema,
          input
        })
        expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/users/1', {
          method: 'PUT',
          body: JSON.stringify(input),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      })
    })

    describe('with application/x-www-form-urlencoded', () => {
      it('should use UrlSearchParams', async () => {
        const inputSchema = z.object({
          username: z.string(),
          password: z.string()
        })
        const input = { username: 'john', password: 'secret123' }
        await kneel({
          url: 'https://api.example.com/login',
          inputSchema,
          input,
          contentType: 'application/x-www-form-urlencoded'
        })
        const expectedBody = new URLSearchParams()
        expectedBody.append('username', 'john')
        expectedBody.append('password', 'secret123')
        expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/login', {
          method: 'POST',
          body: expectedBody,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      })
    })

    describe('with multipart/form-data', () => {
      it('should handle strings', async () => {
        const inputSchema = z.object({
          title: z.string(),
          description: z.string()
        })
        const input = { title: 'My File', description: 'A test file' }
        await kneel({
          url: 'https://api.example.com/upload',
          inputSchema,
          input,
          contentType: 'multipart/form-data'
        })

        const call = fetchSpy.mock.calls[0]
        expect(call[1].body).toBeInstanceOf(FormData)
        expect(call[1].body.get('title')).toBe('My File')
        expect(call[1].body.get('description')).toBe('A test file')
        expect(call[1].headers).toEqual({
          'Content-Type': 'multipart/form-data'
        })
      })

      it('should handle multipart/form-data with Blob', async () => {
        const blob = new Blob(['file content'], { type: 'text/plain' })
        const inputSchema = z.object({
          file: z.instanceof(Blob),
          name: z.string()
        })
        const input = { file: blob, name: 'test.txt' }

        await kneel({
          url: 'https://api.example.com/files',
          inputSchema,
          input,
          contentType: 'multipart/form-data'
        })

        const call = fetchSpy.mock.calls[0]
        expect(call[1].body).toBeInstanceOf(FormData)
        expect(call[1].body.get('file')).toBeInstanceOf(File)
        expect(call[1].body.get('name')).toBe('test.txt')
        expect(call[1].headers).toEqual({
          'Content-Type': 'multipart/form-data'
        })
      })

      it('should throw error for unsupported multipart/form-data values', async () => {
        const inputData = { count: 123, active: true }

        await expect(kneel({
          url: 'https://api.example.com/data',
          inputSchema: z.object({
            count: z.number(),
            active: z.boolean()
          }),
          input: inputData,
          contentType: 'multipart/form-data'
        })).rejects.toThrow('multipart/form-data requires string or Blob values')
      })
    })

    describe('with text/plain', () => {
      it('should convert to a string', async () => {
        await kneel({
          url: 'https://api.example.com/webhook',
          inputSchema: z.number(),
          input: 42,
          contentType: 'text/plain'
        })
        expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/webhook', {
          method: 'POST',
          body: '42',
          headers: {
            'Content-Type': 'text/plain'
          }
        })
      })
    })

    describe('with unsupported content type', () => {
      it('should throw an error', async () => {
        await expect(kneel({
          url: 'https://api.example.com/data',
          inputSchema: z.string(),
          input: '<h1>hello</h1>',
          // @ts-expect-error
          contentType: 'application/xml'
        })).rejects.toThrow('Unsupported content type: application/xml')
      })
    })
  })

  it('should throw error for non-ok responses', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(async () => {
      return new Response('Bad request', { status: 400 })
    })
    await expect(kneel({
      url: 'https://api.example.com/data',
      method: 'GET'
    })).rejects.toThrow('Bad request')
  })

  it('should throw error for invalid input', async () => {
    const input = { name: 123 }
    await expect(kneel({
      url: 'https://api.example.com/users',
      inputSchema: z.object({ name: z.string() }),
      // @ts-expect-error
      input
    })).rejects.toThrow()
  })

  it('should throw error for validation failures on output', async () => {
    const outputSchema = z.object({ id: z.number() })
    jest.spyOn(global, 'fetch').mockImplementationOnce(async () => {
      return new Response('{ "id": "not-a-number" }', { status: 200 })
    })
    await expect(kneel({
      url: 'https://api.example.com/users/1',
      outputSchema
    })).rejects.toThrow()
  })
  describe('with debug mode', () => {
    let consoleSpy: jest.SpyInstance
    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'info').mockImplementation()
    })
    afterEach(() => {
      consoleSpy.mockRestore()
    })
    it('should log request body', async () => {
      const inputSchema = z.object({
        id: z.number(),
        name: z.string()
      })
      const input = { id: 1, name: 'Test User' }
      await kneel({
        url: 'https://api.example.com/data',
        inputSchema,
        input,
        debug: true
      })
      expect(consoleSpy).toHaveBeenCalledWith('kneel request body', input)
    })

    it('should log response', async () => {
      const outputSchema = z.object({
        message: z.string()
      })
      const responseData = { message: 'hello' }
      jest.spyOn(global, 'fetch').mockImplementationOnce(async () => {
        return new Response(JSON.stringify(responseData), { status: 200 })
      })
      await kneel({
        url: 'https://api.example.com/data',
        outputSchema,
        debug: true
      })
      expect(consoleSpy).toHaveBeenCalledWith('kneel json response', responseData)
    })

    it('should log errors when debug is enabled', async () => {
      jest.spyOn(global, 'fetch').mockImplementationOnce(async () => {
        return new Response('Unexpected error', { status: 500 })
      })
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      try {
        await kneel({
          url: 'https://api.example.com/data',
          method: 'GET',
          debug: true
        })
      } catch (error) {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalledWith('kneel response error', 'Unexpected error')
      errorSpy.mockRestore()
    })
  })
})