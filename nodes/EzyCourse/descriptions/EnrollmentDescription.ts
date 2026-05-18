import { INodeProperties } from 'n8n-workflow';
import { productTypeOptions } from './shared';

export const enrollmentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['enrollment'],
      },
    },
    options: [
      {
        name: 'Complete Subscription Cycle',
        value: 'completeSubscriptionCycle',
        description: 'Mark a subscription cycle as complete for a student',
        action: 'Complete a subscription cycle',
      },
      {
        name: 'Enroll Product',
        value: 'enroll',
        description: 'Enroll a student in a product',
        action: 'Enroll a student in a product',
      },
      {
        name: 'Unenroll Product',
        value: 'unenroll',
        description: 'Remove a student enrollment from a product',
        action: 'Unenroll a student from a product',
      },
    ],
    default: 'enroll',
  },
];

export const enrollmentFields: INodeProperties[] = [
  // ─── Common required fields (enroll / unenroll / completeSubscriptionCycle)
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'name@email.com',
    displayOptions: {
      show: {
        resource: ['enrollment'],
        operation: ['enroll', 'unenroll', 'completeSubscriptionCycle'],
      },
    },
    description: 'Email address of the student',
  },
  {
    displayName: 'Product Type',
    name: 'productType',
    type: 'options',
    required: true,
    default: 'course',
    displayOptions: {
      show: {
        resource: ['enrollment'],
        operation: ['enroll', 'unenroll', 'completeSubscriptionCycle'],
      },
    },
    options: productTypeOptions,
    description: 'Type of the product',
  },
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['enrollment'],
        operation: ['enroll', 'unenroll', 'completeSubscriptionCycle'],
      },
    },
    description: 'ID of the product',
  },

  // ─── enroll — Additional Fields ──────────────────────────────────────────
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['enrollment'],
        operation: ['enroll'],
      },
    },
    options: [
      {
        displayName: 'Expire Date',
        name: 'expireDate',
        type: 'dateTime',
        default: '',
        description: 'Expiry date for the enrollment',
      },
      {
        displayName: 'Price ID',
        name: 'priceId',
        type: 'number',
        default: 0,
        description: 'ID of the specific price variant',
      },
      {
        displayName: 'Quantity',
        name: 'quantity',
        type: 'number',
        default: 1,
        description: 'Number of seats (applicable for organizations)',
      },
    ],
  },

  // ─── unenroll — Additional Fields ────────────────────────────────────────
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['enrollment'],
        operation: ['unenroll'],
      },
    },
    options: [
      {
        displayName: 'Price ID',
        name: 'priceId',
        type: 'number',
        default: 0,
        description: 'ID of the specific price variant',
      },
    ],
  },

  // ─── completeSubscriptionCycle — Additional Fields ───────────────────────
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['enrollment'],
        operation: ['completeSubscriptionCycle'],
      },
    },
    options: [
      {
        displayName: 'Price ID',
        name: 'priceId',
        type: 'number',
        default: 0,
        description: 'ID of the specific price variant',
      },
    ],
  },
];
