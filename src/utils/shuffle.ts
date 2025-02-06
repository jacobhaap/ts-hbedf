import { pbkdf2Sync } from "node:crypto";
import { createHmacRng } from "./hmacRng.ts";
import type { Buffer } from "node:buffer";

/**
 * Fisher-Yates Shuffle Algorithm.
 * Shuffles an input array, iterating through the input in reverse, at each step
 * deriving a random number with {@link createHmacRng} based on a secret, the input,
 * and a counter corresponding to the current index. When `rekeying` is *true*, a new
 * key will be derived for each invocation of the HMAC RNG function based on the
 * secret, and when *false* a key will be precomputed.
 */
export function shuffle(secret: string, rekeying: boolean, input: string[]): string {
    let hmacSecret: string | Buffer;
    if (rekeying === true) {
        hmacSecret = secret;
    } else {
        const salt = ('HUMAN' + input.join('')).normalize('NFKD');
        hmacSecret = pbkdf2Sync(secret.normalize('NFKD'), salt, 210000, 32, 'sha512');
    }
    for (let i = input.length - 1; i > 0; i--) {
        const data = input.join('');
        const rng = createHmacRng(hmacSecret, data, i);
        const j = Math.floor(rng * (i + 1));
        [input[i], input[j]] = [input[j], input[i]];
    }
    return input.join('').normalize('NFKD');
}
