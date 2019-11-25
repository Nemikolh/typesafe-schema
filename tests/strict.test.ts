import { newValidator, STRING, NUMBER, Obj, EnumObj } from '../src';

describe('Strict mode', () => {

    it('should reject object with extra properties', () => {
        const schema = newValidator(Obj({
            A: STRING,
            B: NUMBER,
        }));

        expect(schema({ A: 'Test', B: 234}, true)).toMatchObject({ type: 'success' });
        expect(schema({ A: 'Test', B: 234, C: 'test' }, true)).toEqual({
            type: 'error',
            path: '',
            reason: `Extra property 'C' rejected in strict mode.`,
        });
    });

    it('should reject object with extra properties if none of the variant matched', () => {
        const schema = newValidator(EnumObj(
            Obj({ A: STRING, B: NUMBER }),
            Obj({ A: STRING, C: NUMBER }),
        ));

        expect(schema({ A: 'Test', B: 234 }, true)).toMatchObject({ type: 'success' });
        expect(schema({ A: 'Foo', C: 234 }, true)).toMatchObject({ type: 'success' });
        expect(schema({ A: 'Foo', B: 123, C: 234 }, true)).toMatchObject({ type: 'error' });
        expect(schema({ A: 'Foo', B: 123, C: 234 }, false)).toMatchObject({ type: 'success' });
    });

    it('default value for strict mode should be false', () => {
        const schema = newValidator(EnumObj(
            Obj({ A: STRING, B: NUMBER }),
            Obj({ A: STRING, C: NUMBER }),
        ));

        expect(schema({ A: 'Foo', B: 123, C: 234 }, true)).toMatchObject({ type: 'error' });
        expect(schema({ A: 'Foo', B: 123, C: 234 }, false)).toMatchObject({ type: 'success' });
        expect(schema({ A: 'Foo', B: 123, C: 234 })).toMatchObject({ type: 'success' });
    });
});
