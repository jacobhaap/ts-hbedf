import { createSeed } from "./seed.ts";
import { shuffle } from "./utils/shuffle.ts";
import { createHmacRng } from "./utils/hmacRng.ts";
import type { Buffer } from "node:buffer";

/**
 * **Human-Based Entropy Derivation Function** (HBEDF).
 * Entropy derivation with `HBEDF` derives a pseudorandom seed based on Human Identity & Secrets. A passphrase, identity array, and optional secret are used to
 * derive the seed with two {@link shuffle} iterations. The random number generation for both shuffle iterations is based on `HMAC-SHA256` derived pseudorandom
 * numbers with {@link createHmacRng}. When `rekeying` is *true*, a new key for the HMAC will be derived for each invocation of the RNG function during the shuffle.
 * The first iteration of the shuffle targets the input array of identity (and secret when provided), shuffling the array based on the passphrase, then joining the
 * shuffled array into a string. A checksum is obtained by taking the first **6** digits of the decimal value of the `SHA256` hash of the shuffled string. The second
 * iteration of the shuffle uses the checksum to shuffle every character in the string. The checksum is appended to the result of the second shuffle, and returned
 * as a Buffer to derive the seed.
 */
export const hbedf = (() => {
    const fn = (passphrase: string, rekeying: boolean, identity: string[], secret: string | null): Buffer => createSeed(passphrase, rekeying, identity, secret);
    /**
     * HMAC Random Number Generator.
     * A pseudorandom number is derived from `HMAC-SHA256` based on a `PBKDF2-HMAC-SHA512` derived key from a secret with a
     * `NFKD` normalized string of *'HUMAN'* + the input data as the salt when the provided `secret` is a string, or directly
     * using the secret as the key when it is a Buffer. A `SHA256` hash of the input data is taken, and the HMAC is updated with
     * the hash and an optional counter number. The integer value of the first **12** characters of the hexadecimal digest of the
     * HMAC are divided by the highest possible 12-character hexadecimal value to produce a floating-point number in the range **[0, 1)**.
     */
    fn.rng = (secret: string | Buffer, data: string, counter: number | null): number => createHmacRng(secret, data, counter);
    /**
     * Fisher-Yates Shuffle Algorithm.
     * This shuffles an input array, iterating through the input in reverse, at each step deriving a pseudorandom number
     * from {@link createHmacRng} based on the secret, a  string of the input, and a counter number corresponding to the current
     * index. When `rekeying` is *true*, a new key from the secret for the HMAC will be derived for each invocation of the RNG,
     * and when *false* will use the secret to precompute a key. The shuffled array is returned as an `NFKD` normalized string.
     */
    fn.shuffle = (secret: string, rekeying: boolean, input: string[]): string => shuffle(secret, rekeying, input);
    return fn;
})();
