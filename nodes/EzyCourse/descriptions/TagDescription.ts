import { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['tag'],
      },
    },
    options: [
      {
        name: 'Add to Student',
        value: 'addToStudent',
        description: 'Add one or more tags to a student',
        action: 'Add tags to a student',
      },
    ],
    default: 'addToStudent',
  },
];

export const tagFields: INodeProperties[] = [
  {
    displayName: 'Tag IDs',
    name: 'tagIds',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1,2,3',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['addToStudent'],
      },
    },
    description: 'Comma-separated list of tag IDs to assign to the student (e.g. "1,2,3")',
  },
  {
    displayName: 'Identify Student By',
    name: 'identifyBy',
    type: 'options',
    default: 'email',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['addToStudent'],
      },
    },
    options: [
      {
        name: 'Email',
        value: 'email',
        description: 'Identify the student by their email address',
      },
      {
        name: 'User ID',
        value: 'userId',
        description: 'Identify the student by their numeric user ID',
      },
    ],
    description: 'How to identify the student',
  },
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'name@email.com',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['addToStudent'],
        identifyBy: ['email'],
      },
    },
    description: 'Email address of the student',
  },
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['addToStudent'],
        identifyBy: ['userId'],
      },
    },
    description: 'Numeric ID of the student',
  },
];
