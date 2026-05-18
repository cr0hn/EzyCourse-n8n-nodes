import * as crypto from 'crypto';
import {
  IDataObject,
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

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
        return {
          webhookResponse: { code: 401, body: 'Missing signature header' } as any,
          noWebhookResponse: true,
        };
      }

      const rawBody = JSON.stringify(bodyData);
      const expectedSig = crypto
        .createHmac('sha256', signatureToken)
        .update(rawBody)
        .digest('hex');

      const sigToCompare = receivedSig.startsWith('sha256=')
        ? receivedSig.slice(7)
        : receivedSig;

      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(expectedSig, 'hex'),
          Buffer.from(sigToCompare, 'hex'),
        );
      } catch {
        isValid = false;
      }

      if (!isValid) {
        return {
          webhookResponse: { code: 401, body: 'Invalid signature' } as any,
          noWebhookResponse: true,
        };
      }
    }

    return {
      workflowData: [this.helpers.returnJsonArray([bodyData as IDataObject])],
    };
  }
}
