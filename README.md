# n8n-nodes-ezycourse

[![npm version](https://img.shields.io/npm/v/n8n-nodes-ezycourse.svg)](https://www.npmjs.com/package/n8n-nodes-ezycourse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An n8n community node package for integrating with [EzyCourse](https://ezycourse.com)-powered platforms. It provides a **Trigger node** that listens to 10 EzyCourse Data-Out webhook events and an **Action node** that covers 4 resources and 8 operations via the EzyCourse Data-In webhook API.

---

## Installation

1. Open your n8n instance and go to **Settings → Community Nodes**.
2. Click **Install**.
3. Enter `n8n-nodes-ezycourse` and confirm.
4. Restart n8n if prompted.

---

## Authentication

This package uses the **EzyCourse API** credential type. Create a new credential and fill in:

| Field | Required | Description |
|---|---|---|
| **Base URL** | Yes | Root URL of your EzyCourse platform, e.g. `https://your-academy.com`. No trailing slash. There is no default — every platform has its own URL. |
| **Access Token** | Yes | Token shown on the **Webhook Data-In** settings page of your EzyCourse dashboard. It is embedded in the webhook endpoint path. |
| **Signature Token** | No | Token shown on the **Webhook Data-Out** settings page. Used to verify that incoming webhook payloads were sent by EzyCourse. |

---

## EzyCourse Trigger

The **EzyCourseTrigger** node receives real-time events from EzyCourse via webhooks (Data-Out).

### Setup

1. Add an **EzyCourseTrigger** node to your workflow and select the event you want to listen to.
2. Activate the workflow. n8n will display a **Webhook URL** — copy it.
3. Go to your EzyCourse dashboard → **Settings → Webhooks (Data-Out)**.
4. Paste the URL into the corresponding event field and save.

If you have configured a **Signature Token** in your credential, the node will automatically verify the HMAC-SHA256 signature on every incoming request and reject payloads with an invalid signature.

### Supported Events

| Event | Description |
|---|---|
| `new_signup` | Fired when a new user registers on the platform. |
| `new_product_enrollment` | Fired when a student enrolls in a product (course, bundle, etc.). |
| `new_sale` | Fired when a new sale/order is created. |
| `renew_order` | Fired when a subscription order is renewed. |
| `cancel_order` | Fired when an order or subscription is cancelled. |
| `buy_seats` | Fired when seats are purchased for a group/team enrollment. |
| `course_completed` | Fired when a student completes an entire course. |
| `chapter_completed` | Fired when a student completes a chapter within a course. |
| `quiz_completed` | Fired when a student completes a quiz. |
| `lesson_completed` | Fired when a student completes a single lesson. |

---

## EzyCourse Action

The **EzyCourse** node lets you call EzyCourse Data-In webhook endpoints to create or update data on your platform.

### Resources and Operations

| Resource | Operation | Description |
|---|---|---|
| **Student** | Register | Register a new student on the platform. |
| **Student** | Register with Enrollment | Register a new student and enroll them in a product in one step. |
| **Student** | Remote Authentication | Authenticate an existing user via a remote/SSO flow. |
| **Enrollment** | Create | Enroll an existing student in a product. |
| **Enrollment** | Delete | Remove a student's enrollment from a product. |
| **Enrollment** | Complete Subscription Cycle | Mark a product subscription cycle as complete (e.g. after payment). |
| **Lesson** | Mark as Complete | Mark a specific lesson as completed for a student. |
| **Tag** | Add to Student | Assign a tag to a student for segmentation or automation. |

---

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
npm run build
```

### Running Tests

**Unit tests** (no external dependencies):

```bash
npm test
```

**Integration tests** (require a real EzyCourse platform):

1. Copy the example environment file and fill in your values:

```bash
cp .env.test.example .env.test
```

2. Edit `.env.test`:

```
BASE_URL=https://your-academy.com
ACCESS_TOKEN=your-access-token
SIGNATURE_TOKEN=your-signature-token
WEBHOOK_URL=https://abc123.ngrok.io/webhook/your-workflow-uuid
```

> For the `WEBHOOK_URL`, run n8n locally, activate a workflow with an EzyCourseTrigger node, and expose it with [ngrok](https://ngrok.com).

3. Run integration tests:

```bash
npm run test:integration
```

---

## Contributing

Bug reports and feature requests are welcome. Please open an issue on [GitHub](https://github.com/cr0hn/n8n-nodes-ezycourse/issues).

---

## License

[MIT](LICENSE)
