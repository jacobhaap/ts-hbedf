/**
 * @fileoverview Provides a MAC-based pseudorandom number generator.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type { CHash } from "npm:@noble/hashes@1.8.0/utils";
import { hmac } from "npm:@noble/hashes@1.8.0/hmac";

/** rng generates a pseudorandom 32 bit integer from a given hash, message, key, and counter. */
export function rng(h: CHash, msg: Uint8Array, info: Uint8Array, c: number): number {
	c = c >>> 0; // Emulate 32 bit integer
	const mac = hmac.create(h, info); // Create HMAC using the key
	mac.update(msg); // Write msg to the MAC
	const buf = new ArrayBuffer(4);
	new DataView(buf).setUint32(0, c, false);
	const b = new Uint8Array(buf);
	mac.update(b); // Write encoded c to the MAC
	const d = mac.digest().slice(0, 4); // Extract first 4 bytes of the digest
	const n = new DataView(d.buffer, d.byteOffset, 4).getUint32(0, false); // Integer from the digest
	return n; // Return the 32 bit integer
}
