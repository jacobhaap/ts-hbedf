import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

/**
 * Calculate a 32-bit decimal checksum.
 * Takes a `sha256` hash of a string, and extracts the first **8** characters from
 * the *hexadecimal* digest of the hash. The extracted characters are then converted
 * to a *decimal* value. Padding is applied to ensure a fixed-length output of **10**
 * digits. The resulting decimal checksum is returned as a *Buffer*.
 */
export function calculateChecksum(str: string,): Buffer {
    const hash = createHash('sha256')
        .update(str)
        .digest('hex');
    return Buffer.from(parseInt(hash.substring(0, 8), 16).toString().padStart(10, '0'));
}

/**
 * Verify a 32-bit decimal checksum.
 * Takes a `utf8` *string*, and separates the final 10 characters of the string to
 * isolate the checksum. The {@link calculateChecksum} function is called for the remainder
 * of the string to recalculate the checksum, which is then compared with the extracted
 * checksum, returning *true* if the checksums match, and *false* if they do not.
 */
export function verifyChecksum(str: string): boolean {
    const data = str.slice(0, -10);
    const checksum = str.slice(-10);
    return calculateChecksum(data).toString('utf8') === checksum;
}
