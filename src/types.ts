import { ZodSchema, z } from 'zod'

export interface RequestPayloadProps <I, Schema extends ZodSchema<I>> {
  body: z.infer<Schema>
  request: Schema
  encoding?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
}
export type MaybeRequestPayloadProps <I, Schema extends ZodSchema<I>> = RequestPayloadProps<I, Schema> | { payload?: undefined, requestSchema?: undefined }

export interface FetchProps <Response> {
  debug?: boolean
  headers?: HeadersInit
  method?: string
  response?: ZodSchema<Response>
  url: string
}

export type KneelProps <I, Schema extends ZodSchema<I>, Response> = FetchProps<Response> & MaybeRequestPayloadProps<I, Schema>
