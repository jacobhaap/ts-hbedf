/**
 * @fileoverview Provides a Fisher-Yates shuffle algorithm implementation using HMAC-based RNG.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import { sha256 } from "npm:@noble/hashes@1.7.1/sha256";
import { type ScryptOpts, scryptAsync } from "npm:@noble/hashes@1.7.1/scrypt";
import { hmacRng } from "./hmacRng.ts";

const encoder = new TextEncoder();

/**
 * Function to derive a salt from 'i' of the current index and 'l' of the input length.
 * Calculates a 32 bit integer from '(i + 1)' in the upper 16 bits and 'l' in the lower
 * 16 bits, then takes a sha256 hash of the four bytes from the 32 bit integer.
 */
function calcSalt(i: number, l: number): Uint8Array {
    const num = ((i + 1) << 16) | (l & 0xffff); // Calculate 32 bit integer with '(i + 1)' in the upper 16 bits and 'l' in the lower 16 bits
    const numArray = new Uint8Array(4); // Creates a 4 byte Uint8Array to store the number 'num'
    numArray[0] = (num >> 24) & 0xff; // Most significant byte of 'num' in the first position
    numArray[1] = (num >> 16) & 0xff; // Second most significant byte
    numArray[2] = (num >> 8) & 0xff; // Third most significant byte
    numArray[3] = num & 0xff; // Least significant byte in the last position
    return sha256(numArray); // Return a 'sha256' hash of 'numArray'
}

/**
 * Shuffles an array based on the Fisher-Yates shuffle algorithm, iterating through the
 * array in reverse, at each step deriving a random number  based on a `scrypt` key, the
 * remaining input and a counter corresponding to the current index.
 * @example
 * const secret: Uint8Array = Uint8Array.from([1, 2, 3, 4]);
 * const input: string[] = "0123456789".split("");
 * const opts: ScryptOpts = { N: 2 ** 8, r: 8, p: 1, dkLen: 32 };
 * const shuffle = await fyShuffle(secret, input, opts); // 9740286315
 */
export async function fyShuffle(secret: Uint8Array, input: string[], opts: ScryptOpts): Promise<string> {
    for (let i = input.length - 1; i > 0; i--) {
        const salt = calcSalt(i, input.length) // Derive a 'salt' using 'calcSalt'
        const scr = await scryptAsync(secret, salt, opts); // Derive a scrypt key 'scr' with a 'secret', the 'salt', and the ScryptOpts from 'opts'
        const data = encoder.encode(input.join("")); // Derive 'data' from a string of 'input' converted to a Uint8Array
        const rng = hmacRng(scr, data, i); // Generate a random number 'rng' for each iteration with 'hmacRng'
        const j = Math.floor(rng * (i + 1)); // Scale 'rng' to an index within the remaining unshuffled elements
        [input[i], input[j]] = [input[j], input[i]]; // Swap elements at indices 'i' and 'j'
    }
    return input.join("").normalize("NFKD"); // Return the shuffle result as an 'NFKD' normalized string
}
