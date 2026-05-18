import {
  IDataObject,
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

import { verifyWebhookSignature } from './utils/verifySignature';

export class EzyCourseTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'EzyCourse Trigger',
    name: 'ezyCourseTrigger',
    icon: 'file:ezycourse.svg',
    group: ['trigger'],
    version: 1,
    description: 'Starts the workflow when EzyCourse sends a webhook event',
    defaults: {
      name: 'EzyCourse Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'ezyCourseApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'New Signup',
            value: 'new_signup',
            description: 'Triggered when a new student registers',
          },
          {
            name: 'New Product Enrollment',
            value: 'new_product_enrollment',
            description: 'Triggered when a student enrolls in a product',
          },
          {
            name: 'New Sale',
            value: 'new_sale',
            description: 'Triggered when a new sale is made',
          },
          {
            name: 'Renew Order',
            value: 'renew_order',
            description: 'Triggered when a subscription is renewed',
          },
          {
            name: 'Cancel Order',
            value: 'cancel_order',
            description: 'Triggered when an order is cancelled',
          },
          {
            name: 'Buy Seats',
            value: 'buy_seats',
            description: 'Triggered when seats are purchased',
          },
          {
            name: 'Course Completed',
            value: 'course_completed',
            description: 'Triggered when a student completes a course',
          },
          {
            name: 'Chapter Completed',
            value: 'chapter_completed',
            description: 'Triggered when a student completes a chapter',
          },
          {
            name: 'Quiz Completed',
            value: 'quiz_completed',
            description: 'Triggered when a student completes a quiz',
          },
          {
            name: 'Lesson Completed',
            value: 'lesson_completed',
            description: 'Triggered when a student completes a lesson',
          },
        ],
        default: 'new_signup',
        required: true,
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        return true;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const credentials = await this.getCredentials('ezyCourseApi');
    const signatureToken = credentials.signatureToken as string | undefined;
    const req = this.getRequestObject();
    const bodyData = this.getBodyData();

    // ── Signature verification ────────────────────────────────────────────────
    if (signatureToken) {
      const signatureHeaders = [
        'x-ezycourse-signature',
        'x-webhook-signature',
        'x-hub-signature-256',
      ];

      let receivedSig: string | undefined;
      for (const header of signatureHeaders) {
        const val = req.headers[header];
        if (val) {
          receivedSig = Array.isArray(val) ? val[0] : val;
          break;
        }
      }

      if (!receivedSig) {
        const res = this.getResponseObject();
        res.status(401).json({ error: 'Missing signature header' });
        return { noWebhookResponse: true };
      }

      // BLOQ-1: use raw body buffer when available so that the HMAC is
      // computed over the exact bytes EzyCourse signed, not a re-serialised
      // version of the parsed object.
      const rawBodyBuffer: Buffer | undefined = (req as any).rawBody;
      const bodyString = rawBodyBuffer
        ? rawBodyBuffer.toString('utf8')
        : JSON.stringify(bodyData); // fallback: may differ from original bytes

      const isValid = verifyWebhookSignature(bodyString, signatureToken, receivedSig);

      if (!isValid) {
        const res = this.getResponseObject();
        res.status(401).json({ error: 'Invalid signature' });
        return { noWebhookResponse: true };
      }
    }

    // ── Event filtering ───────────────────────────────────────────────────────
    // m-1: filter incoming webhooks by the event type configured in the node.
    // TODO: Confirm which field EzyCourse uses to indicate the event type in
    // the payload (e.g. "event", "type", "trigger"). Send a real webhook from
    // the EzyCourse dashboard and log the headers/body to determine the field
    // name. Until confirmed, we check common candidates in order and skip
    // filtering only if no event field is found in the payload.
    const configuredEvent = this.getNodeParameter('event', 0) as string;
    const eventPayload = bodyData as IDataObject;
    const incomingEvent = (
      eventPayload.event ??
      eventPayload.type ??
      eventPayload.trigger
    ) as string | undefined;

    if (incomingEvent && incomingEvent !== configuredEvent) {
      const res = this.getResponseObject();
      res.status(200).json({ message: 'Event ignored' });
      return { noWebhookResponse: true };
    }

    return {
      workflowData: [this.helpers.returnJsonArray([bodyData as IDataObject])],
    };
  }
}
