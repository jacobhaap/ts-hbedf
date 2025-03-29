/**
 * @fileoverview Entry point for @iacobus/hbedf/utils, re-exporting HBEDF utilities.
 * @author Jacob V. B. Haap <iacobus.xyz>
 * @license MIT
 */

import { checksum, verify } from "./checksum.ts";
import { toBytes, toHex } from "./hex.ts";
import { hmacRng } from "./hmacRng.ts";
import { fyShuffle } from "./shuffle.ts";
import { transform } from "./transform.ts";

/** Re-export of 'toHex' and 'toBytes' functions. */
export { toHex, toBytes } from "./hex.ts";

/** Re-export of @noble/hashes 'ScryptOpts' type. */
export type { ScryptOpts } from "npm:@noble/hashes@1.7.1/scrypt";

/** Re-export of 'hmacRng' function. */
export { hmacRng } from "./hmacRng.ts";

/** Re-export of 'fyShuffle' function. */
export { fyShuffle } from "./shuffle.ts";

/** Re-export of 'checksum' and 'verify' functions. */
export { checksum, verify } from "./checksum.ts";

/** Re-export of 'transform' function and 'Algorithm' type. */
export { type Algorithm, transform } from "./transform.ts";

/** HBEDF utils. */
export const utils = {
    toHex,
    toBytes,
    hmacRng,
    fyShuffle,
    checksum,
    verify,
    transform
}
