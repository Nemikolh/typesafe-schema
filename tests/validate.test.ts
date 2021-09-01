import { newValidator, Enum, EnumObj, Obj, Arr, MatchRegex, TRUE, FALSE, Dict, BOOL, MinLength } from '../src';
import { STRING, NUMBER, ObjWithOptional, MaybeUndefined } from '../src';

describe('Enum', () => {

    it('should match string for a specific value', () => {
        const schema = newValidator(Enum('test'));
        expect(schema.validate('test')).toEqual({ type: 'success', value: 'test' });
        expect(schema.validate('tata')).toEqual({
            type: 'error',
            path: '',
            reason: [
                `None of the variant matched "tata", errors:`,
                `  Got 'tata', expected 'test'`,
            ].join('\n'),
        });
    });

    it('should match string in a list of values', () => {
        const schema = newValidator(Enum('test', 'foo', 'bar'));
        expect(schema.validate('test')).toEqual({ type: 'success', value: 'test' });
        expect(schema.validate('foo')).toEqual({ type: 'success', value: 'foo' });
        expect(schema.validate('bar')).toEqual({ type: 'success', value: 'bar' });
        expect(schema.validate('tata')).toEqual({
            type: 'error',
            path: '',
            reason: [
                `None of the variant matched "tata", errors:`,
                `  Got 'tata', expected 'test'`,
                `  Got 'tata', expected 'foo'`,
                `  Got 'tata', expected 'bar'`,
            ].join('\n'),
        });
    });
});

describe('MatchRegex', () => {

    it('should validate the value with the regex provided', () => {
        const schema = newValidator(MatchRegex(/\s+/));
        expect(schema.validate('test')).toEqual({
            type: 'error',
            path: '',
            reason: `'test' did not match '/\\s+/'`,
        });
        expect(schema.validate('    \n  ')).toEqual({ type: 'success', value: '    \n  ' });
    });
});

describe('TRUE,FALSE', () => {

    it('should validate a value to be exactly true or false', () => {
        const schema = newValidator(TRUE);
        const schema2 = newValidator(FALSE);
        expect(schema.validate(true)).toMatchObject({ type: 'success' });
        expect(schema.validate(false)).toMatchObject({ type: 'error' });
        expect(schema2.validate(false)).toMatchObject({ type: 'success' });
        expect(schema2.validate(true)).toMatchObject({ type: 'error' });
    });
});

describe('EnumObj', () => {

    const schema = newValidator(EnumObj(Obj({
        ID: NUMBER,
        Foo: STRING,
    }), Obj({
        Bar: STRING,
        Test: Enum('test', 'foobar'),
    })));


    it('should match a valid object for variant 1', () => {
        expect(schema.validate({ ID: 0, Foo: 'tmp' })).toEqual({
            type: 'success',
            value: {
                ID: 0,
                Foo: 'tmp',
            },
        });
    });

    it('should match a valid object for variant 2', () => {
        expect(schema.validate({ Bar: 'test', Test: 'test' })).toEqual({
            type: 'success',
            value: {
                Bar: 'test',
                Test: 'test',
            },
        });
    });

    it('should match a valid object for variant 2 (2)', () => {
        expect(schema.validate({ Bar: '', Test: 'foobar' })).toEqual({
            type: 'success',
            value: {
                Bar: '',
                Test: 'foobar',
            },
        });
    });

    it('should not accept an object where the value does not match the type of the variant 2', () => {
        expect(schema.validate({ Bar: '', Test: 'oops' })).toEqual({
            type: 'error',
            path: '',
            reason: [
                `None of the variant matched {"Bar":"","Test":"oops"}, errors:`,
                `  Missing property 'ID' in '{"Bar":"","Test":"oops"}'`,
                `  None of the variant matched "oops", errors:`,
                `    Got 'oops', expected 'test'`,
                `    Got 'oops', expected 'foobar'`,
            ].join('\n'),
        });
    });

    it('should not accept an object where the value is missing a prop of the variant 2', () => {
        expect(schema.validate({ Bar: '' })).toEqual({
            type: 'error',
            path: '',
            reason: [
                'None of the variant matched {"Bar":""}, errors:',
                `  Missing property 'ID' in '{"Bar":""}'`,
                `  Missing property 'Test' in '{"Bar":""}'`,
            ].join('\n'),
        });
    });

    it('should not accept an object where the value is of the wrong type for variant 1', () => {

        expect(schema.validate({ ID: '', Foo: '' })).toEqual({
            type: 'error',
            path: '',
            reason: [
                'None of the variant matched {"ID":"","Foo":""}, errors:',
                `  Got string, expected number`,
                `  Missing property 'Bar' in '{"ID":"","Foo":""}'`,
            ].join('\n'),
        });
    });

    it('should not accept an object with a missing property for variant 1', () => {
        expect(schema.validate({ ID: 0 })).toEqual({
            type: 'error',
            path: '',
            reason: [
                'None of the variant matched {"ID":0}, errors:',
                `  Missing property 'Foo' in '{"ID":0}'`,
                `  Missing property 'Bar' in '{"ID":0}'`,
            ].join('\n'),
        });
    });
});

describe('Obj', () => {

    const schema = newValidator(Obj({}));

    it('should reject string and numbers when expecting an object', () => {
        expect(schema.validate('test')).toEqual({
            type: 'error',
            path: '',
            reason: `Got string, expected object`,
        });
        expect(schema.validate(2342)).toEqual({
            type: 'error',
            path: '',
            reason: `Got number, expected object`,
        });
    });
});

describe('Array of enum object', () => {

    const schema = newValidator(Arr(EnumObj(Obj({
        Foo: STRING,
    }), Obj({
        Test: NUMBER,
        Bar: STRING,
    }))));

    it('should accept a valid object', () => {
        const value = [{ Foo: 'test' }, { Test: 0, Bar: 'foo' }];
        expect(schema.validate(value)).toEqual({ type: 'success', value });
    });

    it('should reject an array with an invalid property', () => {
        const value = [{ Test: 0, Bar: 'foo' }, { Oops: 'test' }];
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '[1]',
            reason: [
                'None of the variant matched {"Oops":"test"}, errors:',
                `  Missing property 'Foo' in '{"Oops":"test"}'`,
                `  Missing property 'Test' in '{"Oops":"test"}'`,
            ].join('\n'),
        });
    });
});

describe('Dictionary', () => {

    const schema = newValidator(Dict(Obj({ a: Enum('foo', 'bar') })));

    it('should accept a valid dictionary', () => {
        const value = {
            'some prop': { a: 'foo' },
            'other prop': { a: 'bar' },
        };

        expect(schema.validate(value)).toEqual({ type: 'success', value });
    });

    it('should reject an invalid one when the element type doesn\'t match', () => {
        const value = {
            'some prop': { a: 'foo' },
            'other prop': { a: 'wut' },
        };

        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '[other prop].a',
            reason: [
                'None of the variant matched "wut", errors:',
                `  Got 'wut', expected 'foo'`,
                `  Got 'wut', expected 'bar'`,
            ].join('\n')
        });
    });

});

describe('null', () => {

    it('should show null instead of object when matching a string', () => {
        const value = { someprop: null };
        const schema = newValidator(Obj({ someprop: STRING }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.someprop',
            reason: 'Got null, expected string',
        });
    });

    it('should show null instead of object when matching a boolean', () => {
        const value = { someprop: null };
        const schema = newValidator(Obj({ someprop: BOOL }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.someprop',
            reason: 'Got null, expected boolean',
        });
    });

    it('should show null instead of object when matching a boolean', () => {
        const value = { someprop: null };
        const schema = newValidator(Obj({ someprop: NUMBER }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.someprop',
            reason: 'Got null, expected number',
        });
    });

    it('should show null instead of object when matching a array', () => {
        const value = { someprop: null };
        const schema = newValidator(Obj({ someprop: Arr(STRING) }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.someprop',
            reason: 'Got null, expected array.',
        });
    });

    it('should show null instead of object when matching an object', () => {
        const value = { someprop: null };
        const schema = newValidator(Obj({ someprop: Obj({ test: STRING }) }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.someprop',
            reason: 'Got null, expected object',
        });
    });

    it('should show null instead of object when matching an enum', () => {
        const value = { someprop: null };
        const schema = newValidator(Obj({ someprop: Enum('foo', 'bar') }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.someprop',
            reason: [
                'None of the variant matched null, errors:',
                `  Got null, expected 'foo'`,
                `  Got null, expected 'bar'`,
            ].join('\n'),
        });
    });
});

describe('MinLength', () => {


    it('should show null error if the value is null', () => {
        const schema = newValidator(MinLength(STRING, 12));
        const value = null;
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '',
            reason: 'Got null, expected string',
        });
    });

    it('should reject is string is not long enough', () => {
        const schema = newValidator(MinLength(STRING, 12));
        const value = 'foobar';
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '',
            reason: `'foobar' does not satisfy the minimum length requirement (12)`,
        });
    });

    it('should reject if array is not long enough', () => {
        const schema = newValidator(MinLength(Arr(STRING), 12));
        const value = ['foobar'];
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '',
            reason: `'["foobar"]' does not satisfy the minimum length requirement (12)`,
        });
    });

    it('should reject if dict is not long enough', () => {
        const schema = newValidator(MinLength(Dict(STRING), 12));
        const value = { a: 'foobar' };
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '',
            reason: `'{"a":"foobar"}' does not satisfy the minimum length requirement (12)`,
        });
    });

    it('should accept valid values for string', () => {
        const schema = newValidator(MinLength(STRING, 6));
        const value = 'foobar';
        expect(schema.validate(value)).toEqual({
            type: 'success',
            value,
        });
    });

    it('should accept valid values for dict', () => {
        const schema = newValidator(MinLength(Arr(STRING), 1));
        const value = ['foobar'];
        expect(schema.validate(value)).toEqual({
            type: 'success',
            value,
        });
    });

    it('should accept valid values for array', () => {
        const schema = newValidator(MinLength(Dict(STRING), 2));
        const value = { a: 'foobar', b: '', c: '' };
        expect(schema.validate(value)).toEqual({
            type: 'success',
            value,
        });
    });
});

describe('Optional', () => {

    it('should allow properties to be missing', () => {
        const value = {};
        const schema = newValidator(ObjWithOptional({}, { a: STRING }));
        expect(schema.validate(value)).toEqual({
            type: 'success',
            value,
        });
    });

    it('should reject if non-optional properties are missing', () => {
        const value = {};
        const schema = newValidator(ObjWithOptional({ a: NUMBER }, { b: NUMBER }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '',
            reason: [
                `Missing property 'a' in '{}'`,
            ].join('\n'),
        });
    });

    it('should reject if optional proerties are of the wrong type', () => {
        const value = { a: 123, b: '123' };
        const schema = newValidator(ObjWithOptional({ a: NUMBER }, { b: NUMBER }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.b',
            reason: [
                `Got string, expected number`,
            ].join('\n'),
        });
    });

    it('should accept if both optional proerty and non-optional have correct type', () => {
        const value = { a: 123, b: 123 };
        const schema = newValidator(ObjWithOptional({ a: NUMBER }, { b: NUMBER }));
        expect(schema.validate(value)).toEqual({
            type: 'success',
            value,
        });
    });

    it('should reject undefined as a value for optional properties', () => {
        const value = { a: 123, b: undefined };
        const schema = newValidator(ObjWithOptional({ a: NUMBER }, { b: NUMBER }));
        expect(schema.validate(value)).toEqual({
            type: 'error',
            path: '.b',
            reason: [
                `value is undefined`,
            ].join('\n'),
        });
    });

    it('should accept undefined if optional property is marked as such', () => {
        const value = { a: 123, b: undefined };
        const schema = newValidator(ObjWithOptional({ a: NUMBER }, { b: MaybeUndefined(NUMBER) }));
        expect(schema.validate(value)).toEqual({
            type: 'success',
            value,
        });
    });
});