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

  it('accepts raw body with whitespace (body not re-serialized)', () => {
    // Simulates rawBody arriving with extra spaces — HMAC must be computed
    // on exactly this string, not on JSON.stringify(JSON.parse(body))
    const rawBodyWithSpaces = '{ "id": 1, "email": "student@example.com", "event": "new_signup" }';
    const sig = computeHmac(rawBodyWithSpaces, secret);
    expect(verifyWebhookSignature(rawBodyWithSpaces, secret, sig)).toBe(true);
  });

  it('rejects when raw body has spaces but signature was made from compact JSON', () => {
    const compactBody = JSON.stringify({ id: 1, email: 'student@example.com', event: 'new_signup' });
    const sig = computeHmac(compactBody, secret);
    const rawBodyWithSpaces = '{ "id": 1, "email": "student@example.com", "event": "new_signup" }';
    // Different byte sequence → different HMAC → should fail
    expect(verifyWebhookSignature(rawBodyWithSpaces, secret, sig)).toBe(false);
  });

  it('rejects an empty secret', () => {
    const sig = computeHmac(body, '');
    // Valid HMAC with empty secret should NOT be accepted against a non-empty secret
    expect(verifyWebhookSignature(body, secret, sig)).toBe(false);
  });

  it('accepts valid HMAC when secret is empty (edge case)', () => {
    const emptySecret = '';
    const sig = computeHmac(body, emptySecret);
    expect(verifyWebhookSignature(body, emptySecret, sig)).toBe(true);
  });

  it('accepts valid HMAC for an empty body', () => {
    const emptyBody = '';
    const sig = computeHmac(emptyBody, secret);
    expect(verifyWebhookSignature(emptyBody, secret, sig)).toBe(true);
  });

  it('rejects a non-hex header of correct hex length', () => {
    // 64 chars but non-hex (contains 'g') — Buffer.from(..., 'hex') silently truncates,
    // causing a length mismatch caught by timingSafeEqual → returns false
    const nonHexHeader = 'g'.repeat(64);
    expect(verifyWebhookSignature(body, secret, nonHexHeader)).toBe(false);
  });
});
