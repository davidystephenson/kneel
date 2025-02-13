import { ZodSchema, z } from 'zod'

export interface RequestPayloadProps <I, Schema extends ZodSchema<I>> {
  body: z.infer<Schema>
  encoding?: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
  i: Schema
}
export interface NotRequestPayloadProps {
  body?: undefined
  encoding?: undefined
  i?: undefined
}
export type MaybeRequestPayloadProps <I, Schema extends ZodSchema<I>> = RequestPayloadProps<I, Schema> | NotRequestPayloadProps

export interface FetchProps <Response> {
  debug?: boolean
  headers?: HeadersInit
  method?: string
  o?: ZodSchema<Response>
  url: string
}

export type KneelProps <I, Schema extends ZodSchema<I>, Response> = FetchProps<Response> & MaybeRequestPayloadProps<I, Schema>
