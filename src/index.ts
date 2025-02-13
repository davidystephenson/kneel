import { ZodSchema } from 'zod'
import addContentType from './addContentType'
import { KneelProps } from './types'

export { KneelProps } from './types'

export default async function kneel<I, Schema extends ZodSchema<I>, Response = void> (
  props: KneelProps<I, Schema, Response>
): Promise<Response> {
  const debug = props.debug ?? false
  const init: RequestInit = {}
  if (props.method != null) {
    init.method = props.method
  }
  if (props.headers != null) {
    init.headers = props.headers
  }
  if ('i' in props) {
    if (props.i == null) {
      throw new Error('parameter i is required when including a body')
    }
    if (props.body == null) {
      throw new Error('paramater body is required when including i')
    }
    if (init.method == null) {
      init.method = 'POST'
    }
    if (debug) {
      console.debug('kneel request body', props.i)
    }
    try {
      const body = props.i.parse(props.body)
      const encoding = 'encoding' in props
        ? props.encoding == null
          ? 'application/json'
          : props.encoding
        : 'application/json'
      switch (encoding) {
        case 'application/json': {
          init.body = JSON.stringify(body)
          break
        }
        case 'application/x-www-form-urlencoded': {
          init.body = new URLSearchParams()
          for (const key in body) {
            const value = body[key]
            const string = String(value)
            init.body.append(key, string)
          }
          break
        }
        case 'multipart/form-data': {
          init.body = new FormData()
          for (const key in body) {
            const value = body[key]
            if (
              !(value instanceof Blob) &&
              typeof value !== 'string'
            ) {
              throw new Error(`Unsupported value type: ${String(value)}`)
            }
            init.body.append(key, value)
          }
          break
        }
        case 'text/plain': {
          init.body = String(body)
          break
        }
        default: throw new Error(`Unsupported encoding: ${String(encoding)}`)
      }
      addContentType({
        headers: init.headers,
        value: encoding
      })
    } catch (error) {
      if (debug) {
        console.error('kneel request body error', error)
      }
      throw error
    }
  }
  const response = await fetch(props.url, init)
  if (!response.ok) {
    const text = await response.text()
    if (debug) {
      console.error('kneel response error', text)
    }
    throw new Error(text)
  }
  if (props.o == null) {
    return undefined as unknown as Response
  }
  const json: unknown = await response.json()
  if (debug) {
    console.debug('kneel json', json)
  }
  const payload = props.o.parse(json)
  return payload
}
