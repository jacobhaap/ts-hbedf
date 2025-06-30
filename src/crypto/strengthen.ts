/**
 * @fileoverview Provides functionality for array element strengthening.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type { CHash } from "npm:@noble/hashes@1.8.0/utils";
import { deriveChild, type HDKey } from "npm:@iacobus/hd@1.1.1/key";
import { hmac } from "npm:@noble/hashes@1.8.0/hmac";

/**
 * strengthen_element strengthens an element with iterations of HMAC, from a given hash, iterations
 * count, key, and element.
 */
function strengthen_element(
	h: CHash,
	c: number,
	key: Uint8Array,
	element: Uint8Array
): Uint8Array {
	c = c >>> 0; // Emulate 32 bit integer
	for (let i = 0; i < c; i++) {
		const mac = hmac.create(h, key);
		const buf = new ArrayBuffer(4);
		new DataView(buf).setUint32(0, i, false);
		const b = new Uint8Array(buf);
		mac.update(b); // Write encoded index to the MAC
		mac.update(element); // Write element to the MAC
		element = mac.digest(); // Update element to the MAC digest
	}
	return element; // Return the strengthened element
}

/**
 * Strengthen applies strengthening to all Uint8Arrays of an array with iterations of HMAC, from
 * a given hash, byte arrays, HD key, and iterations count.
 */
export function strengthen(h: CHash, arrays: Uint8Array[], key: HDKey, c: number): Uint8Array[] {
	const hd = deriveChild(h, key, 1398035013); // Child key at index STRENGTH
	const out: Uint8Array[] = new Array(arrays.length); // Allocate array for the output
	for (let i = 0; i < arrays.length; i++) {
		const se = strengthen_element(h, c, hd.key, arrays[i]); // Strengthen the element
		out[i] = se; // Insert se at position i of out
	}
	return out; // Return strengthened elements
}
