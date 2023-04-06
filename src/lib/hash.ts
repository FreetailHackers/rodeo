import sha256 from 'crypto-js/sha256';

/**
 * Returns a SHA-256 hash of the input string.
 */
export async function hash(input: string): Promise<string> {
	return sha256(input).toString();
}
