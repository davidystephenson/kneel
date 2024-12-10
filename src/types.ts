import { ZodSchema } from 'zod'

export interface RequestPayloadProps <Body> {
  body: Body
  request: ZodSchema<Body>
  encoding?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
}
export type MaybeRequestPayloadProps <Payload> = RequestPayloadProps<Payload> | { payload?: undefined, requestSchema?: undefined }

export interface FetchProps <Response> {
  debug?: boolean
  headers?: HeadersInit
  method?: string
  response: ZodSchema<Response>
  url: string
}

export type KneelProps <Request, Response> = FetchProps<Response> & MaybeRequestPayloadProps<Request>
