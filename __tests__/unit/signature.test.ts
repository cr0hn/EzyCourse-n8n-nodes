import * as crypto from 'crypto';

function computeHmac(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function verifySignature(body: string, secret: string, received: string): boolean {
  const expected = computeHmac(body, secret);
  const sig = received.startsWith('sha256=') ? received.slice(7) : received;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(sig, 'hex'),
    );
  } catch {
    return false;
  }
}

describe('HMAC-SHA256 signature verification', () => {
  const secret = 'test-secret-token';
  const body = JSON.stringify({ id: 1, email: 'student@example.com', event: 'new_signup' });

  it('accepts a valid signature (plain hex)', () => {
    const sig = computeHmac(body, secret);
    expect(verifySignature(body, secret, sig)).toBe(true);
  });

  it('accepts a valid signature with sha256= prefix', () => {
    const sig = 'sha256=' + computeHmac(body, secret);
    expect(verifySignature(body, secret, sig)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const sig = computeHmac(body, secret);
    const tamperedBody = JSON.stringify({ id: 1, email: 'hacker@example.com' });
    expect(verifySignature(tamperedBody, secret, sig)).toBe(false);
  });

  it('rejects a wrong secret', () => {
    const sig = computeHmac(body, 'wrong-secret');
    expect(verifySignature(body, secret, sig)).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(verifySignature(body, secret, '')).toBe(false);
  });

  it('rejects a signature of wrong length (prevents timingSafeEqual crash)', () => {
    expect(verifySignature(body, secret, 'abc123')).toBe(false);
  });

  it('is deterministic — same input always produces same hash', () => {
    const sig1 = computeHmac(body, secret);
    const sig2 = computeHmac(body, secret);
    expect(sig1).toBe(sig2);
  });
});
