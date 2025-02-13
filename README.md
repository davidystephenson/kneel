# `kneel`

Fetch with `zod`.

## Installation

```sh
npm install kneel
```

## Usage

```ts
import kneel from 'kneel'
import { z } from 'zod'

const readResult = await kneel({
  url: 'http://localhost:3000',
  o: z.object({ names: z.array(z.string()) })
})
const uppercaseNames = readResult.names.map((name) => name.toUpperCase())

const writeResult = await kneel({
  url: 'http://localhost:3000',
  i: z.object({ name: z.string() }),
  body: { name: 'Zelda Fitzgerald' },
  o: z.object({ count: z.number() })
})
console.log(typeof writeResult.count) // 'number'
```

## Problem

Making validation functional can require patterns like annotating with `unknown`.

### Without `kneel`

```ts
import { z } from 'zod'

const outputSchema = z.objet({ output: z.number() })
type Output = z.infer<typeof schema>
async function read (): Promise<Output> {
  const response = await fetch('http://localhost:3000')
  // Don't use the unvalidated data
  const json: unknown = await response.json()
  return outputSchema.parse(json)
}

const inputSchema = z.object({ input: z.string() })
type Input = z.infer<typeof schema>
async function write (input: Input): Promise<Output> {
  const body = inputSchema.parse(input)
  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    body: JSON.stringify(body)
  })
  const json: unknown = await response.json()
  return outputSchema.parse(json)
}
```

## Solution

`kneel` requires a `zod` schema for the response.
It also requires a schema if you include a body.

### With `kneel`

```ts
import kneel from 'kneel'
import { z } from 'zod'

const outputSchema = z.object({ output: z.number() })
type Output = z.infer<typeof outputSchema>
async function read (input: Input): Promise<Output> {
  return kneel({
    url: 'http://localhost:3000',
    o: outputSchema
  })
}

const inputSchema = z.object({ input: z.string() })
type Input = z.infer<typeof inputSchema>
async function write (input: Input): Promise<Output> {
  return kneel({
    url: 'http://localhost:3000',
    i: inputSchema,
    body: input,
    o: outputSchema
  })
}
```

## Parameters

| Parameter | Type | Description | Required | Default | Example |
| --- | --- | --- | --- | --- | --- |
| `url` | `string` | URL to fetch | Yes | | `'http://localhost:3000'` |
| `i` | `zod.Schema` | Request body schema | No | | `z.object({ input: z.string() })` |
| `o` | `zod.Schema` | Response body schema | No | | `z.object({ output: z.number() })` |
| `body` | `unknown` | Request body | If `i` is set | | `{ input: 'hello' }` |
| `method` | `'GET'` \| `'POST'` \| `'PUT'` \| `'DELETE'` \| `'PATCH'` | The HTTP method | No | `'GET'`, `'POST'` if `o` is set | `'POST'` |
| `headers` | `HeadersInit` | Request headers | No | | `{ 'Content-Type': 'application/json' }` |
| `encoding` | `'application/x-www-form-urlencoded'` \| `'multipart/form-data'` \| `'text/plain'` \| `'application/json'` | Request encoding | No | `'application/json'` | `'application/x-www-form-urlencoded'` |

`kneel` takes a single object with one required parameter:

* `url`, a string

You can optionally set:

* `method`, a string
* `headers`, matching the native `fetch` headers

### Output

You can optionaly set an output schema with:

* `o`, a `zod` schema

Kneel will `parse` the response body with the `o` schema and return it.
If there is no `o` schema, `kneel` will return `void`.

### Input

You can optionally include a request payload with:

* `i`, a `zod` schema
* `body`, a value matching the `i` schema

The request `body` will be `parse`d by the `i` schema.
By default including a body sets the method to `'POST'`.

By default the request body will be encoded with `JSON.stringify()` and the `Content-Type` header will be set to `application/json`.
You can override this with:

* `encoding`, which must be either `'application/x-www-form-urlencoded'`, `'multipart/form-data'`, `'text/plain'`, or `'application/json'`.

```ts
const outputSchema = z.object({ output: z.number() })
const inputSchema = z.object({ input: z.string() })
const response = await kneel({
  url: 'http://localhost:3000',
  i: inputSchema,
  body: { input: 'hello' },
  encoding: 'application/x-www-form-urlencoded',
  o: outputSchema
})
```

The `encoding` becomes the value of the `Content-Type` header.
`application/x-www-form-urlencoded` uses `new URLSearchParams()` to encode the body.
`multipart/form-data` uses `new FormData()`.
`text/plain` uses `String()`.
