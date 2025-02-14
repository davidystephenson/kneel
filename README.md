# `kneel`

Fetch with Zod.

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

`kneel` requires a `zod` schema for the response. It also requires a schema if you include a body.

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

<table>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
<th>Required</th>
<th>Default</th>
<th>Example</th>
</tr>
<tr>
<td>

```ts
url
```

</td>
<td>

```ts
string
```

</td>
<td>URL to fetch</td>
<td>Yes</td>
<td></td>
<td>

```ts
'http://localhost:3000'
```

</td>
</tr>
<tr>
<td>

```ts
i
```

</td>
<td>

```ts
ZodSchema
```

</td>
<td>Request body schema</td>
<td>No</td>
<td></td>
<td>

```ts
z.object({
  input: z.string()
})
```

</td>
</tr>
<tr>
<td>

```ts
o
```

</td>
<td>

```ts
ZodSchema
```

</td>
<td>Response body schema</td>
<td>No</td>
<td></td>
<td>

```ts
z.object({
  output: z.number()
})
```

</td>
</tr>
<tr>
<td>

```ts
body
```

</td>
<td>

```ts
z.infer<typeof i>
```

</td>
<td>Request body</td>
<td>

If `i` is set

</td>
<td></td>
<td>

```ts
{ input: 'hello' }
```

</td>
</tr>
<tr>
<td>

```ts
method
```

</td>
<td>

```ts
'GET'
| 'POST'
| 'PUT'
| 'DELETE'
| 'PATCH'
```

</td>
<td>The HTTP method</td>
<td>No</td>
<td>

```ts
'GET'
```

</td>
<td>

```ts
'POST'
```

</td>
</tr>
<tr>
<td>

```ts
headers
```

</td>
<td>

```ts
HeadersInit
```

</td>
<td>Request headers</td>
<td>No</td>
<td></td>
<td>

```ts
{ Authorization: 'Bearer token' }
```

</td>
</tr>
<tr>
<td>

```ts
encoding
```

</td>
<td>

```ts
'application/x-www-form-urlencoded'
| 'multipart/form-data'
| 'text/plain'
| 'application/json'
```

</td>
<td>Request encoding</td>
<td>No</td>
<td>

```ts
'application/json'
```

</td>
<td>

```ts
'text/plain'
```

</td>
</tr>
<tr>
<td>

```ts
debug
```

</td>
<td>

```ts
boolean
```

</td>
<td>Print request, response, and errors</td>
<td>No</td>
<td>

```ts
false
```

</td>
<td>

```ts
true
```

</td>
</tr>
</table>

`kneel` takes a single object with one required parameter:

* `url`, a string

You can optionally set:

* `method`, a string
* `headers`, matching the native `fetch` headers

### Output

You can optionaly set an output schema with:

* `o`, a `zod` schema

If there is an `o` schema, kneel will parse the response body with `.json()`and `o.parse()`, then return it. If there is no `o` schema, `kneel` will return `void`.

### Input

You can optionally include a request payload with:

* `i`, a `zod` schema
* `body`, a value matching the `i` schema

The request `body` will be `parse`d by the `i` schema. By default including a body sets the method to `'POST'`.

#### Encoding

By default the request body will be encoded with `JSON.stringify()` and the `Content-Type` header will be set to `application/json`. You can override this with:

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

The `encoding` becomes the value of the `Content-Type` header. `application/x-www-form-urlencoded` uses `new URLSearchParams()` to encode the body. `multipart/form-data` uses `new FormData()`. `text/plain` uses `String()`.

## `kneelMaker`

You can create a `kneel` function with custom parameters using `kneelMaker`.

```ts
import { kneelMaker } from 'kneel'
import { z } from 'zod'

const kneelHere = kneelMaker({
  make: (props) => {
    const { url, ...rest } = props
    const urlHere = `http://localhost:3000${url}`
    return { url: urlHere, ...rest }
  }
})
const outputSchema = z.object({ output: z.number() })
const response = await kneelHere({
  url: '/hello', // Request is sent to 'http://localhost:3000/hello'
  o: outputSchema
})
console.log(response.output) // number
```

<table>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Description</th>
<th>Required</th>
<th>Default</th>
<th>Example</th>
</tr>
<tr>
<td>

```ts
make
```

</td>
<td>

```ts
(props: Props) => Props
```

</td>
<td>Custom props callback</td>
<td>Yes</td>
<td></td>
<td>

```ts
props => {
  const { url, ...rest } = props
  const urlHere = `http://localhost:3000${url}`
  return { url: urlHere, ...rest }
}
```

</td>
</tr>
<tr>
<td>

```ts
debug
```

</td>
<td>

```ts
boolean
```

</td>
<td>Print input and output props</td>
<td>No</td>
<td>

```ts
false
```

</td>
<td>

```ts
true
```

</td>
</tr>
</table>

`kneelMaker` returns a custom `kneel` function with the same parameters as `kneel`.
Each time the custom `kneel` is called, the props will be passed to the `make` callback parameter, and the props `make` returns will be passed to `kneel`.
