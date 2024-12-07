# `kneel`

Fetch with zod

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
const upper = read.names.map((name) => name.toUpperCase())

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
function read (): Output {
  const response = await fetch('http://localhost:3000')
  // Don't use the unvalidated data
  const json: unknown = await response.json()
  return schema.parse(json)
}

const inputSchema = z.object({ input: z.string() })
type Input = z.infer<typeof schema>
function write (input: Input): Output {
  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    body: JSON.stringify(input)
  })
  const json: unknown = await response.json()
  return schema.parse(json)
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
type Output = z.infer<typeof schema>
async function read (input: Input): Output {
  return await kneel({
    url: 'http://localhost:3000'
    response: outputSchema,
  })
}

const inputSchema = z.object({ input: z.string() })
type Input = z.infer<typeof schema>
async function write (input: input): Output {
  return await kneel({
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
* `headers`, the native `fetch` headers type

You can optionally include a request payload with:

* `request`, a `zod` schema
* `body`, the `request` schema's type

By default including a body sets the method to `POST`.

By default the request body will be stringified.
You can optionally use `URLSearchParams` and automatically the `Content-Type` header to `application/x-www-form-urlencoded` with:

* `formEncoded`, a boolean

```ts
const response = await kneel({
  url: 'http://localhost:3000',
  response: outputSchema,
  body: { input: 'hello' },
  request: inputSchema,
  formEncoded: true
})
```
