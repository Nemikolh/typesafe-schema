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