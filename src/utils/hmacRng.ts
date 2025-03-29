/**
 * @fileoverview Provides a function for HMAC-based pseudorandom number generation.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import { sha256 } from "npm:@noble/hashes@1.7.1/sha2";
import { hmac } from "npm:@noble/hashes@1.7.1/hmac";
import { toHex } from "./hex.ts";

/**
 * Derives a pseudorandom number from an HMAc updated with a message `msg` and optional
 * counter `c`, returning a floating-point number in the range **[0, 1)**.
 * @example
 * const key: Uint8Array = Uint8Array.from([1, 2, 3, 4]);
 * const msg: Uint8Array = Uint8Array.from([5, 6, 7, 8]);
 * const rng = hmacRng(key, msg); // 0.8780841176487075
 */
export function hmacRng(key: Uint8Array, msg: Uint8Array, c?: number): number {
    const mac = hmac.create(sha256, key).update(sha256(msg)) // Create an HMAC-SHA256 with 'key', update with a sha256 hash of 'msg'
        if (c) mac.update(c.toString()); // When a counter is present, update the HMAC with a string of 'c'
    const digest = toHex(mac.digest()); // Obtain a hexadecimal digest of the HMAC
    const intValue = parseInt(digest.toString().substring(0, 12), 16); // Integer value from the first 12-characters of the hex digest
    return intValue / 0xffffffffffff; // Divide 'intValue' by the highest possible 12-character hex value to obtain a floating-point number
}
