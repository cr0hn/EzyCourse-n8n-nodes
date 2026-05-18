/**
 * Integration tests for EzyCourse action node.
 *
 * Prerequisites:
 * - .env.test with: BASE_URL, ACCESS_TOKEN
 *
 * Run: npm run test:integration
 */

// Load .env.test if present
try {
  require('dotenv').config({ path: '.env.test' });
} catch {}

import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import type { IncomingMessage, RequestOptions } from 'http';

const BASE_URL = process.env.BASE_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

function postToEzyCourse(
  baseUrl: string,
  endpoint: string,
  accessToken: string,
  body: object,
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(`${baseUrl}/api/ezycourse/webhooks/${endpoint}/${accessToken}`);
    const options: RequestOptions = {
      hostname: url.hostname,
      port: url.port || undefined,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const callback = (res: IncomingMessage): void => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
    };
    const req = url.protocol === 'https:'
      ? httpsRequest(options, callback)
      : httpRequest(options, callback);
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const skipIfNoCredentials = BASE_URL && ACCESS_TOKEN ? describe : describe.skip;

skipIfNoCredentials('EzyCourse action node integration', () => {
  it('register-student returns 422 on missing required fields', async () => {
    const result = await postToEzyCourse(BASE_URL!, 'register-student', ACCESS_TOKEN!, {});
    // 422 = token is valid, body is invalid — confirms token works
    expect([400, 422]).toContain(result.status);
  }, 15000);

  it('create-product-enrollment returns 422 on missing fields (not 401)', async () => {
    const result = await postToEzyCourse(BASE_URL!, 'create-product-enrollment', ACCESS_TOKEN!, {});
    expect([400, 422]).toContain(result.status);
  }, 15000);

  it('complete-lesson returns 422 on missing fields', async () => {
    const result = await postToEzyCourse(BASE_URL!, 'complete-lesson', ACCESS_TOKEN!, {});
    expect([400, 422]).toContain(result.status);
  }, 15000);

  it('add-tag-for-student returns 422 on missing fields', async () => {
    const result = await postToEzyCourse(BASE_URL!, 'add-tag-for-student', ACCESS_TOKEN!, {});
    expect([400, 422]).toContain(result.status);
  }, 15000);

  it('returns 401 with an invalid access token', async () => {
    const result = await postToEzyCourse(BASE_URL!, 'register-student', 'invalid-token-xxx', {});
    expect(result.status).toBe(401);
  }, 15000);
});
