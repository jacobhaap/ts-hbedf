import { pbkdf2Sync, createHash, createHmac } from "node:crypto";
import type { Buffer } from "node:buffer";

/**
 * HMAC Random Number Generator.
 * A pseudorandom number is derived from `HMAC-SHA256` based on a `PBKDF2-HMAC-SHA512` derived key
 * when the provided `secret` is a string, or using the secret directly when it is a Buffer. A `SHA256`
 * hash of the input data is taken, and the HMAC is updated with the hash and an optional counter number.
 * The integer value of the first **12** characters of the hexadecimal digest of the HMAC are divided by
 * the highest possible 12-character hexadecimal value to produce a floating-point number in the range
 * **[0, 1)**.
 */
export function createHmacRng(secret: string | Buffer, inputData: string, counter: number | null) {
    let hmacKey: Buffer;
    if (typeof secret === 'string') {
        const salt = ('HUMAN' + inputData).normalize('NFKD');
        hmacKey = pbkdf2Sync(secret.normalize('NFKD'), salt, 210000, 32, 'sha512');
    } else {
        hmacKey = secret;
    }
    const data = createHash('sha256').update(inputData).digest();
    const hmac = createHmac('sha256', hmacKey).update(data)
        if (counter) hmac.update(counter.toString());
        const digest = hmac.digest('hex');
    const intValue = parseInt(digest.toString().substring(0, 12), 16);
    return intValue / 0xffffffffffff;
}
