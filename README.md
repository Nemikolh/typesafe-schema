# Typesafe-schema [![Build Status](https://travis-ci.org/Nemikolh/typesafe-schema.svg?branch=master)](https://travis-ci.org/Nemikolh/typesafe-schema) ![](https://img.shields.io/badge/TypeScript-%3E3.0-green)

Typesafe-schema allows you to validate a plain old JavaScript object against
a schema and obtained a well typed value in return.

It has zero dependencies and can be used either in a node.js or browser
environment.

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

Typesafe-schema provide more type safety if your TypeScript `strict` flag is set to
`true` in your `tsconfig.json`. You can still use this library without this option,
but some schema modifiers such as `Optional` and `Nullable` loose their benefit from
a type checking point of view.

An example is always worth a thousand words:

```ts
import { EnumObj, Obj, STRING, NUMBER, Str } from 'typesafe-schema';
import { newValidator } from 'typesafe-schema';


// Our API can returns either a JSON object
// of this shape:
//
//      {
//          "result": "success",
//          "token": "fbe7cdc7-5c89-40ac-ae78-36f241e2f230"
//      }
//
// or of this shape:
//
//      {
//          "result": "success",
//          "errCode": "1023",
//          "message": "Invalid username or password"
//      }
//
const myAPI = newValidator(EnumObj(
    Obj({
        result: Str('success'),
        token: STRING,
    }),
    Obj({
        result: Str('error'),
        errCode: NUMBER,
        message: STRING,
    }),
));


function doRequest() {

    // Execute a request or get some data you want to validate
    // At this point data is "any"
    const data = ajax(...);

    // Validate the data
    const result = myAPI(data);

    if (result.type === 'success') {

        // typedData is the same object as data
        // but typed! =)
        const typedData = result.value;

        // Do something with typedValue
        typedData.result  // This has type "error" | "success"
        typedData.errCode // This is a compile error! :)
                          // We need to make sure that typedValue.result
                          // is equal to 'error' first
    } else {

        // Display or do something with the reason explaining why the
        // validation failed.
        console.log(result.reason);
    }
}
```

Schema can also be reused:

```ts
import { Enum, Arr, Obj, STRING, NUMBER, Str } from 'typesafe-schema';
import { newValidator } from 'typesafe-schema';

export const user = newValidator(Obj({
    id: NUMBER,
    name: STRING,
    role: Enum('admin', 'regular', 'bot'),
    apiKey: Optional(STRING),
}));

// Each element in the list must satisfy the user schema.
export const userList = newValidator(Arr(user.schema));

// They can be reused anywhere...
export const device = newValidator(Obj({
    id: NUMBER,
    hostname: STRING,
    owner: user.schema,
}));
```

## Reference


| Function                               | TypeScript              | What does `validator(value);` do ?                                                                                        |
|----------------------------------------|-------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `IGNORE`                               | `unknown`               | Do nothing, value will have the unknown TypeScript type                                                                   |
| `STRING`                               | `string`                | Make sure value is a string (use `typeof`)                                                                                |
| `NUMBER`                               | `number`                | Make sure value is a number (use `typeof`)                                                                                |
| `BOOL`                                 | `boolean`               | Make sure value is a boolean (use `typeof`)                                                                               |
| `Num(val)`                             | `<numeric literal>`     | Make sure value is equal to val. TypeScript type will be the numeric literal type associated with the value (e.g '0')     |
| `Str(val)`                             | `<string literal>`      | Make sure value is equal to val. TypeScript type will be the string literal type associated with the value (e.g 'foobar') |
| `MatchRegex(re)`                       | `string`                | Make sure value match `re`.                                                                                               |
| `Enum('foo', 'bar')`                   | `'foo' | 'bar'`         | Shortend for `EnumObj(Str('foo'), Str('bar'))`                                                                            |
| `Optional(schema)`                     | `T | undefined`         | Make sure value is either undefined or match schema.                                                                      |
| `Nullable(schema)`                     | `T | null`              | Make sure value is either null or match schema.                                                                           |
| `EnumObj(...schemas)`                  | `T0 | T1 | ... | TN`    | Make sure value match at least one of schemas.                                                                            |
| `Obj({ a: schema0, b: schema1, ... })` | `{ a: T0, b: T1, ... }` | Make sure value is an object with at least all expected properties.                                                       |
| `Arr(schema)`                          | `T[]`                   | Make sure value is an array with all elements matching schema.                                                            |