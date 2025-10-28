import { ZodSchema } from 'zod'
import { KneelProps } from './types'
import addHeader from './addHeader'

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
  if ('input' in props && props.inputSchema != null) {
    if (init.method == null) {
      init.method = 'POST'
    }
    if (debug) {
      console.info('kneel request body', props.input)
    }
    try {
      const body = props.inputSchema.parse(props.input)
      const contentType = 'contentType' in props
        ? props.contentType == null
          ? 'application/json'
          : props.contentType
        : 'application/json'
      switch (contentType) {
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
              throw new Error(`multipart/form-data requires string or Blob values, unsupported value for ${key}: ${String(value)}`)
            }
            init.body.append(key, value)
          }
          break
        }
        case 'text/plain': {
          init.body = String(body)
          break
        }
        default: throw new Error(`Unsupported content type: ${String(contentType)}`)
      }
      if (init.headers == null) {
        init.headers = {}
      }

      if (props.headered !== false) {
        addHeader({
          headers: init.headers,
          value: contentType,
          key: 'Content-Type'
        })
      }
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
  if (props.outputSchema == null) {
    return undefined as unknown as ResponseBody
  }
  const json: unknown = await response.json()
  if (debug) {
    console.info('kneel json response', json)
  }
  const payload = props.outputSchema.parse(json)
  return payload
}
