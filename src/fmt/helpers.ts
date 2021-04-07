/**
 * Implement this interface to provide your own
 * formatter.
 */
export interface TypeSafeFormatter<Result> {

    /**
     * Format the undefined value.
     *
     * @param rootValue root object received
     * @param path path to the leaf value
     */
    fmtUndefined(rootValue: unknown, path: string): Result;

    fmt
}


// export function 