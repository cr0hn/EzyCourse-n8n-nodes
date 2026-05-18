# Changelog

All notable changes to this project will be documented in this file.

## [0.1.2] - 2026-05-18

### Fixed
- **BLOQ-1** `EzyCourseTrigger`: HMAC now computed over raw request body buffer (`req.rawBody`) instead of re-serialised parsed object — ensures signature matches what EzyCourse actually signed
- **BLOQ-2** Unit tests now import and exercise production code instead of local reimplementations: `signature.test.ts` imports `verifyWebhookSignature`; `payloads.test.ts` imports `toEzyCourseInt`, `normalizeBaseUrl`, `parseTagIds` from new utils modules
- **M-B** `EzyCourseTrigger`: Missing/invalid signature now returns a real HTTP 401 via `getResponseObject()` instead of the ignored `webhookResponse.code` field
- **M-C** `tag.addToStudent`: `tagIds` string is now parsed to `number[]` via `parseTagIds` before sending to EzyCourse API
- **M-D** `tag.addToStudent`: `userId` default changed from `0` to `null`; added `NodeOperationError` guard preventing silent zero sends
- **M-E** `productTypeOptions` extracted to `nodes/EzyCourse/descriptions/shared.ts`; both `StudentDescription` and `EnrollmentDescription` import from it — eliminates duplication
- **NUEVO-M** Credential test rule changed from broken `responseSuccessBody` to `responseCode: 422` which correctly tests that EzyCourse accepted the token
- **m-1** `EzyCourseTrigger`: Incoming webhook events are now filtered against the node's configured `event` parameter (checks `event`, `type`, `trigger` payload fields; includes TODO to confirm exact field name)
- **m-3** `EzyCourse.execute()`: Success path `returnData.push` now includes `pairedItem: { item: i }` for proper n8n item pairing
- **m-4** `EzyCourse` subtitle corrected to `resource: operation` order
- **m-5** `StudentDescription` authenticate Email field now has `typeOptions: { email: true }`
- **m-6** `package.json` `main` field corrected to `dist/nodes/EzyCourse/EzyCourse.node.js`

### Added
- `nodes/EzyCourseTrigger/utils/verifySignature.ts` — exported `verifyWebhookSignature` function (production HMAC logic)
- `nodes/EzyCourse/utils/helpers.ts` — exported `normalizeBaseUrl`, `toEzyCourseInt`, `parseTagIds` helpers
- `nodes/EzyCourse/descriptions/shared.ts` — shared `productTypeOptions` array

## [0.1.1] - 2026-05-18

### Added
- `EzyCourse` action node implementation (`nodes/EzyCourse/EzyCourse.node.ts`): 4 resources, 8 operations, full POST request execution with `continueOnFail` support
- `StudentDescription.ts`: operations `register`, `registerAndEnroll`, `authenticate` with all required and optional fields
- `EnrollmentDescription.ts`: operations `enroll`, `unenroll`, `completeSubscriptionCycle` with shared and per-operation additional fields
- `LessonDescription.ts`: operation `toggleProgress` (lessonId, enrollmentId, isCompleted)
- `TagDescription.ts`: operation `addToStudent` with conditional display by `identifyBy` (email or userId)

## [0.1.0] - 2026-05-18

### Added
- `EzyCourseTrigger` node: webhook trigger for 10 EzyCourse Data-Out events (new_signup, new_product_enrollment, new_sale, renew_order, cancel_order, buy_seats, course_completed, chapter_completed, quiz_completed, lesson_completed)
- `EzyCourse` action node: 4 resources (Student, Enrollment, Lesson, Tag) with 8 operations covering all EzyCourse Data-In webhook endpoints
- `EzyCourseApi` credentials: Base URL, Access Token, Signature Token
- HMAC-SHA256 signature verification for incoming webhooks
- Unit tests for signature verification and field transformations
- Integration test scaffolding for real API and ngrok-based webhook testing
