/**
 * Integration tests for EzyCourseTrigger.
 *
 * Prerequisites:
 * - n8n running locally with EzyCourseTrigger workflow active
 * - ngrok exposing n8n webhook URL
 * - .env.test with: WEBHOOK_URL, SIGNATURE_TOKEN (optional)
 *
 * Run: npm run test:integration
 */

import * as crypto from 'crypto';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import type { IncomingMessage, RequestOptions } from 'http';

// Load .env.test if present
try {
  require('dotenv').config({ path: '.env.test' });
} catch {
  // dotenv not available in some environments
}

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const SIGNATURE_TOKEN = process.env.SIGNATURE_TOKEN;

function postJson(url: string, body: object, headers: Record<string, string> = {}): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsedUrl = new URL(url);
    const options: RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || undefined,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers,
      },
    };
    const callback = (res: IncomingMessage): void => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
    };
    const req = parsedUrl.protocol === 'https:'
      ? httpsRequest(options, callback)
      : httpRequest(options, callback);
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const skipIfNoWebhook = WEBHOOK_URL ? describe : describe.skip;

skipIfNoWebhook('EzyCourseTrigger integration', () => {
  const newSignupPayload = {
    id: 9999,
    first_name: 'Test',
    last_name: 'Student',
    name: 'Test Student',
    email: 'test-integration@example.com',
    phone_number: '',
  };

  it('accepts a valid webhook POST', async () => {
    const result = await postJson(WEBHOOK_URL!, newSignupPayload);
    // n8n returns 200 on success
    expect(result.status).toBe(200);
  }, 15000);

  it('rejects a POST with invalid signature when SIGNATURE_TOKEN is set', async () => {
    if (!SIGNATURE_TOKEN) {
      console.log('SIGNATURE_TOKEN not set — skipping signature rejection test');
      return;
    }
    const result = await postJson(WEBHOOK_URL!, newSignupPayload, {
      'x-ezycourse-signature': 'invalid-signature',
    });
    expect(result.status).toBe(401);
  }, 15000);

  it('accepts a POST with valid HMAC signature', async () => {
    if (!SIGNATURE_TOKEN) {
      console.log('SIGNATURE_TOKEN not set — skipping HMAC test');
      return;
    }
    const body = JSON.stringify(newSignupPayload);
    const sig = crypto.createHmac('sha256', SIGNATURE_TOKEN).update(body).digest('hex');
    const result = await postJson(WEBHOOK_URL!, newSignupPayload, {
      'x-ezycourse-signature': sig,
    });
    expect(result.status).toBe(200);
  }, 15000);
});
