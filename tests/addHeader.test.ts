import addHeader from '../src/addHeader'

describe('addHeader', () => {
  describe('when headers is an array', () => {
    describe('when the array is populated', () => {
      it('should push a new header tuple to the array', () => {
        const headers: [string, string][] = [['Accept', 'application/json']]
        addHeader({
          headers,
          key: 'Content-Type',
          value: 'application/json'
        })
        expect(headers).toEqual([
          ['Accept', 'application/json'],
          ['Content-Type', 'application/json']
        ])
      })
    })

    describe('when the array is empty', () => {
      it('should populate the array', () => {
        const headers: [string, string][] = []
        addHeader({
          headers,
          key: 'User-Agent',
          value: 'kneel/1.0'
        })
        expect(headers).toEqual([
          ['User-Agent', 'kneel/1.0']
        ])
      })
    })
  })

  describe('when headers is a Headers instance', () => {
    it('should set the header', () => {
      const headers = new Headers()
      addHeader({
        headers,
        key: 'Content-Type',
        value: 'application/json'
      })
      expect(headers.get('Content-Type')).toBe('application/json')
    })

    it('should overwrite existing header', () => {
      const headers = new Headers()
      headers.set('Content-Type', 'text/plain')
      addHeader({
        headers,
        key: 'Content-Type',
        value: 'application/json'
      })
      expect(headers.get('Content-Type')).toBe('application/json')
    })
  })

  describe('when headers is a plain object', () => {
    it('should add property to the object', () => {
      const headers: Record<string, string> = {
        Accept: 'application/json'
      }
      addHeader({
        headers,
        key: 'Content-Type',
        value: 'application/json'
      })
      expect(headers).toEqual({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      })
    })

    it('should overwrite existing property', () => {
      const headers: Record<string, string> = {
        'Content-Type': 'text/plain'
      }
      addHeader({
        headers,
        key: 'Content-Type',
        value: 'application/json'
      })
      expect(headers).toEqual({
        'Content-Type': 'application/json'
      })
    })

    it('should handle empty object', () => {
      const headers: Record<string, string> = {}
      addHeader({
        headers,
        key: 'X-Custom-Header',
        value: 'custom-value'
      })
      expect(headers).toEqual({
        'X-Custom-Header': 'custom-value'
      })
    })
  })
})
