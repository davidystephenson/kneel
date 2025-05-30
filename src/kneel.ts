import { ZodSchema } from 'zod'
import { KneelProps } from './types'
import addContentType from './addContentType'

export default async function kneel<
  RequestBody,
  InputSchema extends ZodSchema<RequestBody>,
  ResponseBody = void
> (
  props: KneelProps<RequestBody, InputSchema, ResponseBody>
): Promise<ResponseBody> {
  const debug = props.debug ?? false
  const init: RequestInit = {}
  if (props.method != null) {
    init.method = props.method
  }
  if (props.headers != null) {
    init.headers = props.headers
  }
  if ('input' in props && props.input != null) {
    if (init.method == null) {
      init.method = 'POST'
    }
    if (debug) {
      console.info('kneel request body', props.body)
    }
    try {
      const body = props.input.parse(props.body)
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
  if (props.output == null) {
    return undefined as unknown as ResponseBody
  }
  const json: unknown = await response.json()
  if (debug) {
    console.info('kneel json response', json)
  }
  const payload = props.output.parse(json)
  return payload
}
