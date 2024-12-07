import { ZodSchema } from 'zod'

export interface RequestPayloadProps <Body> {
  body: Body
  request: ZodSchema<Body>
  formEncoded?: boolean
}
export type MaybeRequestPayloadProps <Payload> = RequestPayloadProps<Payload> | { payload?: undefined, requestSchema?: undefined }

export interface FetchProps <Response> {
  debug?: boolean
  headers?: RequestInit['headers']
  method?: string
  response: ZodSchema<Response>
  url: string
}

export type KneelProps <Request, Response> = FetchProps<Response> & MaybeRequestPayloadProps<Request>
