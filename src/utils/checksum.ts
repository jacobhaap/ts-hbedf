/**
 * @fileoverview Provides functions for checksum calculation and verification.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import { blake2s } from "npm:@noble/hashes@1.7.1/blake2s";

/**
 * Calculates a checksum by taking a {@link blake2s} hash of a message (`msg`) at a length of **16** bytes.
 * @example
 * const hexStr: string = "940d878d35ba771332fe98efd3bd51a2";
 * const msg: Uint8Array = toBytes(hexStr);
 * const csum = toHex(checksum(msg)); // 93bb7cdab5363686efa39a2f10566c70
 */
export function checksum(msg: Uint8Array): Uint8Array {
    const csum = blake2s(msg, { dkLen: 16 }); // Take a 'blake2s' hash of 'msg' with a dkLen of 16
    return csum;
}

/**
 * Verifies a checksum by extracting the final 16 bytes of a message (`msg`), calculates a new
 * checksum for the remainder, and compares the checksums for a match.
 * @example
 * const hexStr: string = "940d878d35ba771332fe98efd3bd51a293bb7cdab5363686efa39a2f10566c70";
 * const msg: Uint8Array = toBytes(hexStr);
 * const verified = verify(msg); // true
 */
export function verify(msg: Uint8Array): boolean {
    if (msg.length < 16) throw new Error(`Array must be at least 16 bytes in length.`);
    const data = msg.subarray(0, msg.length - 16); // Extract all but the last 16 bytes as 'data'
    const csum1 = msg.subarray(msg.length - 16); // Extract the final 16 bytes as the checksum 'csum1'
    const csum2 = checksum(data); // Calculate a new checksum for 'data'
    return csum2.every((byte, i) => byte === csum1[i]); // Compare all bytes of 'csum1' and 'csum2'
}
