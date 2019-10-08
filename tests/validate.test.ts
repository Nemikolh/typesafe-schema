import { newValidator, Enum, EnumObj, Obj, Arr, MatchRegex } from '../src';
import { STRING, NUMBER } from '../src';

describe('Enum', () => {

    it('should match string for a specific value', () => {
        const schema = newValidator(Enum('test'));
        expect(schema('test')).toEqual({ type: 'success', value: 'test' });
        expect(schema('tata')).toEqual({
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
        expect(schema('test')).toEqual({ type: 'success', value: 'test' });
        expect(schema('foo')).toEqual({ type: 'success', value: 'foo' });
        expect(schema('bar')).toEqual({ type: 'success', value: 'bar' });
        expect(schema('tata')).toEqual({
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
        expect(schema('test')).toEqual({
            type: 'error',
            path: '',
            reason: `'test' did not match '/\\s+/'`,
        });
        expect(schema('    \n  ')).toEqual({ type: 'success', value: '    \n  ' });
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
        expect(schema({ ID: 0, Foo: 'tmp' })).toEqual({
            type: 'success',
            value: {
                ID: 0,
                Foo: 'tmp',
            },
        });
    });

    it('should match a valid object for variant 2', () => {
        expect(schema({ Bar: 'test', Test: 'test' })).toEqual({
            type: 'success',
            value: {
                Bar: 'test',
                Test: 'test',
            },
        });
    });

    it('should match a valid object for variant 2 (2)', () => {
        expect(schema({ Bar: '', Test: 'foobar' })).toEqual({
            type: 'success',
            value: {
                Bar: '',
                Test: 'foobar',
            },
        });
    });

    it('should not accept an object where the value does not match the type of the variant 2', () => {
        expect(schema({ Bar: '', Test: 'oops' })).toEqual({
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
        expect(schema({ Bar: '' })).toEqual({
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

        expect(schema({ ID: '', Foo: '' })).toEqual({
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
        expect(schema({ ID: 0 })).toEqual({
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


describe('Array of enum object', () => {

    const schema = newValidator(Arr(EnumObj(Obj({
        Foo: STRING,
    }), Obj({
        Test: NUMBER,
        Bar: STRING,
    }))));

    it('should accept a valid object', () => {
        const value = [{ Foo: 'test' }, { Test: 0, Bar: 'foo' }];
        expect(schema(value)).toEqual({ type: 'success', value });
    });

    it('should reject an array with an invalid property', () => {
        const value = [{ Test: 0, Bar: 'foo' }, { Oops: 'test' }];
        expect(schema(value)).toEqual({
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
