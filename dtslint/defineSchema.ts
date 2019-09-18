import { defineSchema } from '../src';
import { Nullable, IGNORE, NUMBER, BOOL, STRING, Enum } from '../src';
import { EnumObj, Optional, Obj, Arr, Str } from '../src';

// Basic types

// $ExpectType SchemaValidator<number>
defineSchema(NUMBER);

// $ExpectType SchemaValidator<boolean>
defineSchema(BOOL);

// $ExpectType SchemaValidator<string>
defineSchema(STRING);

// $ExpectType SchemaValidator<string | null>
defineSchema(Nullable(STRING));

// $ExpectType SchemaValidator<unknown>
defineSchema(IGNORE);

// $ExpectType SchemaValidator<"a" | "b" | "c">
defineSchema(Enum('a', 'b', 'c'));

// Composed schema

function t1() {
    const val = defineSchema(Obj({ a: STRING, b: NUMBER }))(null);
    if (val.type === 'success') {
        // $ExpectType string
        val.value.a;
        // $ExpectType number
        val.value.b;
    }
}

function t2() {
    const val = defineSchema(Obj({ a: Optional(STRING), b: NUMBER }))(null);
    if (val.type === 'success') {
        // $ExpectType string | undefined
        val.value.a;
        // $ExpectType number
        val.value.b;
    }
}

function t3() {
    const val = defineSchema(EnumObj(Obj({ a: STRING }), Obj({ a: NUMBER })))(null);
    if (val.type === 'success') {
        const a = val.value;
        // $ExpectType string | number
        a.a;
    }
}

function t4() {
    const val = defineSchema(EnumObj(Obj({ b: STRING }), Obj({ a: NUMBER })))(null);
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
    const val = defineSchema(Arr(Obj({ b: STRING, a: Arr(Obj({ ID: NUMBER })) })))(null);
    if (val.type === 'success') {
        const a = val.value;
        // $ExpectType string
        a[0].b;
        // $ExpectType number
        a[0].a[0].ID;
    }
}

function t6() {
    const val = defineSchema(EnumObj(
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
