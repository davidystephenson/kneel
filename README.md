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

const read = await kneel({
  url: 'http://localhost:3000',
  response: z.object({ names: z.array(z.string()) })
})
const uppercaseNames = read.names.map((name) => name.toUpperCase())

const write = await kneel({
  url: 'http://localhost:3000',
  request: z.object({ name: z.string() }),
  response: z.object({ count: z.number() }),
  body: { name: 'Zelda Fitzgerald' }
})
console.log(typeof write.count) // 'number'
```

## Problem

Many requests require validation.
Making it functional can require patterns like annotating with `unknown`.

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
    response: outputSchema,
  })
}

const inputSchema = z.object({ input: z.string() })
type Input = z.infer<typeof inputSchema>
async function write (input: Input): Promise<Output> {
  return kneel({
    url: 'http://localhost:3000',
    response: outputSchema,
    body: input,
    request: inputSchema,
  })
}
```

`kneel` takes a single object with two required parameters:

* `url`, a string
* `response`, a `zod` schema for the response payload

You can optionally set:

* `method`, a string
* `headers`, matching the native `fetch` headers

You can optionally include a request payload with:

* `request`, a `zod` schema
* `body`, a value matching the `request` schema

The `body` will be parsed by the `request` schema.
By default including a body sets the method to `POST`.

By default the request body will be stringified and the `Content-Type` header will be set to `application/json`.
You can override this with:

* `encoding`, either `'application/x-www-form-urlencoded'`, `'multipart/form-data'`, `'text/plain'`, or `'application/json'`, .

The `encoding` will be set as the value of the `Content-Type` header. `application/x-www-form-urlencoded` uses `URLSearchParams` to encode the body; `multipart/form-data` uses `FormData`; `text/plain` uses `String`.

`kneel` returns a promise that resolves to the parsed response payload.
