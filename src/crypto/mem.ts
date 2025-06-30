/**
 * @fileoverview Provides a function for scrypt N parameter calculation.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

/** CalcN calculates the scrypt N parameter from a given target memory cost. */
export function calcN(mem: number): number {
	const memCost = mem * 1024 * 1024; // mem (MiB) converted to bytes
	const memoryPerUnitN = 1024; // memory per call, assuming r=8, p=1
	const rawN = memCost / (2 * memoryPerUnitN); // max N per call to match target memory cost
	// Round rawN down to nearest power of two
	let n = rawN | 0;
	n = n >>> 0;
	n |= n >> 1;
	n |= n >> 2;
	n |= n >> 4;
	n |= n >> 8;
	n |= n >> 16;
	n = (n + 1) >>> 1;
	return n;
}
