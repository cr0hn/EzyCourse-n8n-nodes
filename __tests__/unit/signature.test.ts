import * as crypto from 'crypto';
import { verifyWebhookSignature } from '../../nodes/EzyCourseTrigger/utils/verifySignature';

// Helper to compute HMAC for test setup only (not the function under test)
function computeHmac(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

describe('HMAC-SHA256 signature verification', () => {
  const secret = 'test-secret-token';
  const body = JSON.stringify({ id: 1, email: 'student@example.com', event: 'new_signup' });

  it('accepts a valid signature (plain hex)', () => {
    const sig = computeHmac(body, secret);
    expect(verifyWebhookSignature(body, secret, sig)).toBe(true);
  });

  it('accepts a valid signature with sha256= prefix', () => {
    const sig = 'sha256=' + computeHmac(body, secret);
    expect(verifyWebhookSignature(body, secret, sig)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const sig = computeHmac(body, secret);
    const tamperedBody = JSON.stringify({ id: 1, email: 'hacker@example.com' });
    expect(verifyWebhookSignature(tamperedBody, secret, sig)).toBe(false);
  });

  it('rejects a wrong secret', () => {
    const sig = computeHmac(body, 'wrong-secret');
    expect(verifyWebhookSignature(body, secret, sig)).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(verifyWebhookSignature(body, secret, '')).toBe(false);
  });

  it('rejects a signature of wrong length (prevents timingSafeEqual crash)', () => {
    expect(verifyWebhookSignature(body, secret, 'abc123')).toBe(false);
  });

  it('is deterministic — same input always produces same hash', () => {
    const sig1 = computeHmac(body, secret);
    const sig2 = computeHmac(body, secret);
    expect(sig1).toBe(sig2);
  });
});
