/**
 * @fileoverview Implements the phases HBEDF derived seed generation.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type { CHash } from "npm:@noble/hashes@1.8.0/utils";
import { deriveChild, deriveMaster, deriveNode, type HDKey } from "npm:@iacobus/hd@1.1.1/key";
import { newPath, newSchema } from "npm:@iacobus/hd@1.1.1/path";
import { strengthen } from "./crypto/strengthen.ts";
import { calcN } from "./crypto/mem.ts";
import { fyAsync, fySync } from "./shuffle/fy.ts";
import { hmac } from "@noble/hashes/hmac";

/** HbedfOpts are HBEDF derivation options. */
export type HbedfOpts = {
	/** Derivation path */
	path: string;
	/** Derivation path schema */
	schema?: string;
	/** Strengthening iterations count */
	c: number;
	/** Target memory cost */
	mem: number;
	/** Output length */
	dsLen?: number;
};

/** digest produces an HMAC digest from a given hash, key, and data. */
function digest(h: CHash, key: Uint8Array, data: Uint8Array): Uint8Array {
	const mac = hmac.create(h, key); // Create HMAC with key
	mac.update(data); // Write data to the MAC
	return mac.digest(); // Return the MAC
}

/** concatBytes concatenates two Uint8Arrays, in the order they are received. */
function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
	const result = new Uint8Array(a.length + b.length); // Allocate Uint8Array for a + b
	result.set(a, 0);
	result.set(b, a.length);
	return result; // Return concatenated bytes
}

/**
 * key derives a node in a hierarchy and returns an HD key, from a given hash, secret,
 * schema, and derivation path. The HD key derived is suitable for use in the Extract,
 * Shuffle, and Expand phases.
 */
export function key(h: CHash, secret: Uint8Array, schema: string, path: string): HDKey {
	const ps = newSchema(schema); // Parse derivation path schema
	const dp = newPath(h, path, ps); // Parse derivation path
	const s = new Uint8Array(secret.length + 5);
	s.set(secret, 0);
	s.set([72, 66, 69, 68, 70], secret.length); // Bytes HBEDF for domain separation
	const master = deriveMaster(h, s); // Derive master HD key
	const node = deriveNode(h, master, dp); // Derive node in hierarchy
	return node; // Return the node
}

/**
 * extract extracts strengthened biographic material (sbm) from initial biographic material (ibm), and calculates
 * a scrypt N parameter, from a given hash, ibm array, HD key, iterations count, and target memory cost. The sbm
 * and N produced are suitable for use in the Shuffle phase.
 */
export function extract(
	h: CHash,
	ibm: Uint8Array[],
	key: HDKey,
	c: number,
	mem: number
): { sbm: Uint8Array[]; N: number } {
	if (typeof c !== "number" || isNaN(c)) {
		throw new TypeError(`iterations count c must be a number`);
	}
	if (c < 100) {
		throw new RangeError(`invalid iterations count: got "${c}", expected ">=100"`);
	}
	const sbm = strengthen(h, ibm, key, c); // Strengthen ibm to derive sbm
	if (typeof mem !== "number" || isNaN(mem)) {
		throw new TypeError(`target memory cost mem must be a number`);
	}
	if (mem < 1) {
		throw new RangeError(`invalid target memory cost: got "${mem}", expected ">=1"`);
	}
	const N = calcN(mem); // Calculate N from target memory cost
	return { sbm, N }; // Return sbm and N
}

/**
 * shuffleAsync takes strengthened biographic material (sbm) and shuffles it across two asynchronous iterations of a
 * Fisher-Yates shuffle to produce pseudorandom biographic material (pbm), from a given hash, sbm array, pointer to
 * an HD key, and scrypt N parameter. The pbm produced is suitable for use in the Expand phase.
 */
export async function shuffleAsync(
	h: CHash,
	sbm: Uint8Array[],
	key: HDKey,
	N: number
): Promise<Uint8Array> {
	if (typeof N !== "number" || isNaN(N)) {
		throw new TypeError(`N must be a number`);
	}
	const c1 = deriveChild(h, key, 1397249350); // Child key at index SHUFFLE
	const s = await fyAsync(h, sbm, c1, N); // First iteration, shuffle all elements in the sbm
	const csum = h.create().update(s).digest().slice(0, 4); // First 4 hash bytes as checksum
	const index = new DataView(csum.buffer, csum.byteOffset, 4).getUint32(0, false); // Index from csum
	const c2 = deriveChild(h, c1, index); // Derive child at index
	const pbm = await fyAsync(h, s, c2, N); // Second iteration, shuffle all elements in s
	return pbm; // Return pseudorandom biographic material
}

/**
 * shuffleSync takes strengthened biographic material (sbm) and shuffles it across two synchronous iterations of a
 * Fisher-Yates shuffle to produce pseudorandom biographic material (pbm), from a given hash, sbm array, pointer to
 * an HD key, and scrypt N parameter. The pbm produced is suitable for use in the Expand phase.
 */
export function shuffleSync(h: CHash, sbm: Uint8Array[], key: HDKey, N: number): Uint8Array {
	if (typeof N !== "number" || isNaN(N)) {
		throw new TypeError(`N must be a number`);
	}
	const c1 = deriveChild(h, key, 1397249350); // Child key at index SHUFFLE
	const s = fySync(h, sbm, c1, N); // First iteration, shuffle all elements in the sbm
	const csum = h.create().update(s).digest().slice(0, 4); // First 4 hash bytes as checksum
	const index = new DataView(csum.buffer, csum.byteOffset, 4).getUint32(0, false); // Index from csum
	const c2 = deriveChild(h, c1, index); // Derive child at index
	const pbm = fySync(h, s, c2, N); // Second iteration, shuffle all elements in s
	return pbm; // Return pseudorandom biographic material
}

/**
 * expand generates output seed material (osm) from pseudorandom biographic material (pbm)
 * by repeatedly applying HMAC to expand the pbm, from a given hash, pbm array, HD key,
 * and output length.
 */
export function expand(h: CHash, pbm: Uint8Array, key: HDKey, length: number): Uint8Array {
	let t: Uint8Array = new Uint8Array(); // Last block
	let osm: Uint8Array = new Uint8Array(); // Output Seed Material
	let i = 0 >>> 0; // Counter (index)
	const d = digest(h, new Uint8Array(32), new Uint8Array(32));
	if (length > 255 * d.length) {
		throw new RangeError(`maximum output length exceeded`);
	}
	while (osm.length < length) {
		i++; // Increment counter
		const child = deriveChild(h, key, i); // Create a child of the key
		const prk = digest(h, child.key, pbm); // Create a prk from a MAC of the pbm
		const data = new Uint8Array(t.length + pbm.length + 1);
		data.set(t, 0);
		data.set(pbm, t.length);
		data.set([i], t.length + pbm.length);
		t = digest(h, prk, data); // MAC from prk and data
		osm = concatBytes(osm, t); // Set the output seed material to osm + t
	}
	return osm.slice(0, length); // Return the osm at the requested byte length
}
