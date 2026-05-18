import * as crypto from 'crypto';

/**
 * Verifies an EzyCourse webhook HMAC-SHA256 signature.
 *
 * @param bodyString - The raw request body as a UTF-8 string.
 * @param secret     - The signature token from EzyCourse credentials.
 * @param receivedHeader - The value of the signature header sent by EzyCourse
 *                         (plain hex or with "sha256=" prefix).
 * @returns true if the signature is valid, false otherwise.
 */
export function verifyWebhookSignature(
  bodyString: string,
  secret: string,
  receivedHeader: string,
): boolean {
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('hex');

  const sigToCompare = receivedHeader.startsWith('sha256=')
    ? receivedHeader.slice(7)
    : receivedHeader;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'hex'),
      Buffer.from(sigToCompare, 'hex'),
    );
  } catch {
    return false;
  }
}
