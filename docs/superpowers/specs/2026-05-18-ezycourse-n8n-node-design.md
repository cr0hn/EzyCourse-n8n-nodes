# EzyCourse n8n Node — Design Spec

**Date:** 2026-05-18  
**Package:** `n8n-nodes-ezycourse`  
**Status:** Approved

---

## 1. Overview

A community n8n node package that integrates EzyCourse-powered platforms (e.g. alicebob.io) with n8n workflows via the EzyCourse webhook system.

The package provides two nodes:
- **EzyCourseTrigger** — receives events from EzyCourse (Data-Out webhooks)
- **EzyCourse** — executes actions on EzyCourse (Data-In webhooks)

Target audience: any EzyCourse platform operator. The package is generic — no hardcoded URLs, no defaults.

---

## 2. Project Structure

```
n8n-nodes-ezycourse/
├── nodes/
│   ├── EzyCourse/
│   │   ├── EzyCourse.node.ts
│   │   ├── descriptions/
│   │   │   ├── StudentDescription.ts
│   │   │   ├── EnrollmentDescription.ts
│   │   │   ├── LessonDescription.ts
│   │   │   └── TagDescription.ts
│   │   └── ezycourse.svg
│   └── EzyCourseTrigger/
│       ├── EzyCourseTrigger.node.ts
│       └── ezycourse.svg
├── credentials/
│   └── EzyCourseApi.credentials.ts
├── __tests__/
│   ├── unit/
│   │   ├── signature.test.ts
│   │   └── payloads.test.ts
│   └── integration/
│       ├── trigger.test.ts
│       └── actions.test.ts
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .gitignore
├── .npmignore
├── .env.test.example
├── README.md
├── CHANGELOG.md
└── CLAUDE.md
```

---

## 3. Credentials: `EzyCourseApi`

Type name: `ezyCourseApi` (camelCase internal id)  
Display name: `EzyCourse API`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `baseUrl` | string | yes | — | Base URL of the EzyCourse platform. Example: `https://your-academy.com` |
| `accessToken` | string (password) | yes | — | Access token from Webhook settings (Data-In page) |
| `signatureToken` | string (password) | no | — | Signature token from Webhook settings (Data-Out page). Used to verify HMAC-SHA256 signatures on incoming webhooks |

**Credential test:** Attempts a POST to `{baseUrl}/api/ezycourse/webhooks/register-student/{accessToken}` with intentionally missing fields to provoke a 422 validation error (not a 401). A 422 response confirms the token is accepted. A 401/403 means the token is invalid. Network errors surface as connection failures. This avoids needing a dedicated ping endpoint.

**No default value for `baseUrl`.** Placeholder text: `https://your-academy.com`.

---

## 4. Node: `EzyCourseTrigger`

### 4.1 Identity

| Property | Value |
|---|---|
| Display name | EzyCourse Trigger |
| Name | `ezyCourseTrigger` |
| Icon | `ezycourse.svg` |
| Group | `trigger` |
| Version | 1 |
| Credentials | `EzyCourseApi` |

### 4.2 Events (dropdown field `event`)

| Value | Label |
|---|---|
| `new_signup` | New Signup |
| `new_product_enrollment` | New Product Enrollment |
| `new_sale` | New Sale |
| `renew_order` | Renew Order |
| `cancel_order` | Cancel Order |
| `buy_seats` | Buy Seats |
| `course_completed` | Course Completed |
| `chapter_completed` | Chapter Completed |
| `quiz_completed` | Quiz Completed |
| `lesson_completed` | Lesson Completed |

### 4.3 Webhook lifecycle

- `n8n` generates a unique webhook URL per workflow instance.
- The user copies this URL and pastes it into the corresponding EzyCourse Data-Out trigger field.
- On activation, the node registers the webhook path with n8n's webhook registry.
- On deactivation, it unregisters.

### 4.4 Signature verification

If `signatureToken` is set in the credentials:

1. Extract the signature from the incoming request header. During implementation, send a test webhook from EzyCourse and inspect all headers to identify the exact header name (likely `X-Webhook-Signature` or `X-Hub-Signature-256`). The implementation must confirm this before shipping.
2. Compute `HMAC-SHA256(rawBody, signatureToken)`.
3. Compare using a constant-time comparison (`crypto.timingSafeEqual`).
4. If mismatch → respond HTTP 401 and do not pass data to the workflow.

If `signatureToken` is not set → skip verification (allow all).

### 4.5 Output schema

Each event outputs one item. Fields depend on the event type. All known fields are passed through as-is from EzyCourse. The node does not filter or rename fields — full fidelity.

Example output for `new_sale`:
```json
{
  "id": 123,
  "first_name": "Ana",
  "last_name": "García",
  "email": "ana@example.com",
  "product_id": 456,
  "product_type": "course",
  "product_name": "Mi Curso",
  "price": 49.99,
  "gateway": "stripe"
}
```

---

## 5. Node: `EzyCourse`

### 5.1 Identity

| Property | Value |
|---|---|
| Display name | EzyCourse |
| Name | `ezyCourse` |
| Icon | `ezycourse.svg` |
| Group | `output` |
| Version | 1 |
| Credentials | `EzyCourseApi` |

### 5.2 Resources and Operations

#### Resource: `Student`

**Operation: `Register`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/register-student/{accessToken}`
- Required fields: `first_name`, `last_name`, `email`, `password`, `password_confirmation`
- Optional fields (Additional Fields): `phone_number`, `phone_country_code`

**Operation: `Register and Enroll`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/register-student-with-enrollment/{accessToken}`
- Required fields: `first_name`, `last_name`, `email`, `password`, `password_confirmation`, `product_type`, `product_id`
- Optional fields: `phone_number`, `phone_country_code`, `price_id`, `expire_date`, `quantity`

**Operation: `Authenticate`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/remote-user-authentication/{accessToken}`
- Required fields: `user_id` OR `email` (at least one)
- Optional fields: `redirect_url`

#### Resource: `Enrollment`

**Operation: `Enroll`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/create-product-enrollment/{accessToken}`
- Required fields: `email`, `product_type`, `product_id`
- Optional fields: `price_id`, `expire_date`, `quantity`

**Operation: `Unenroll`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/delete-product-enrollment/{accessToken}`
- Required fields: `email`, `product_type`, `product_id`
- Optional fields: `price_id`

**Operation: `Complete Subscription Cycle`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/product-subscription-cycle-complete/{accessToken}`
- Required fields: `email`, `product_type`, `product_id`
- Optional fields: `price_id`

#### Resource: `Lesson`

**Operation: `Toggle Progress`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/complete-lesson/{accessToken}`
- Required fields: `lesson_id`, `enrollment_id`, `is_completed` (boolean toggle → sent as 0 or 1)

#### Resource: `Tag`

**Operation: `Add to Student`**
- Endpoint: `POST {baseUrl}/api/ezycourse/webhooks/add-tag-for-student/{accessToken}`
- Required fields: `tag_ids` (comma-separated string), `user_id` OR `email`

### 5.3 Request format

All requests: `Content-Type: application/json`, JSON body.  
The `accessToken` goes in the URL path, not in headers.

### 5.4 Response handling

- HTTP 2xx → return response body as n8n output item
- HTTP 4xx/5xx → throw `NodeApiError` with the response body message
- Network error → throw `NodeOperationError`

---

## 6. Authentication Flow

```
User configures EzyCourseApi credential
  → baseUrl: https://your-academy.com
  → accessToken: abc123
  → signatureToken: xyz789 (optional)

EzyCourse node (action):
  POST https://your-academy.com/api/ezycourse/webhooks/{operation}/abc123
  Body: { ...fields }

EzyCourseTrigger node:
  n8n webhook URL: https://n8n.yourhost.com/webhook/{uuid}
  User pastes this URL in EzyCourse dashboard for the selected event
  EzyCourse POSTs to this URL on event
  Node verifies HMAC signature → passes payload to workflow
```

---

## 7. Testing Strategy

### 7.1 Unit tests (`__tests__/unit/`)

- `signature.test.ts` — HMAC-SHA256 generation and verification logic; timing-safe comparison; rejection of invalid signatures
- `payloads.test.ts` — Field mapping for each operation; optional field exclusion; `is_completed` boolean→integer conversion

### 7.2 Integration tests (`__tests__/integration/`)

Require a running n8n instance + ngrok + real alicebob.io credentials.

- `trigger.test.ts` — Sends HTTP POSTs mimicking EzyCourse Data-Out events; verifies correct payload reaches n8n; verifies HMAC rejection
- `actions.test.ts` — Calls each Data-In operation against alicebob.io; verifies real API responses

**Setup:**
- `.env.test` (gitignored) with: `BASE_URL`, `ACCESS_TOKEN`, `SIGNATURE_TOKEN`, `N8N_WEBHOOK_URL`
- `.env.test.example` committed with placeholder values
- Tests skip gracefully if `.env.test` is absent (CI-safe)

### 7.3 Tools

| Tool | Purpose |
|---|---|
| `jest` + `ts-jest` | Test runner |
| `nock` | HTTP interception for unit tests |
| `ngrok` | Expose local n8n for trigger integration tests |
| `dotenv` | Load `.env.test` |

---

## 8. Package Configuration

### `package.json` (key fields)

```json
{
  "name": "n8n-nodes-ezycourse",
  "version": "0.1.0",
  "description": "n8n community node for EzyCourse platform integration",
  "keywords": ["n8n-community-node-package", "ezycourse"],
  "license": "MIT",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/EzyCourseApi.credentials.js"],
    "nodes": [
      "dist/nodes/EzyCourse/EzyCourse.node.js",
      "dist/nodes/EzyCourseTrigger/EzyCourseTrigger.node.js"
    ]
  },
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "lint": "eslint nodes credentials --ext .ts",
    "test": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

### TypeScript

- `target: ES2019`, `module: commonjs`
- Strict mode enabled
- Peer dependency: `n8n-workflow`

### npm publish

- `.npmignore` excludes: `__tests__/`, `docs/`, `.env*`, `*.md` (except README)
- Published to public npm registry as `n8n-nodes-ezycourse`

---

## 9. Documentation

- `README.md` (English): installation, credential setup, node usage, webhook configuration guide with screenshots placeholder, testing
- `CHANGELOG.md`: versioned changelog, newest first
- `CLAUDE.md`: project context for AI-assisted development

---

## 10. Out of Scope (v1)

- EzyCourse REST API (non-webhook endpoints)
- OAuth flow (EzyCourse uses token-based auth only)
- Automatic webhook registration via API (EzyCourse requires manual URL configuration)
- n8n Cloud marketplace submission (future)
