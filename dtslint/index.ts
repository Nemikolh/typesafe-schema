import { newValidator, TypeOf, Any, SchemaValidator, TRUE, FALSE, Dict } from '../src';
import { Nullable, IGNORE, NUMBER, BOOL, STRING, Enum } from '../src';
import { EnumObj, Optional, Obj, Arr, Str } from '../src';

// Basic types

function t7() {
    // $ExpectType SchemaValidationResult<number>
    const val = newValidator(NUMBER).validate(null);
}

function t8() {
    // $ExpectType SchemaValidationResult<boolean>
    const val = newValidator(BOOL).validate(null);
}

function t8a() {
    // $ExpectType SchemaValidationResult<true>
    const val = newValidator(TRUE).validate(null);
}

function t8b() {
    // $ExpectType SchemaValidationResult<false>
    const val = newValidator(FALSE).validate(null);
}

function t9() {
    // $ExpectType SchemaValidationResult<string>
    const val = newValidator(STRING).validate(null);
}

function t10() {
    // $ExpectType SchemaValidationResult<string | null>
    const val = newValidator(Nullable(STRING)).validate(null);
}

function t11() {
    // $ExpectType SchemaValidationResult<unknown>
    const val = newValidator(IGNORE).validate(null);
}

function t12() {
    // $ExpectType SchemaValidationResult<"a" | "b" | "c">
    const val = newValidator(Enum('a', 'b', 'c')).validate(null);
}

function t17() {
    // $ExpectType SchemaValidationResult<"a" | "b" | "c" | "d" | "e" | "f">
    const val = newValidator(Enum('a', 'b', 'c', 'd', 'e', 'f')).validate(null);
}

function t19() {
    // $ExpectType SchemaValidationResult<"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h">
    const val = newValidator(Enum('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h')).validate(null);
}

function t20() {
    // $ExpectType SchemaValidationResult<string>
    const val = newValidator(Enum('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i')).validate(null);
}

// Advanced schema

function t1() {
    const val = newValidator(Obj({ a: STRING, b: NUMBER })).validate(null);
    if (val.type === 'success') {
        // $ExpectType string
        val.value.a;
        // $ExpectType number
        val.value.b;
    }
}

function t2() {
    const val = newValidator(Obj({ a: Optional(STRING), b: NUMBER })).validate(null);
    if (val.type === 'success') {
        // $ExpectType string | undefined
        val.value.a;
        // $ExpectType number
        val.value.b;
    }
}

function t3() {
    const val = newValidator(EnumObj(Obj({ a: STRING }), Obj({ a: NUMBER }))).validate(null);
    if (val.type === 'success') {
        const a = val.value;
        // $ExpectType string | number
        a.a;
    }
}

function t4() {
    const val = newValidator(EnumObj(Obj({ b: STRING }), Obj({ a: NUMBER }))).validate(null);
    if (val.type === 'success') {
        const a = val.value;
        if ('b' in a) {
            // $ExpectType string
            a.b;
        } else {
            // $ExpectType number
            a.a;
        }
    }
}

function t5() {
    const val = newValidator(Arr(Obj({ b: STRING, a: Arr(Obj({ ID: NUMBER })) }))).validate(null);
    if (val.type === 'success') {
        const a = val.value;
        // $ExpectType string
        a[0].b;
        // $ExpectType number
        a[0].a[0].ID;
    }
}

function t6() {
    const val = newValidator(EnumObj(
        Obj({
            type: Str('success'),
            message: STRING,
        }),
        Obj({
            type: Str('error'),
            errCode: NUMBER,
            message: STRING,
        }),
    )).validate(null);
    if (val.type === 'success') {
        // $ExpectType { type: "success"; message: string; } | { type: "error"; errCode: number; message: string; }
        const a = val.value;
    }
}

// Composed schema

function t13() {
    const schema1 = newValidator(Obj({ test: STRING, foo: NUMBER }));
    const schema2 = newValidator(Obj({ tata: STRING }));
    const composed = newValidator(EnumObj(schema1.schema, schema2.schema));

    const val = composed.validate(null);
    if (val.type === 'success') {
        // $ExpectType { test: string; foo: number; } | { tata: string; }
        const a = val.value;
    }
}

// Expressing constraints on the generated type
function t14<T extends Any, G extends TypeOf<T> & any[]>(
    arg: SchemaValidator<T, G>
): G[0] {
    const val = arg.validate(null);
    if (val.type === 'success') {
        return val.value[0];
    }
    return null;
}

function t15() {
    const schema = newValidator(Arr(Obj({ a: STRING, b: NUMBER })));
    // $ExpectType { a: string; b: number; }
    const val = t14(schema);
}

function t16() {
    const schema = newValidator(Dict(NUMBER));

    const val = schema.validate(null);
    if (val.type === 'success') {
        // $ExpectType { [key: string]: number; }
        const a = val.value;
    }
}

function t18() {
    const schema = newValidator(EnumObj(Obj({
        a: Obj({
            b: Obj({
                d: Obj({
                    e: Obj({
                        f: Enum('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'),
                    })
                }),
                g: STRING,
                e: STRING,
                a: NUMBER,
            })
        })
    }), Obj({
        g: STRING,
    })));

    const val = schema.validate(null);
    if (val.type === 'success') {
        // $ExpectType { a: { b: { d: { e: { f: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"; }; }; g: string; e: string; a: number; }; }; } | { g: string; }
        const a = val.value;
    }
}
