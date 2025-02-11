import { hbedf, hmacRng, fyShuffle, checksum, verify } from "../src/mod.ts";
import { Buffer } from "node:buffer";

// 6-Digit PIN as Passphrase
const passphrase = "123456";

// Identity Array
const identity = [
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

// SHA-256 Hash of Secret
const secret = "1e7f7c26deaad3aea0d7aa5cf450efdd314ab4889595ed1844b4da23a855ee7c";

let checksumStr: string;

Deno.test(`'hbedf' derives a pseudorandom seed from a Passphrase, Identity, and Secret`, () => {
    const seed = hbedf(passphrase, false, identity, secret);
    console.assert(!!seed, `'hbedf' should derive a pseudorandom seed from a Passphrase, Identity, and Secret`);
});

Deno.test(`'hbedf' derives a pseudorandom seed from a Passphrase and Identity`, () => {
    const seed = hbedf(passphrase, false, identity, null);
    console.assert(!!seed, `'hbedf' should derive a pseudorandom seed from a Passphrase and Identity`);
});

Deno.test(`'hmacRng' produces a seeded pseudorandom number from an HMAC-SHA256`, () => {
    const key = Buffer.from(secret);
    const rng = hmacRng(key, secret, null);
    console.assert(!!rng && typeof rng === 'number', `'hmacRng' should produce a pseudorandom number from an HMAC`);
});

Deno.test(`'fyShuffle' shuffles an array using the Fisher-Yates Shuffle Algorithm, with rekeying`, () => {
    const shuffle = fyShuffle(passphrase, true, identity);
    console.assert(!!shuffle && typeof shuffle === 'string', `'fyShuffle' should shuffle an array, with rekeying`);
});

Deno.test(`'checksum' calculates a 32-bit decimal checksum for a string`, () => {
    const csum = checksum(secret).toString('utf8');
    checksumStr = secret + csum;
    console.assert(!!csum && typeof csum === 'string', `'checksum' should calculate a checksum for a string`);
});

Deno.test(`'verify' verifies a checksum to establish integrity`, () => {
    const verification = verify(checksumStr);
    console.assert(verification === true, `'verify' should verify a valid checksum`);
});
