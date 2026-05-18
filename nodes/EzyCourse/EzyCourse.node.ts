import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  IDataObject,
  NodeApiError,
  NodeOperationError,
} from 'n8n-workflow';

import { studentOperations, studentFields } from './descriptions/StudentDescription';
import { enrollmentOperations, enrollmentFields } from './descriptions/EnrollmentDescription';
import { lessonOperations, lessonFields } from './descriptions/LessonDescription';
import { tagOperations, tagFields } from './descriptions/TagDescription';

export class EzyCourse implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'EzyCourse',
    name: 'ezyCourse',
    icon: 'file:ezycourse.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the EzyCourse platform',
    defaults: {
      name: 'EzyCourse',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'ezyCourseApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Enrollment',
            value: 'enrollment',
          },
          {
            name: 'Lesson',
            value: 'lesson',
          },
          {
            name: 'Student',
            value: 'student',
          },
          {
            name: 'Tag',
            value: 'tag',
          },
        ],
        default: 'student',
      },
      ...studentOperations,
      ...studentFields,
      ...enrollmentOperations,
      ...enrollmentFields,
      ...lessonOperations,
      ...lessonFields,
      ...tagOperations,
      ...tagFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('ezyCourseApi');

    const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
    const accessToken = credentials.accessToken as string;

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      let endpoint = '';
      let body: IDataObject = {};

      try {
        if (resource === 'student') {
          if (operation === 'register') {
            endpoint = `/api/ezycourse/webhooks/register-student/${accessToken}`;
            body = {
              first_name: this.getNodeParameter('firstName', i) as string,
              last_name: this.getNodeParameter('lastName', i) as string,
              email: this.getNodeParameter('email', i) as string,
              password: this.getNodeParameter('password', i) as string,
              password_confirmation: this.getNodeParameter('passwordConfirmation', i) as string,
            };
            const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
            if (additional.phoneNumber) body.phone_number = additional.phoneNumber;
            if (additional.phoneCountryCode) body.phone_country_code = additional.phoneCountryCode;

          } else if (operation === 'registerAndEnroll') {
            endpoint = `/api/ezycourse/webhooks/register-student-with-enrollment/${accessToken}`;
            body = {
              first_name: this.getNodeParameter('firstName', i) as string,
              last_name: this.getNodeParameter('lastName', i) as string,
              email: this.getNodeParameter('email', i) as string,
              password: this.getNodeParameter('password', i) as string,
              password_confirmation: this.getNodeParameter('passwordConfirmation', i) as string,
              product_type: this.getNodeParameter('productType', i) as string,
              product_id: this.getNodeParameter('productId', i) as number,
            };
            const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
            if (additional.phoneNumber) body.phone_number = additional.phoneNumber;
            if (additional.phoneCountryCode) body.phone_country_code = additional.phoneCountryCode;
            if (additional.priceId) body.price_id = additional.priceId;
            if (additional.expireDate) body.expire_date = additional.expireDate;
            if (additional.quantity) body.quantity = additional.quantity;

          } else if (operation === 'authenticate') {
            endpoint = `/api/ezycourse/webhooks/remote-user-authentication/${accessToken}`;
            const userId = this.getNodeParameter('userId', i, null) as number | null;
            const email = this.getNodeParameter('email', i, null) as string | null;
            if (!userId && !email) {
              throw new NodeOperationError(
                this.getNode(),
                'Either User ID or Email must be provided for authentication',
                { itemIndex: i },
              );
            }
            if (userId) body.user_id = userId;
            if (email) body.email = email;
            const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
            if (additional.redirectUrl) body.redirect_url = additional.redirectUrl;
          }

        } else if (resource === 'enrollment') {
          if (operation === 'enroll') {
            endpoint = `/api/ezycourse/webhooks/create-product-enrollment/${accessToken}`;
            body = {
              email: this.getNodeParameter('email', i) as string,
              product_type: this.getNodeParameter('productType', i) as string,
              product_id: this.getNodeParameter('productId', i) as number,
            };
            const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
            if (additional.priceId) body.price_id = additional.priceId;
            if (additional.expireDate) body.expire_date = additional.expireDate;
            if (additional.quantity) body.quantity = additional.quantity;

          } else if (operation === 'unenroll') {
            endpoint = `/api/ezycourse/webhooks/delete-product-enrollment/${accessToken}`;
            body = {
              email: this.getNodeParameter('email', i) as string,
              product_type: this.getNodeParameter('productType', i) as string,
              product_id: this.getNodeParameter('productId', i) as number,
            };
            const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
            if (additional.priceId) body.price_id = additional.priceId;

          } else if (operation === 'completeSubscriptionCycle') {
            endpoint = `/api/ezycourse/webhooks/product-subscription-cycle-complete/${accessToken}`;
            body = {
              email: this.getNodeParameter('email', i) as string,
              product_type: this.getNodeParameter('productType', i) as string,
              product_id: this.getNodeParameter('productId', i) as number,
            };
            const additional = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
            if (additional.priceId) body.price_id = additional.priceId;
          }

        } else if (resource === 'lesson') {
          if (operation === 'toggleProgress') {
            endpoint = `/api/ezycourse/webhooks/complete-lesson/${accessToken}`;
            const isCompleted = this.getNodeParameter('isCompleted', i) as boolean;
            body = {
              lesson_id: this.getNodeParameter('lessonId', i) as number,
              enrollment_id: this.getNodeParameter('enrollmentId', i) as number,
              is_completed: isCompleted ? 1 : 0,
            };
          }

        } else if (resource === 'tag') {
          if (operation === 'addToStudent') {
            endpoint = `/api/ezycourse/webhooks/add-tag-for-student/${accessToken}`;
            body = {
              tag_ids: this.getNodeParameter('tagIds', i) as string,
            };
            const identifyBy = this.getNodeParameter('identifyBy', i) as string;
            if (identifyBy === 'email') {
              body.email = this.getNodeParameter('email', i) as string;
            } else {
              body.user_id = this.getNodeParameter('userId', i) as number;
            }
          }
        }

        if (!endpoint) {
          throw new NodeOperationError(
            this.getNode(),
            `Unknown resource/operation: ${resource}/${operation}`,
            { itemIndex: i },
          );
        }

        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${baseUrl}${endpoint}`,
          body,
          headers: { 'Content-Type': 'application/json' },
        });

        returnData.push({ json: response as IDataObject });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
          continue;
        }
        if (error instanceof NodeApiError || error instanceof NodeOperationError) {
          throw error;
        }
        const errorObj: Record<string, string> = {
          message: error instanceof Error ? error.message : String(error),
        };
        if (error instanceof Error && error.name) errorObj.name = error.name;
        throw new NodeApiError(this.getNode(), errorObj, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
