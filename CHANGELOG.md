# Changelog

All notable changes to this project will be documented in this file.

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
