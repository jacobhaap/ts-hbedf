/**
 * @fileoverview Test script for the exports of the @iacobus/hbedf entry point.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import { sha256 } from "npm:@noble/hashes@1.7.1/sha2";
import { toHex } from "../src/utils/hex.ts";
import { type SeedOpts, hbedf } from "../src/mod.ts";

// 6-Digit PIN
const pin = "123456";

// Identity Array
const idArray = [
    "L01X00T47",        // Document Number
    "MUSTERMANN",       // Name
    "ERIKA",            // Given Name
    "12081983",         // Date of Birth
    "DEUTSCH",          // Nationality
    "BERLIN",           // Birthplace
    "GREEN",            // Eye Color
    "160",              // Height
    "HEIDESTRASSE17"    // Address
];

// SHA256 Hash
const hash = sha256("In the age of anxiety");

/**
 * Test for 'hbedf' function.
 * 
 * Uses a 'passphrase' from 'pin', an 'identity' from 'idArray', a 'secret' from 'hash', and
 * specifies the SeedOpts in 'opts' to derive two seeds. In the first invocation of 'hbedf',
 * a seed is derived from a passphrase & identity and assigned to 'seed1'. In the second
 * invocation of 'hbedf', a seed is derived from a passphrase, identity, and secret, and
 * assigned to 'seed1'.
 * 
 * The first console.assert checks that 'seed1' is not null and is a 'Uint8Array'.
 * The second console.assert checks that 'seed2' is not null and is a 'Uint8Array'.
 */
Deno.test(`Function 'hbedf' derives a pseudorandom seed`, async () => {
    const passphrase = pin; // Use 'pin' as the 'passphrase'
    const identity = idArray; // Use 'idArray' as the 'identity'
    const secret = toHex(hash); // Use 'hash' as the 'secret'
    const opts: SeedOpts = {
        a: "blake2b", // Use 'a' hashing algorithm 'blake2b'
        dkLen: 48, // Use a 'dkLen' of '48' bytes for the output transformation
        N: 2 ** 8, r: 8, p: 1 // Options for scrypt key derivation
    };
    
    // Derive 'seed1' from a passphrase and identity
    const seed1 = await hbedf(passphrase, identity, null, opts);
    console.assert(!!seed1 && seed1 instanceof Uint8Array, `Function 'hbedf' should derive a pseudorandom seed`);

    // Derive 'seed2' from a passphrase, identity, and secret
    const seed2 = await hbedf(passphrase, identity, secret, opts);
    console.assert(!!seed2 && seed2 instanceof Uint8Array, `Function 'hbedf' should derive a pseudorandom seed`);
});
