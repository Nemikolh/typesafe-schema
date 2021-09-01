# Version 0.5.0

 * Add support for the new TypeScript compiler option `exactOptionalPropertyTypes`.
   This adds a new construct: `ObjWithOptional` which mark properties from its second
   argument as optional in the TypeScript sense. So you get `prop?: type` for them
   instead of `prop: type | undefined` or `prop: type`.

   `Optional` is renamed to `MaybeUndefined` to avoid confusion.

   Here is an example of the new `ObjWithOptional`:
   ```ts
    ObjWithOptional({
        a: NUMBER,
    }, {
        b: STRING
    })
    // This schema will typecheck values as:
    {
        a: number,
        b?: string
    }

    // If you want b to possibly be undefined you can do instead:
    ObjWithOptional({
        a: NUMBER,
    }, {
        b: MaybeUndefined(STRING)
    })
    // This will typecheck values as:
    {
        a: number,
        b?: string | undefined
    }
    ```

    Note that this only works when the new flag is set to true. If the flag
    is set to false or if you use an older version of TypeScript then in both
    case the type will be:

    ```ts
    {
        a: number,
        b?: string | undefined
    }
    ```

    `typesafe-schema` does not look whether the flag is set to true or not. This
    means that even though the compiler won't differentiate between the two cases
    this library will.

# Version 0.4.9

 * Add `MinLength` helper to require a field to have a minimum length.
   Supported type are `STRING`, `Arr(..)` and `Dict(..)`.

# Version 0.4.8

 * Augment type limit for Enum and EnumObj to accept up to 8 values

# Version 0.4.7

 * Render null as 'null'

# Version 0.4.6

 No API changes

# Version 0.4.5

 * Add support for dictionaries: arbitrary keys with a validated type.

# Version 0.4.4

 * Add `TRUE` and `FALSE` constant to allow narrowing a type with boolean values

# Version 0.4.3

 * Fix a bug when an `Obj` is expected but a string is provided to the `validate` function.
   Error was `TypeError: Cannot use 'in' operator to search for 'message' in "Not found"`;

# Version 0.4.2

 * Remove coverage report from the npm package.

# Version 0.4.1

 * Export `ValidationSuccess`, `ValidationError` and `ValidationResult` types.

# Version 0.4.0

 * Instead of a function we now return an object with two properties:
    - `validator.validate()`: A function that can validate objects.
    - `validator.schema`: The original schema used by the validate function.

# Version 0.3.0

 * Version 0.2 was fundamentaly broken, this release fix a number of issues:
    - Possibility to constraint the resulting type
    - Default it to TypeOf<T>
    - Add a test to make sure this is not broken in the future.

# Version 0.2.3

 * Bug fix. Missing `TypeOf` in export.

# Version 0.2.3

 * Bug fix. Missing `Any` in export.

# Version 0.2.2

 * Add a `strict` argument to validators that reject value that have extra properties.

# Version 0.2.0

 * Add a `schema` field to validators to reduce boilerplate when
   using composition
 * Rename `defineSchema` to `newValidator`, the original name was confusing


# Version 0.1.1

Initial release.