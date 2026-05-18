# n8n-nodes-ezycourse — Project Context

## What this is
An n8n community node package for EzyCourse-powered platforms (e.g. alicebob.io).
GitHub: https://github.com/cr0hn/EzyCourse-n8n-nodes
Published on npm as `n8n-nodes-ezycourse`.

## Structure
- `nodes/EzyCourse/` — Action node (Data-In: calls EzyCourse API)
- `nodes/EzyCourseTrigger/` — Trigger node (Data-Out: receives webhooks from EzyCourse)
- `credentials/EzyCourseApi.credentials.ts` — Shared credential type
- `__tests__/unit/` — Pure logic tests (no external calls)
- `__tests__/integration/` — Real API tests (require .env.test)

## Key design decisions
- baseUrl has NO default value — every EzyCourse platform has a different URL
- accessToken goes in the URL path (EzyCourse convention), not in headers
- Signature verification tries headers: x-ezycourse-signature, x-webhook-signature, x-hub-signature-256
- HMAC-SHA256 using Node's crypto.timingSafeEqual (timing-safe)
- is_completed boolean → integer (1/0) before sending to EzyCourse

## EzyCourse webhook endpoints (Data-In)
- POST /api/ezycourse/webhooks/register-student/{token}
- POST /api/ezycourse/webhooks/register-student-with-enrollment/{token}
- POST /api/ezycourse/webhooks/remote-user-authentication/{token}
- POST /api/ezycourse/webhooks/create-product-enrollment/{token}
- POST /api/ezycourse/webhooks/delete-product-enrollment/{token}
- POST /api/ezycourse/webhooks/product-subscription-cycle-complete/{token}
- POST /api/ezycourse/webhooks/complete-lesson/{token}
- POST /api/ezycourse/webhooks/add-tag-for-student/{token}

## EzyCourse Data-Out events (triggers)
new_signup, new_product_enrollment, new_sale, renew_order, cancel_order,
buy_seats, course_completed, chapter_completed, quiz_completed, lesson_completed

## Running tests
- Unit: `npm test` (no external dependencies)
- Integration: `npm run test:integration` (requires .env.test)

## .env.test variables
BASE_URL=https://your-academy.com
ACCESS_TOKEN=your-access-token
SIGNATURE_TOKEN=your-signature-token
WEBHOOK_URL=https://abc123.ngrok.io/webhook/uuid

## Build & publish
- `npm run build` — compila TypeScript + copia SVGs a dist/ (gulp)
- `npm run dev` — watch mode
- `npm run lint` — ESLint
- `npm publish --access public` — publicar en npm (token en ~/.npmrc)
- `npm pkg fix` — normalizar repository.url si npm avisa al publicar
- Versión actual en npm: 0.1.0

## TODO pendiente
- Verificar qué header usa EzyCourse para la firma HMAC: enviar un webhook real
  desde el dashboard y loguear los headers que llegan. El código prueba en orden:
  x-ezycourse-signature → x-webhook-signature → x-hub-signature-256

## Assets
- SVG oficial EzyCourse: https://f.ezycourse.net/2456/cm8qwjlaa008e1f8z99u5a7ue.svg

## Commits
Always commit as: Dani <cr0hn@cr0hn.com>
