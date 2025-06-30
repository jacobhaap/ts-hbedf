/**
 * @fileoverview Provides asynchronous and synchronous Fisher-Yates shuffle algorithm implementations.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type { CHash } from "npm:@noble/hashes@1.8.0/utils";
import type { HDKey } from "npm:@iacobus/hd@1.1.1/key";
import { scrypt, scryptAsync } from "npm:@noble/hashes@1.8.0/scrypt";
import { hmac } from "npm:@noble/hashes@1.8.0/hmac";
import { rng } from "./rng.ts";

/** flatten_arrays flattens a Uint8Array[] into a Uint8Array. */
function flatten_arrays(arrays: Uint8Array[]): Uint8Array {
	const len = arrays.reduce((acc, arr) => acc + arr.length, 0); // Determine array length
	const result = new Uint8Array(len); // Allocate result array
	let offset = 0; // Offset to track position in the result
	for (const a of arrays) {
		result.set(a, offset); // Copy array to the result at the offset
		offset += a.length; // Increment offset by length of copied array
	}
	return result; // Return the concatenated result
}

/** calc_salt calculates a salt from a given hash, key, and message. */
function calc_salt(h: CHash, key: Uint8Array, msg: Uint8Array): Uint8Array {
	const mac = hmac.create(h, key);
	mac.update(msg);
	const domain = Uint8Array.from([83, 65, 76, 84]); // Bytes SALT for domain separation
	mac.update(domain);
	return mac.digest().slice(0, 16);
}

/**
 * fyAsync asynchronously shuffles all elements of an array with the Fisher-Yates shuffle algorithm,
 * from a given hash, array, HD key, and scrypt N parameter.
 */
export async function fyAsync(
	h: CHash,
	array: Uint8Array | Uint8Array[],
	key: HDKey,
	N: number
): Promise<Uint8Array> {
	const isArray = Array.isArray(array);
	let l = array.length;
	if (l > 0xFFFFFFFF) {
		throw new RangeError(`array length exceeded uint32 limit`);
	}
	l = l >>> 0; // Emulate 32 bit integer
	const msg = isArray // Message of the array
		? flatten_arrays(array)
		: array;
	const salt = calc_salt(h, key.key, msg); // Salt for scrypt
	const dk = await scryptAsync(key.code, salt, { N: N, r: 8, p: 1 }); // Derive key from chain code
	for (let i = l - 1; i > 0; i--) {
		const rem = isArray // Message from remaining unshuffled elements
			? flatten_arrays((array as Uint8Array[]).slice(0, i + 1))
			: (array as Uint8Array).slice(0, i + 1);
		const num = rng(h, rem, dk, i); // Random number from dk and rem
		const j = num % (i + 1); // Scale num to an index within the remaining unshuffled elements
		[array[i], array[j]] = [array[j], array[i]]; // Swap elements at indices i and j
	}
	const outLen = isArray
		? (array as Uint8Array[]).reduce((acc, arr) => acc + arr.length, 0)
		: array.length;
	const out = new Uint8Array(outLen); // Allocate output array
	const f = isArray // Ensure flattened array
		? flatten_arrays(array)
		: array;
	out.set(f); // Insert the shuffled array into the output
	return out; // Return the shuffle result
}

/**
 * fySync synchronously shuffles all elements of an array with the Fisher-Yates shuffle algorithm,
 * from a given hash, array, HD key, and scrypt N parameter.
 */
export function fySync(
	h: CHash,
	array: Uint8Array | Uint8Array[],
	key: HDKey,
	N: number
): Uint8Array {
	const isArray = Array.isArray(array);
	let l = array.length;
	if (l > 0xFFFFFFFF) {
		throw new RangeError(`array length exceeded uint32 limit`);
	}
	l = l >>> 0; // Emulate 32 bit integer
	const msg = isArray // Message of the array
		? flatten_arrays(array)
		: array;
	const salt = calc_salt(h, key.key, msg); // Salt for scrypt
	const dk = scrypt(key.code, salt, { N: N, r: 8, p: 1 }); // Derive key from chain code
	for (let i = l - 1; i > 0; i--) {
		const rem = isArray // Message from remaining unshuffled elements
			? flatten_arrays((array as Uint8Array[]).slice(0, i + 1))
			: (array as Uint8Array).slice(0, i + 1);
		const num = rng(h, rem, dk, i); // Random number from dk and rem
		const j = num % (i + 1); // Scale num to an index within the remaining unshuffled elements
		[array[i], array[j]] = [array[j], array[i]]; // Swap elements at indices i and j
	}
	const outLen = isArray
		? (array as Uint8Array[]).reduce((acc, arr) => acc + arr.length, 0)
		: array.length;
	const out = new Uint8Array(outLen); // Allocate output array
	const f = isArray // Ensure flattened array
		? flatten_arrays(array)
		: array;
	out.set(f); // Insert the shuffled array into the output
	return out; // Return the shuffle result
}
