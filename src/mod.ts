/**
 * @fileoverview Entry point for @iacobus/hbedf.
 * Constructs and exports the hbedf async and sync functions, along with a re-export of the HbedfOpts type.
 * @module
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import type { CHash } from "npm:@noble/hashes@1.8.0/utils";
import { defaultSchema } from "npm:@iacobus/hd@1.1.1/path";
import { expand, extract, type HbedfOpts, key, shuffleAsync, shuffleSync } from "./hbedf.ts";

/** Re-export of HBEDF options. */
export type { HbedfOpts } from "./hbedf.ts";

/**
 * hbedf generates a derived seed from initial biographic material (ibm) and a secret, from a given hash,
 * ibm array, secret, and options.
 *
 * From the options, path and schema are a derivation path and schema. A default schema is used when schema
 * is undefined. c is the HMAC iterations count for strengthening. mem is the target memory cost for scrypt.
 * dsLen is the output byte length of the derived seed.
 * @example
 * const opts: HbedfOpts = { path: "m/42/0/1/0", c: 10000, mem: 128, dsLen: 64 };
 * const ds = await hbedf(ibm, secret, opts);
 */
export async function hbedf(
	h: CHash,
	ibm: Uint8Array[],
	secret: Uint8Array,
	opts: HbedfOpts
): Promise<Uint8Array> {
	let schema: string;
	if (opts.schema) {
		schema = opts.schema; // Use schema from opts when defined
	} else {
		schema = defaultSchema; // Default schema when undefined
	}
	const hdKey = key(h, secret, schema, opts.path); // Derive HD key
	const { sbm, N } = extract(h, ibm, hdKey, opts.c, opts.mem); // Extract sbm and N
	const pbm = await shuffleAsync(h, sbm, hdKey, N); // Produce pbm from the shuffle phase
	let dsLen: number;
	if (opts.dsLen) {
		dsLen = opts.dsLen; // Use dsLen from opts when defined
	} else {
		dsLen = 32; // Default length when undefined
	}
	return expand(h, pbm, hdKey, dsLen); // Return the result of the expand phase
}

/**
 * hbedfSync generates a derived seed from initial biographic material (ibm) and a secret, from a given hash,
 * ibm array, secret, and options.
 *
 * From the options, path and schema are a derivation path and schema. A default schema is used when schema
 * is undefined. c is the HMAC iterations count for strengthening. mem is the target memory cost for scrypt.
 * dsLen is the output byte length of the derived seed.
 * @example
 * const opts: HbedfOpts = { path: "m/42/0/1/0", c: 10000, mem: 128, dsLen: 64 };
 * const ds = hbedfSync(ibm, secret, opts);
 */
export function hbedfSync(
	h: CHash,
	ibm: Uint8Array[],
	secret: Uint8Array,
	opts: HbedfOpts
): Uint8Array {
	let schema: string;
	if (opts.schema) {
		schema = opts.schema; // Use schema from opts when defined
	} else {
		schema = defaultSchema; // Default schema when undefined
	}
	const hdKey = key(h, secret, schema, opts.path); // Derive HD key
	const { sbm, N } = extract(h, ibm, hdKey, opts.c, opts.mem); // Extract sbm and N
	const pbm = shuffleSync(h, sbm, hdKey, N); // Produce pbm from the shuffle phase
	let dsLen: number;
	if (opts.dsLen) {
		dsLen = opts.dsLen; // Use dsLen from opts when defined
	} else {
		dsLen = 32; // Default length when undefined
	}
	return expand(h, pbm, hdKey, dsLen); // Return the result of the expand phase
}
