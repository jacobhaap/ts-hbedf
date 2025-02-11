import { createSeed } from "./seed.ts";
import { createHmacRng } from "./utils/hmacRng.ts";
import { shuffle } from "./utils/shuffle.ts";
import { calculateChecksum, verifyChecksum } from "./utils/checksum.ts";
import type { Buffer } from "node:buffer";

/**
 * **Human-Based Entropy Derivation Function** (HBEDF).
 * Entropy derivation with `HBEDF` derives a pseudorandom seed based on Human Identity & Secrets. A Passphrase, Identity array, and optional Secret are used to
 * derive the seed with two {@link shuffle} iterations. The random number generation for both shuffle iterations is based on `HMAC-SHA256` derived pseudorandom
 * numbers with {@link createHmacRng}. When `rekeying` is *true*, a new key for the HMAC will be derived for each invocation of the RNG function during the shuffle.
 * The first iteration of the shuffle targets the input array of identity (and secret when provided), shuffling the array based on the passphrase, then joining the
 * shuffled array into a string. A checksum is calculated of the first shuffle results with {@link calculateChecksum}. The second iteration of the shuffle uses the
 * checksum to shuffle every character from the result of the first iteration. A final checksum is then calculated from the result of the second iteration, which is
 * then appended to the string of the result to derive the seed. The seed then has its checksum verified to ensure data integrity, returning the seed as a Buffer if
 * verification passes.
 */
export function hbedf(passphrase: string, rekeying: boolean, identity: string[], secret: string | null): Buffer {
    return createSeed(passphrase, rekeying, identity, secret);
}

/**
 * HMAC Random Number Generator.
 * A pseudorandom number is derived from `HMAC-SHA256` based on a `PBKDF2-HMAC-SHA512` derived key from a secret with a
 * `NFKD` normalized string of *'HUMAN'* + the input data as the salt when the provided `secret` is a string, or directly
 * using the secret as the key when it is a Buffer. A `SHA256` hash of the input data is taken, and the HMAC is updated with
 * the hash and an optional counter number. The integer value of the first **12** characters of the hexadecimal digest of the
 * HMAC are divided by the highest possible 12-character hexadecimal value to produce a floating-point number in the range **[0, 1)**.
 */
export function hmacRng(secret: string | Buffer, data: string, counter: number | null): number {
    return createHmacRng(secret, data, counter);
}

/**
 * Fisher-Yates Shuffle Algorithm.
 * This shuffles an input array, iterating through the input in reverse, at each step deriving a pseudorandom number
 * from {@link createHmacRng} based on the secret, a  string of the input, and a counter number corresponding to the current
 * index. When `rekeying` is *true*, a new key from the secret for the HMAC will be derived for each invocation of the RNG,
 * and when *false* will use the secret to precompute a key. The shuffled array is returned as an `NFKD` normalized string.
 */
export function fyShuffle(secret: string, rekeying: boolean, input: string[]): string {
    return shuffle(secret, rekeying, input);
}

/**
 * Calculate a checksum.
 * A 32-bit decimal checksum (10 decimal digits) is calculated from a `utf8` encoded string or Buffer based on the `sha256`
 * hash of the data. This extracts the first **8** characters from the hexadecimal digest of the hash, then converts the extracted
 * characters to a decimal value. Padding is applied to ensure a fixed-length output of **10** digits. The resulting decimal checksum
 * is returned as a *Buffer*.
 */
export function checksum(data: string | Buffer): Buffer {
    let str: string;
    if (typeof data === 'string') str = data;
    else str = data.toString('utf8');
    return calculateChecksum(str);
}

/**
 * Verify a checksum.
 * The verification of a checksum for a `utf8` string takes place by separating the final 10 caracters from the rest of the string to isolate
 * the checksum. The {@link calculateChecksum} function is called for the remainder of the string to recalculate the checksum, which is
 * then compared with the extracted checksum to verify the integrity of the data. When the data is supplied as a Buffer (*e.g.. a pseudorandom
 * seed*), it is first converted to a `utf8` string before verification. This returns a boolean value of *true* when the checksums match, and
 * *false* when they do not.
 */
export function verify(data: string | Buffer): boolean {
    let str: string;
    if (typeof data === 'string') str = data;
    else str = data.toString('utf8');
    return verifyChecksum(str);
}
