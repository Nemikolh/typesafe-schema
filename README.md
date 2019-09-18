# Typesafe-schema

This project allows you to validate any data you get and turn
it into a value with a well formed TypeScript type.

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
const
```