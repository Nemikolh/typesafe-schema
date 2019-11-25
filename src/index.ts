/* tslint:disable:max-classes-per-file */

/**
 * Some explanation before you start reading the code.
 *
 *
 * ## What we're trying to achieve
 *
 * We want to associate with some JavaScript representation of a
 * schema validator, a TypeScript type representing a runtime value
 * validated by the schema validator.
 *
 * By default, TypeScript will compute a Type for that Schema Validator.
 * The question is then, is it possible to transform it into the type
 * that the value has if it was validated by the schema validator?
 *
 * Answer: Yes! =)
 *
 *
 * ## How do we do it:
 *
 * We pick a representation for all `SchemaValidator` that will still
 * cover all possible type we could infer from a JSON value.
 *
 * The easiest way to understand how we do it, is to go through an example.
 * Here is an example of a `SchemaValidator`:
 *
 * ```ts
 * const validatorType = Obj({
 *    a: Arr(NUMBER),
 *    b: STRING,
 * })
 * ```
 *
 * The type of `validatorType` is:
 *
 * ```ts
 * const validatorType: TypeC<{
 *    a: ArrayC<NumberType>,
 *    b: StringType,
 * }>
 * ```
 *
 * Now, the way you should read that type is:
 *
 *      - `TypeC` and `ArrayC` are "functions". They accept a type (not all types, see below) and output another type.
 *      - `NumberType` and `StringType` are "values".
 *
 * `TypeC` accept only types that are a subtype of `Props`:
 *
 * ```ts
 * interface Props {
 *    [key: string]: Any,
 * }
 * ```
 *
 * By limiting `TypeC` to certain types, we can use the extra information we have about our input type,
 * _think_ function parameter, to perform an operation on it.
 *
 * Here the transformation we performs is the one below. So to any `P` that is a subtype of `Props`
 * we output:
 *
 * ```ts
 * type Output<P> = {                       // Output is not used in the code but it's used here for clarity
 *      [K in keyof P]: TypeOf<P[K]>
 * }
 * ```
 *
 * As you can see we transform all properties of `P`, using another function `TypeOf`.
 * We've also skimmed over `Any` which was introduced in `Props`.
 *
 * Let's talk first, a bit about "values" such as `NumberType` and `StringType`:
 * Values are the leaves of our type transformation, they're the one doing the mapping
 *
 *      - `NumberType` will map to `number`
 *      - `StringType` will map to `string`
 *      - and so on for other values...
 *
 * The way they do this is using `SchemaType` a weird but really simple type.
 *
 * ```ts
 * class SchemaType<O> {
 *     readonly _O!: O;
 * }
 * ```
 *
 * A quick reminder on generics. Generics from the type system point of view (so TypeScript viewpoint),
 * transform one type (here `O`) to a new type (here `SchemaType<O>`).
 *
 * However that's not the transformation that we are interested in. What we want is from a subtype of
 * `SchemaType<O>` getting the `O`. A simple way to do that, in TypeScript, is to have a field of
 * type `O` in `SchemaType`. So that way if we've got any `SchemaType` subtype, we can obtain
 * the parameter using the field. That's how `TypeOf` works. From any type extending `SchemaType`,
 * it returns the type of the field `_O` from that type.
 *
 *    > Side note: We could have used `infer` from TypeScript to do more or less the same thing
 *    >            but doing it this way is less prone to errors from newer version of the TypeScript
 *    >            compiler. At the time of writing this, `infer` was introduced recently and has some
 *    >            limitation and weird corner cases. (Or it's just me using it in a weird way)
 *
 * So now, if you look at the definition of `NumberType` it (hopefully) all make sense!
 *
 * ```ts
 * class NumberType extends SchemaType<number> {}
 * ```
 *
 * The attentive reader would probably now questioned the use of `NumberType`. Why do we need a subclass of
 * `SchemaType` when we've already got `SchemaType<number>` ?
 *
 * We could have defined `NumberType` as:
 *
 * ```ts
 * type NumberType = SchemaType<number> {}
 * ```
 *
 * This is for the runtime aspect of our validator. We _want_ to differentiate the types we are creating here.
 * And in TypeScript, when compiling to JavaScript all types are erased, this includes generics.
 * (If you know a bit about `C++`, `C#` or `Rust` this is basically saying that it doesn't have **monomorphization**)
 *
 * So that way at runtime we can query the type of the Validator using `instanceof`.
 * Though, this is probably a very inneficient things to do. Does get the job done so far! :)
 */


class SchemaType<O> {
    readonly _O!: O;
}

// Guards (used by the runtime validator)
class NumberType extends SchemaType<number> {}
class BooleanType extends SchemaType<boolean> {}
class IgnoreType extends SchemaType<unknown> {}
class StringType extends SchemaType<string> {}
class MatchRegexType extends SchemaType<string> { constructor(public regex: RegExp) { super(); } }
class ValType<V> extends SchemaType<V> { constructor(public val: V) { super(); } }
class StringValType<S extends string> extends ValType<S> { constructor(val: S) { super(val); } }
class NumberValType<N extends number> extends ValType<N> { constructor(val: N) { super(val); } }
class InterfaceType<P, O> extends SchemaType<O> { constructor(public props: P) { super(); } }
class NullableType<E, O> extends SchemaType<O> { constructor(public schema: E) { super(); } }
class MaybeUndefinedType<E, O> extends SchemaType<O> { constructor(public schema: E) { super(); } }
class ArrayType<E, O> extends SchemaType<O> { constructor(public elementSchema: E) { super(); } }
class EnumType<E, O> extends SchemaType<O> { constructor(public possibleValues: E) { super(); } }

// Type utils
interface Any extends SchemaType<any> {}    // Not needed but make the code more readable
type TypeOf<C extends Any> = C['_O'];       // The most important function
interface Props {
    [key: string]: Any
}

// Our "functions"
interface NullableC<E extends Any> extends NullableType<E, TypeOf<E> | null> {}
interface MaybeUndefinedC<E extends Any> extends MaybeUndefinedType<E, TypeOf<E> | undefined> {}
interface ArrayC<E extends Any> extends ArrayType<E, TypeOf<E>[]> {}
interface TypeC<P extends Props> extends InterfaceType<P, { [K in keyof P]: TypeOf<P[K]> }> {}
// Note: Replace that once typescript support cleaner variadic types
interface EnumC<E extends [Any, ...Any[]]> extends EnumType<E, E extends [Any] ? TypeOf<E[0]>
    : E extends [Any, Any] ? (TypeOf<E[0]> | TypeOf<E[1]>)
    : E extends [Any, Any, Any] ? (TypeOf<E[0]> | TypeOf<E[1]> | TypeOf<E[2]>)
    : unknown> {}
interface EnumStringC<S extends [string, ...string[]]> extends EnumType<ArrayType<StringType, any>,
    S extends [string] ? S[0]
    : S extends [string, string] ? (S[0] | S[1])
    : S extends [string, string, string] ? (S[0] | S[1] | S[2])
    : unknown> {}


// Validation types
interface ValidationSuccess { type: 'success' }
interface ValidationError {
    type: 'error'
    path: string
    reason: string
}
type ValidationResult = ValidationSuccess | ValidationError;

export interface SchemaValidator<T extends Any> {
    (value: any, strict?: boolean): SchemaValidationResult<TypeOf<T>>;
    schema: T
}
export type SchemaValidationResult<T> = { type: 'success', value: T } | ValidationError;

/**
 * Create a schema validator that can be used to validate data obtained from a request
 * typically JSON formatted.
 *
 * Notes:
 *
 *   - The validator does not perform any parsing. Use something like `JSON.parse` first.
 *   - The data source doesn't need to be JSON, but the parsed version needs to be a POJO.
 *
 * @param schema schema defined as a POJO with some convention.
 */
export function newValidator<T extends Any>(schema: T): SchemaValidator<T> {
    const validator: SchemaValidator<T> = ((value, strict) => {
        const res = validateObject(value, schema, '', strict || false);
        if (res.type === 'error') {
            return res;
        }
        return {
            type: 'success',
            value,
        };
    }) as SchemaValidator<T>;
    validator.schema = schema;
    return validator;
}

/**
 * Define the type of a value to a restricted set of strings.
 *
 * @param possibleValues list of string that the result might have.
 */
export function Enum<U extends [string, ...string[]]>(...possibleValues: U): EnumStringC<U> {
    return new EnumType<any, any>(possibleValues.map(s => new StringValType(s)));
}

/**
 * Define a type and schema that must be an array
 * @param arr type of the element in the array
 */
export function Arr<E extends Any>(arr: E): ArrayC<E> {
    return new ArrayType(arr);
}

/**
 * Define a type and schema that must have a set of properties
 * @param props properties that the schema must have
 */
export function Obj<P extends Props>(props: P): TypeC<P> {
    return new InterfaceType(props);
}

/**
 * Define a union of type for any type. If you want to restrict an unknown
 * javascript value to a set of strings consider using Enum instead as it provides a
 * better type-checking experience.
 *
 * @param possibleValues list of type that the result might have.
 */
export function EnumObj<U extends [Any, ...Any[]]>(...possibleValues: U): EnumC<U> {
    return new EnumType(possibleValues);
}

/**
 * After validation, the value can either be of type validated by `T` or `null`.
 *
 * @param schema non-null value.
 */
export function Nullable<T extends Any>(schema: T): NullableC<T> {
    return new NullableType(schema);
}

/**
 * This validator can only be used within an object and is used to mark
 * a property as optional. E.g.
 *
 * ```ts
 * //                                ~~~~ This brace means that we expect a defined
 * //                                |    object with either a property named 'b' that maps to string or undefined,
 * //                                v    or an empty object.
 * export const a = defineSchema(Obj({
 *     b: Optional(String),
 * }));
 * ```
 * @param schema type of the property when non-null
 */
export function Optional<T extends Any>(schema: T): MaybeUndefinedC<T> {
    return new MaybeUndefinedType(schema);
}

/**
 * This validator offer more control over which string values should
 * be accepted.
 *
 * The associated type produced is still a `string`.
 *
 * @param regex regex to use to validate the string.
 */
export function MatchRegex(regex: RegExp): MatchRegexType {
    return new MatchRegexType(regex);
}

/**
 * This validator only accept one value. It narrows down the type
 * to the string literal type associated to the provided value.
 *
 * Note:
 *
 *   - This only works if the value is a raw string. Anything else
 *     will be inferred as `string`.
 */
export function Str<T extends string>(value: T): StringValType<T> {
    return new StringValType(value);
}

/**
 * This validator only accept one value. It narrows down the type
 * to the numeric literal type associated to the provided value.
 *
 * Note:
 *
 *   - This only works if the value is a raw number. Anything else
 *     will be inferred as `number`.
 */
export function Num<T extends number>(value: T): NumberValType<T> {
    return new NumberValType(value);
}

/**
 * When using IGNORE, no validation is performed, so the typescript inferred
 * type is `unknown`.
 */
export const IGNORE = new IgnoreType();

/**
 * For values of type string
 */
export const STRING = new StringType();

/**
 * For values of type boolean
 */
export const BOOL = new BooleanType();

/**
 * For values of type number
 */
export const NUMBER = new NumberType();


// The runtime function doing all the hard-work (all the above is only compile-time shenanigans)
function validateObject<T extends Any>(value: any, schema: T, path: string, strict: boolean): ValidationResult {
    const typeofVal = typeof value;
    if (schema === IGNORE) {
        return success();
    }
    if (schema instanceof MaybeUndefinedType) {
        if (typeofVal === 'undefined') {
            return success();
        }
        return validateObject(value, schema.schema, path + '!', strict);
    }
    if (typeofVal === 'undefined') {
        return error(path, 'value is undefined');
    }
    if (schema instanceof ValType) {
        return iferror(schema.val === value, path, `Got '${value}', expected '${schema.val}'`);
    }
    if (schema instanceof MatchRegexType) {
        if (typeofVal === 'string') {
            return iferror(schema.regex.test(value), path, `'${value}' did not match '${schema.regex}'`);
        } else {
            return error(path, `Got ${typeofVal}, expected string.`);
        }
    }
    if (schema instanceof EnumType) {
        const possibleResults = [];
        for (const subSchema of schema.possibleValues) {
            const res = validateObject(value, subSchema, path, strict);
            if (res.type === 'success') {
                return res;
            }
            possibleResults.push(res.reason);
        }
        const trace = formatTrace(possibleResults.join('\n'));
        return error(
            path,
            `None of the variant matched ${JSON.stringify(value)}, errors:\n  ${trace}`,
        );
    }
    if (schema instanceof NullableType) {
        if (value === null) {
            return success();
        }
        return validateObject(value, schema.schema, path + '?', strict);
    }
    if (schema === STRING) {
        return iferror(typeofVal === 'string', path, `Got ${typeofVal}, expected string`);
    }
    if (schema === BOOL) {
        return iferror(typeofVal === 'boolean', path, `Got ${typeofVal}, expected boolean`);
    }
    if (schema === NUMBER) {
        return iferror(typeofVal === 'number', path, `Got ${typeofVal}, expected number`);
    }
    if (schema instanceof ArrayType) {
        if (!Array.isArray(value)) {
            return error(path, `Expected array.`);
        }

        for (let index = 0; index < value.length; ++index) {
            const res = validateObject(value[index], schema.elementSchema, path + '[' + index + ']', strict);
            if (res.type === 'error') {
                return res;
            }
        }
        return success();
    }
    if (schema instanceof InterfaceType) {
        if (value === null) {
            return error(path, `Expected object got 'null'`);
        }
        // Strict mode: no extra properties allowed.
        if (strict && typeof value === 'object') {
            for (const prop in value) {
                if (!(prop in schema.props)) {
                    return error(path, `Extra property '${prop}' rejected in strict mode.`);
                }
            }
        }
        // Properties that are not in schema are ignored
        for (const prop in schema.props) {
            if (prop in value || schema.props[prop] instanceof MaybeUndefinedType) {
                const res = validateObject(value[prop], schema.props[prop], path + '.' + prop, strict);
                if (res.type === 'error') {
                    return res;
                }
            } else {
                return error(path, `Missing property '${prop}' in '${JSON.stringify(value)}'`);
            }
        }
        return success();
    }
    // This path should be unreachable, it can only be reached if value
    // was not created from a JSON and contains function or symbols
    return error(path, `Fatal error! Schema validation can only be done on objects created from a JSON string`);
}

// TODO: Would turning reason into a closure (() => string) reduce memory usage?
function iferror(condition: boolean, path: string, reason: string): ValidationResult {
    if (condition) {
        return success();
    }
    return error(path, reason);
}

function error(path: string, reason: string): ValidationError {
    return { type: 'error', path, reason };
}

function success(): ValidationSuccess {
    return { type: 'success' };
}

function formatTrace(err: string): string {
    return err.replace(/\n/g, '\n  ');
}
