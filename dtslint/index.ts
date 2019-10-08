import { newValidator } from '../src';
import { Nullable, IGNORE, NUMBER, BOOL, STRING, Enum } from '../src';
import { EnumObj, Optional, Obj, Arr, Str } from '../src';

// Basic types

function t7() {
    // $ExpectType SchemaValidationResult<number>
    const val = newValidator(NUMBER)(null);
}

function t8() {
    // $ExpectType SchemaValidationResult<boolean>
    const val = newValidator(BOOL)(null);
}

function t9() {
    // $ExpectType SchemaValidationResult<string>
    const val = newValidator(STRING)(null);
}

function t10() {
    // $ExpectType SchemaValidationResult<string | null>
    const val = newValidator(Nullable(STRING))(null);
}

function t11() {
    // $ExpectType SchemaValidationResult<unknown>
    const val = newValidator(IGNORE)(null);
}

function t12() {
    // $ExpectType SchemaValidationResult<"a" | "b" | "c">
    const val = newValidator(Enum('a', 'b', 'c'))(null);
}

// Advanced schema

function t1() {
    const val = newValidator(Obj({ a: STRING, b: NUMBER }))(null);
    if (val.type === 'success') {
        // $ExpectType string
        val.value.a;
        // $ExpectType number
        val.value.b;
    }
}

function t2() {
    const val = newValidator(Obj({ a: Optional(STRING), b: NUMBER }))(null);
    if (val.type === 'success') {
        // $ExpectType string | undefined
        val.value.a;
        // $ExpectType number
        val.value.b;
    }
}

function t3() {
    const val = newValidator(EnumObj(Obj({ a: STRING }), Obj({ a: NUMBER })))(null);
    if (val.type === 'success') {
        const a = val.value;
        // $ExpectType string | number
        a.a;
    }
}

function t4() {
    const val = newValidator(EnumObj(Obj({ b: STRING }), Obj({ a: NUMBER })))(null);
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
    const val = newValidator(Arr(Obj({ b: STRING, a: Arr(Obj({ ID: NUMBER })) })))(null);
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
    ))(null);
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

    const val = composed(null);
    if (val.type === 'success') {
        // $ExpectType { test: string; foo: number; } | { tata: string; }
        const a = val.value;
    }
}
