/**
 * @fileoverview Test script for the exports of the @iacobus/hbedf/utils entry point.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import { sha256 } from "npm:@noble/hashes@1.7.1/sha2";
import {
    type ScryptOpts, type Algorithm,
    toHex, toBytes, hmacRng,
    fyShuffle, checksum, verify, transform
} from "../../src/utils/mod.ts";

// Sample Array
const array = "antidisestablishmentarianism".split("");

// SHA256 Hashes
const hash1 = sha256("Awful Sound.");
const hash2 = sha256("It's Never Over.");

// Initialize 'csumStr' let
let csumStr: string;

/**
 * Test for 'hmacRng' util function.
 * 
 * Generates a pseudorandom number using a 'key' from 'hash1' and a 'msg' from 'hash2'.
 * No counter is used. The 'hmacRng' function is called, and the result is assigned to 'num'.
 * 
 * Console.assert checks that 'num' is not null and is of type 'number'.
 */
Deno.test(`Util function 'hmacRng' generates a seeded pseudorandom number`, () => {
    const key = hash1; // Use 'hash1' as the 'key'
    const msg = hash2; // Use 'hash2' as the 'msg'
    const num = hmacRng(key, msg); // Generate seeded random number, without counter
    console.assert(!!num && typeof num == 'number', `Util function 'hmacRng' should generate a pseudorandom number`);
});

/**
 * Test for 'fyShuffle' util function.
 * 
 * Shuffles an array using a 'secret' from 'hash1', an 'array' from 'identity', and defines 'opts' as
 * a ScryptOpts object. The 'fyShuffle' function is called, and the result is assigned to 'shuffle'.
 * 
 * Console.assert checks that 'shuffle' is not null and is of type 'string'.
 */
Deno.test(`Util function 'fyShuffle' shuffles an array`, async () => {
    const secret = hash1; // Use 'hash1' as the 'secret'
    const input = array; // Use 'array' as the 'input' array
    const opts: ScryptOpts = { N: 2 ** 8, r: 8, p: 1, dkLen: 32 }; // Options for scrypt key derivation
    const shuffle = await fyShuffle(secret, input, opts);
    console.assert(!!shuffle && typeof shuffle === 'string', `Util function 'fyShuffle' should shuffle an array`);
});

/**
 * Test for 'checksum' util function.
 * 
 * Calculates a checksum using a 'msg' from 'hash2'. The 'checksum' function is called, and the result
 * is assigned to 'csum'. Next, 'csum' is appended to 'msg' as a hex string, and assigned to 'csumStr'
 * for use in the test for the 'verify' util function.
 * 
 * Console.assert checks that 'csum' is not null and is a 'Uint8Array'.
 */
Deno.test(`Util function 'checksum' calculates a checksum`, () => {
    const msg = hash2; // Use 'hash2' as the 'msg'
    const csum = checksum(msg); // Calculate checksum for 'msg'
    csumStr = toHex(msg) + toHex(csum); // Join 'msg' and 'csum' into hex string 'csumStr'
    console.assert(!!csum && csum instanceof Uint8Array, `Util function 'checksum' should calculate a checksum`);
});

/**
 * Test for 'verify' util function.
 * 
 * Verifies the checksum using a 'msg' from 'csumStr', the checksummed hex string from the previous test.
 * The 'verify' function is called, and the result is assigned to 'valid'.
 * 
 * Console.assert checks that 'valid' is 'true'.
 */
Deno.test(`Util function 'verify' verifies a checksum`, () => {
    const msg = toBytes(csumStr); // Use 'csumstr' as the 'msg'
    const valid = verify(msg); // Verify checksum from 'msg'
    console.assert(valid === true, `Util function 'verify' should verify a checksum`);
});

/**
 * Test for 'transform' util function.
 * 
 * Applies output transformation to a 'msg' from 'csumStr', using an 'a' of 'blake2s', and a 'dkLen'
 * of '32'. The 'transform' function is called, and the result is assigned to 'tf'.
 * 
 * Console.assert checks that 'tf' is not null and is a 'Uint8Array'.
 */
Deno.test(`Util function 'transform' transforms output`, async () => {
    const a: Algorithm = "blake2s"; // Use 'blake2s' as hashing algorithm 'a'
    const msg = toBytes(csumStr); // Use 'hash1' as the 'csumStr'
    const dkLen = 32; // Use a dkLen of 32
    const tf = await transform(a, msg, dkLen); // Apply output transformation to 'msg'
    console.assert(!!tf && tf instanceof Uint8Array, `Util function 'transform' should complete output transformation`);
});
