[![Test](https://github.com/ChocolateLoverRaj/jsonv/actions/workflows/test.yml/badge.svg)](https://github.com/ChocolateLoverRaj/jsonv/actions/workflows/test.yml)
[![License](https://badgen.net/github/license/standard/ts-standard)](https://github.com/standard/ts-standard/blob/master/LICENSE)
[![TS-Standard - Typescript Standard Style Guide](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard)
[![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://www.typescriptlang.org/)

# jsonv
Json with variables.

## Standard with TypeScript
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/eslint-config-standard-with-typescript)

## Why
When editing json, it can be very annoying to change a certain value that's used in multiple places.
```json
{
  "points": [
    {
      "x": 53,
      "y": 0
    },
    {
      "x": 53,
      "y": 10
    },
    {
      "x": 53,
      "y": 20
    }
  ]
}
```
In the example above, all of the objects have the same `x` value. If we want to tweak the number for `x`, it will be tedious to change it for every single object.

The solution: jsonv.
```json
{
  "$jsonv": {
    "x": 53
  },
  "points": [
    {
      "x": { "$jsonv": "x" },
      "y": 0
    },
    {
      "x": { "$jsonv": "x" },
      "y": 10
    },
    {
      "x": { "$jsonv": "x" },
      "y": 20
    }
  ]
}
```
Now all you have to change to change `x` is the vars at the top.

## Syntax

### Declaring Vars
You can declare variables in any object by adding a `$jsonv` key. Its value should be an object where the keys are names of variables and values are their corresponding values.
```json
{
  "$jsonv": {
    "myVar": 24,
    "anotherVar": ["a", "json", "value"]
  }
}
```

### Referencing Vars
When `$jsonv` is a string, it is a reference to a variable.
```json
{
  "$jsonv": "nameOfVar"
}
```

### Nested Vars
Variables in nested objects are similar to JavaScript [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) variables.
```json
{
  "$jsonv": {
    "a": "hi"
  },
  "a": { "$jsonv": "a" },
  "obj1": {
    "$jsonv": {
      "a": "hello"
    },
    "a": {
      "$jsonv": "a"
    }
  },
  "obj2": {
    "a": {
      "$jsonv": "a"
    }
  }
}
```
This will compile into
```json
{
  "a": "hi",
  "obj1": {
    "a": "hello"
  },
  "obj2": {
    "a": "hi
  }
}
```


## Install
```bash
npm i ChocolateLoverRaj/jsonv
```

## Usage

### TypeScript
```js
import { parse } from 'jsonv'
```

### CommonJS
```js
const { parse } = require('jsonv')
```

### Parse
```js
parse({
  $jsonv: {
    a: 'hi'
  },
  a: { $jsonv: 'a' },
  b: { $jsonv: 'b' }
}, {
  b: 'Given Var'
})
// Returns { a: 'hi', b: 'Given Var' }
```
