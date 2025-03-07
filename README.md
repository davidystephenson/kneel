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

const output = await kneel({
  url: 'http://localhost:3000',
  o: z.object({ names: z.array(z.string()) })
})
const uppercaseNames = output.names.map((name) => name.toUpperCase())

const writeOutput = await kneel({
  url: 'http://localhost:3000',
  i: z.object({ name: z.string() }),
  body: { name: 'Zelda Fitzgerald' },
  o: z.object({ count: z.number() })
})
console.log(typeof writeOutput.count) // 'number'
```

## Problem

Making validation functional can require patterns like annotating with `unknown`.

### Without `kneel`

```ts
import { z } from 'zod'

const outputSchema = z.object({ output: z.number() })
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

`kneel` requires a Zod schema for a usable response. It also requires a schema if you include a body.

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
    body: { input: 'increment' },
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

`'GET'`,
`'POST'` if `i` is set

</td>
<td>

```ts
'PUT'
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
{ 'x-api-key': 'token' }
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

if `i` is set

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
const inputSchema = z.object({ input: z.string() })
const response = await kneel({
  url: 'http://localhost:3000',
  i: inputSchema,
  body: { input: 'hello' },
  encoding: 'application/x-www-form-urlencoded',
})
```

The `encoding` becomes the value of the `Content-Type` header. `application/x-www-form-urlencoded` uses `new URLSearchParams()` to encode the body. `multipart/form-data` uses `new FormData()`. `text/plain` uses `String()`.

### `KneelProps`

You can import the `KneelProps` type to match the parameters of `kneel`.

```ts
import kneel, { KneelProps } from 'kneel'
import { z, ZodSchema } from 'zod'

const fetchAndLog = async <
  Input,
  InputSchema extends ZodSchema<Input>,
  Output = void
>(props: KneelProps<Input, InputSchema, Output>) => {
  const response = await kneel(props)
  console.log('Response:', response)
}

await fetchAndLog({
  url: 'http://localhost:3000/hello',
  o: z.literal('world')
})
// 'Response: world'
```

`KneelProps` takes three generic parameters:

<table>
<tr>
<th>Parameter</th>
<th>Extends</th>
<th>Description</th>
<th>Default</th>
<th>Example</th>
</tr>
<tr>
<td>

```ts
Input
```

</td>
<td>
</td>
<td>Request body</td>
<td></td>
<td>

```ts
{ input: string }
```

</td>
</tr>
<tr>
<td>

```ts
InputSchema
```

</td>
<td>

```ts
ZodSchema<Input>
```

</td>
<td>Request body schema</td>
<td></td>
<td>

```ts
ZodObject<{ name: ZodString }>
```

</td>
</tr>
<tr>
<td>

```ts
Output
```

</td>
<td>
</td>
<td>Response body</td>
<td>

```ts
void
```

</td>
<td>

```ts
{ output: number }
```

</td>
</tr>
</table>

## `kneelMaker`

You can create a `kneel` function with custom parameter middlewere using `kneelMaker`.

```ts
import { kneelMaker } from 'kneel'
import { z } from 'zod'

const kneelHere = kneelMaker({
  make: ({ url, ...rest }) => {
    return { url: `http://localhost:3000${url}`, ...rest }
  }
})
const outputSchema = z.literal('world')
const response = await kneelHere({
  url: '/hello', // Request is sent to 'http://localhost:3000/hello'
  o: outputSchema 
})
console.log(response) // 'world' 
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
<
  Input,
  InputSchema extends ZodSchema<Input>,
  Output = void
> (
  props: KneelProps<Input, InputSchema, Output>
) => KneelProps<Input, InputSchema, Output>
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

`kneelMaker` returns a custom function with the same parameters as `kneel`.
Each time the custom function is called, the props will be passed to the `make` callback, and the props `make` returns will be passed to `kneel`.
