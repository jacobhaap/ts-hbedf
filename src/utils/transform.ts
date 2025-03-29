/**
 * @fileoverview Provides a function for output transformation by hashing.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type * as sha2 from "npm:@noble/hashes@1.7.1/sha2";
import type * as sha3 from "npm:@noble/hashes@1.7.1/sha3";
import type * as sha3Addons from "npm:@noble/hashes@1.7.1/sha3-addons";
import type * as ripemd160 from "npm:@noble/hashes@1.7.1/ripemd160";
import type * as blake1 from "npm:@noble/hashes@1.7.1/blake1";
import type * as blake2b from "npm:@noble/hashes@1.7.1/blake2b";
import type * as blake2s from "npm:@noble/hashes@1.7.1/blake2s";
import type * as blake3 from "npm:@noble/hashes@1.7.1/blake3";

/** Type for a hashing algorithm. */
type Algo1 = (msg: Uint8Array, opts?: { dkLen?: number }) => Uint8Array;

/** Type for a hashing algorithm with a '.create' method. */
type Algo2 = { create: (opts?: { dkLen?: number }) => { update: (msg: Uint8Array) => { digest: () => Uint8Array } } };

/** Type guard for factories. */
function isAlgo2(val: unknown): val is Algo2 {
    return typeof val === "object" && val !== null && "create" in val && typeof (val as { create: unknown }).create === "function";
}

/** Type for filtering algorithms. */
type FilteredAlgos<T> = {
    [K in keyof T as T[K] extends Algo1 | Algo2 ? K : never]: T[K]
}

/** Type for hashing algorithms. */
type HashAlgos = FilteredAlgos<
    typeof sha2 & typeof sha3 & typeof sha3Addons & typeof ripemd160
    & typeof blake1 & typeof blake2b & typeof blake2s & typeof blake3
>;

/** Function to dynamically import hashing algorithms from **@noble/hashes**. */
async function loadAlgorithms(): Promise<HashAlgos> {
    // Dynamically import each module of supported hash algorithms
    const modules = [
        await import("npm:@noble/hashes@1.7.1/sha2"),
        await import("npm:@noble/hashes@1.7.1/sha3"),
        await import ("npm:@noble/hashes@1.7.1/sha3-addons"),
        await import("npm:@noble/hashes@1.7.1/ripemd160"),
        await import("npm:@noble/hashes@1.7.1/blake1"),
        await import("npm:@noble/hashes@1.7.1/blake2b"),
        await import("npm:@noble/hashes@1.7.1/blake2s"),
        await import("npm:@noble/hashes@1.7.1/blake3")
    ]

    // Prepare a result object to store only callable algorithms
    const result: Partial<HashAlgos> = {};

    // Iterate over each imported module
    for (const mod of modules) {
        // Iterate over each export in the module
        for (const [key, value] of Object.entries(mod)) {
            // Include the export only if it's a hash function or factory
            if (typeof value === "function" || isAlgo2(value)) {
                // Type-cast to bypass structural mismatch
                (result as Record<string, unknown>)[key] = value;
            }
        }
    }

    // Assert that result now matches the expected AlgorithmFns type
    return result as HashAlgos;
}

/** Promise that loads algorithms when resolved. */
const aPromise: Promise<HashAlgos> = loadAlgorithms();

/** Type for supported hashing algorithm names as strings. */
export type Algorithm = keyof Awaited<typeof aPromise>;

/**
 * A message (`msg`) is transformed by hashing to provide a fixed-length output, based on hashing
 * algorithms supported by **@noble/hashes**.
 * @example
 * const a: Algorithm = "blake2b";
 * const msg: Uint8Array = Uint8Array.from([0, 9, 8, 7]);
 * const dkLen: number = 48;
 * const tf = await transform(a, msg, dkLen); // Uint8Array(48) [7, 210, 46, 141... ]
 */
export async function transform(a: Algorithm, msg: Uint8Array, dkLen?: number): Promise<Uint8Array> {
    const algorithms = await aPromise; // Resolve 'aPromise' promise, assign hashing algorithms to 'algorithms'
    const fn: Algo1 | Algo2 = algorithms[a]; // Retrieve selected hashing algorithm 'a' from 'algorithms'
    if (typeof fn === "function") {
        // If the algorithm is a function, call it with 'msg' and optional 'dkLen' output length
        return fn(msg, dkLen ? { dkLen } : undefined);
    } else if (isAlgo2(fn)) {
        // If the algorithm has a 'create' method, use it to hash 'msg', and use optional 'dkLen' output length
        return fn.create({ dkLen }).update(msg).digest();
    }
    throw new Error(`Algorithm "${a}" is not callable.`);
}
