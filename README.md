# Typesafe-schema [![Build Status](https://travis-ci.org/Nemikolh/typesafe-schema.svg?branch=master)](https://travis-ci.org/Nemikolh/typesafe-schema)

This project allows you to validate json data and turn
it into a value with a well formed TypeScript type.

It's not as flexible as a `json-schema`, it mostly a bridge
between some arbitrary json and TypeScript.

## Install

Add `typesafe-schema` to your `package.json`.

With npm:

```bash
npm i -S -E typesafe-schema
```

With yarn:

```bash
yarn add -S -E typesafe-schema
```

## Usage

Typesafe-schema provide more type safety if you have `strict` set to `true`
in your `tsconfig.json`. You can still use it without this option, but schema
modifiers such as `Optional` or `Nullable` won't provide as much benefit as if
the setting was set from a type checking perspective.

Here is an example of schema:

```ts
import { EnumObj, Obj, STRING, NUMBER, Str } from 'typesafe-schema';
import { defineSchema } from 'typesafe-schema';

const myAPI = defineSchema(EnumObj(
    Obj({
        result: Str('success'),
        message: STRING,
    }),
    Obj({
        result: Str('error'),
        errCode: NUMBER,
        message: STRING,
    }),
));

// Execute a request
const data = ajax(...);

// Validate the data
const result = myAPI(data);

if (result.type === 'success') {
    const typedValue = result.value;

    // Do something with typedValue
    typedValue.message // This has type string
    typedValue.errCode // This is a compile error! :)
                       // We need to make sure that typedValue.result
                       // is equal to 'error' first
} else {

    // Display or do something with the reason explaining why the validation
    // failed.
    console.log(result.reason);
}
```