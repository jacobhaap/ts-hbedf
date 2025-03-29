/**
 * @fileoverview Entry point for @iacobus/hbedf, constructs and exports the 'hbedf' function.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type { ScryptOpts } from "npm:@noble/hashes@1.7.1/scrypt";
import { toHex, toBytes } from "./utils/hex.ts";
import { fyShuffle } from "./utils/shuffle.ts";
import { checksum, verify } from "./utils/checksum.ts";
import { type Algorithm, transform } from "./utils/transform.ts";

const encoder = new TextEncoder();

/** Type for seed options. */
export type SeedOpts = {
    a: Algorithm;
    dkLen?: number;
    N: number;
    r: number;
    p: number;
    maxmem?: number;
}

/**
 * Derives a pseudorandom seed from a passphrase combined with human identity and secrets.
 * @example
 * const passphrase: string = "123456";
 * const identity: string[] = ["MUSTERMANN", "ERIKA", "L01X00T47", "12081983"];
 * const opts: SeedOpts = { a: "blake2s", N: 2 ** 8, r: 8, p: 1, dkLen: 16 };
 * const ps = await hbedf(passphrase, identity, null, opts); // Uint8Array(32) [ 102, 189, 153, 140... ]
 */
export async function hbedf(passphrase: string | Uint8Array, identity: string[], secret: string | null, opts: SeedOpts): Promise<Uint8Array> {
    let pass: Uint8Array; // Initialize the 'pass' let
    if (typeof passphrase === "string") pass = encoder.encode(passphrase); // Uint8Array from 'passphrase' when it is a UTF-8 encoded string
    else pass = passphrase; // Directly use 'passphrase' when it is a Uint8Array

    // Extract options from 'opts' for output transformation and scrypt key derivation
    const a = opts.a; // 'algorithm' for output transformation from 'opts.a'
    const dkLen = opts.dkLen; // 'dkLen' for output transformation from 'opts.dkLen'
    const scryptOpts: ScryptOpts = {
        N: opts.N, // 'N' for scrypt from 'opts.N'
        r: opts.r, // 'r' for scrypt from 'opts.r'
        p: opts.p, // 'p' for scrypt from 'opts.p'
        dkLen: 32, // Use a 'dkLen' of '32' for scrypt
        ...(opts.maxmem !== undefined && { maxmem: opts.maxmem }) // 'maxmem' for scrypt from 'opts.maxmem'
    }

    let input: string[]; // Initialize the 'input' let
    if (secret) input = [...identity, secret]; // Insert the 'secret' (when available) after 'identity'
    else input = [...identity]; // Create 'input' directly from 'identity' when no 'secret' is provided

    // First shuffle iteration
    // Uses the 'passphrase' as the secret, scrypt key derived based on 'scryptOpts'
    // Shuffles all elements in the 'input' array of Identity + optional Secret
    const iter1 = await fyShuffle(pass, input, scryptOpts);

    // Checksum of first shuffle iteration
    // Calculates a 16-byte checksum, using 'iter1'
    const csum1 = toHex(checksum(encoder.encode(iter1)));

    // Split all characters in 'iter1' string into an array
    const chars = iter1.split('');

    // Second shuffle iteration
    // Uses the 'csum1' as the secret, scrypt key derived based on 'scryptOpts'
    // Shuffles all elements in the 'chars' array of characters from 'iter1' string
    const iter2 = await fyShuffle(encoder.encode(csum1), chars, scryptOpts);

    // Apply output transformation
    // Hash 'iter2' with hashing algorithm 'a'
    // Use 'dkLen' when defined for 'a' if 'a' is a XOF
    const tf = await transform(a, encoder.encode(iter2), dkLen);

    // Checksum of the output transformation
    // Calculates a 16-byte checksum, using 'tf'
    const csum = toHex(checksum(tf));

    // Construct the seed 'ps' from 'tf' and 'csum'
    let ps: string | Uint8Array; // Initialize the 'ps' let
    ps = toHex(tf) + csum; // Append 'csum' to hex string of 'tf'
    ps = toBytes(ps); // Convert hex string of 'tf' + 'csum' to Uint8Array

    // Verify and return 'ps'
    const valid = verify(ps); // Check 'ps' integrity by verifying checksum
    if (valid) return ps; // Return the 'ps' if valid
    else throw new Error(`Unable to verify seed integrity.`); // Throw an error if invalid
}
