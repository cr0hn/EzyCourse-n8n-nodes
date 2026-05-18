# n8n-nodes-ezycourse

[![npm version](https://img.shields.io/npm/v/n8n-nodes-ezycourse.svg)](https://www.npmjs.com/package/n8n-nodes-ezycourse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n community node](https://img.shields.io/badge/n8n-community%20node-orange)](https://docs.n8n.io/integrations/community-nodes/)

An n8n community node package for [EzyCourse](https://ezycourse.com)-powered platforms. Provides a **Trigger node** that receives 10 real-time webhook events from EzyCourse and an **Action node** with 8 operations across 4 resources, covering the full EzyCourse webhook API.

## Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Nodes](#nodes)
  - [EzyCourse Trigger](#ezycourse-trigger)
  - [EzyCourse Action](#ezycourse-action)
- [Development](#development)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Open your n8n instance and go to **Settings → Community Nodes**.
2. Click **Install**.
3. Enter `n8n-nodes-ezycourse` and confirm.
4. Restart n8n if prompted.

## Authentication

Create a new **EzyCourse API** credential and fill in the following fields:

| Field | Required | Description |
|---|---|---|
| **Base URL** | Yes | Root URL of your EzyCourse platform, e.g. `https://your-academy.com`. No trailing slash. No default — every platform has its own URL. |
| **Access Token** | Yes | Token found on the **Webhook → Data-In** settings page of your EzyCourse dashboard. Embedded in the endpoint URL path. |
| **Signature Token** | No | Token found on the **Webhook → Data-Out** settings page. Enables HMAC-SHA256 signature verification on incoming webhooks. Leave empty to skip verification. |

## Nodes

### EzyCourse Trigger

Receives real-time events from EzyCourse via webhooks (Data-Out). Each workflow gets its own unique webhook URL that you paste into your EzyCourse dashboard.

**Setup**

1. Add an **EzyCourse Trigger** node to your workflow and select the event to listen to.
2. Activate the workflow — n8n will display a **Webhook URL**. Copy it.
3. Go to your EzyCourse dashboard → **Settings → Webhook (Data-Out)**.
4. Paste the URL into the corresponding event field and save.

When a **Signature Token** is configured, every incoming request is verified with HMAC-SHA256. Requests with a missing or invalid signature are rejected with HTTP 401.

**Supported Events**

| Event | Trigger |
|---|---|
| `new_signup` | A new user registers on the platform |
| `new_product_enrollment` | A student enrolls in a product (course, bundle, etc.) |
| `new_sale` | A new sale or order is created |
| `renew_order` | A subscription order is renewed |
| `cancel_order` | An order or subscription is cancelled |
| `buy_seats` | Seats are purchased for a group or team enrollment |
| `course_completed` | A student completes an entire course |
| `chapter_completed` | A student completes a chapter within a course |
| `quiz_completed` | A student completes a quiz |
| `lesson_completed` | A student completes a single lesson |

### EzyCourse Action

Calls EzyCourse Data-In webhook endpoints to create or update data on your platform from within a workflow.

**Resources and Operations**

| Resource | Operation | What it does |
|---|---|---|
| **Student** | Register | Register a new student on the platform |
| **Student** | Register and Enroll | Register a new student and enroll them in a product in one step |
| **Student** | Authenticate | Authenticate an existing student via a remote/SSO flow and get a redirect URL |
| **Enrollment** | Enroll | Enroll an existing student in a product |
| **Enrollment** | Unenroll | Remove a student's enrollment from a product |
| **Enrollment** | Complete Subscription Cycle | Mark a product subscription cycle as complete (e.g. after an external payment) |
| **Lesson** | Toggle Progress | Mark a specific lesson as completed or incomplete for a student |
| **Tag** | Add to Student | Assign one or more tags to a student for segmentation or automation |

## Development

**Prerequisites:** Node.js 18+, npm 9+

```bash
npm install
npm run build
```

### Unit Tests

Unit tests cover HMAC-SHA256 signature logic and field transformation rules. No external dependencies required.

```bash
npm test
```

### Integration Tests

Integration tests run against a live EzyCourse platform and a locally exposed n8n instance.

Copy the example environment file and fill in your values:

```bash
cp .env.test.example .env.test
```

```env
BASE_URL=https://your-academy.com
ACCESS_TOKEN=your-access-token
SIGNATURE_TOKEN=your-signature-token

# Run n8n locally, activate a workflow with an EzyCourse Trigger node,
# then expose it with ngrok: ngrok http 5678
WEBHOOK_URL=https://abc123.ngrok.io/webhook/your-workflow-uuid
```

```bash
npm run test:integration
```

Tests that cannot find `.env.test` are skipped automatically, so the suite is safe to run in CI environments without credentials.

## Contributing

Bug reports and feature requests are welcome. Please open an issue on [GitHub](https://github.com/cr0hn/EzyCourse-n8n-nodes/issues).

## License

[MIT](LICENSE)
