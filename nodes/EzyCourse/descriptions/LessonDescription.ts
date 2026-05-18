import { INodeProperties } from 'n8n-workflow';

export const lessonOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['lesson'],
      },
    },
    options: [
      {
        name: 'Toggle Progress',
        value: 'toggleProgress',
        description: 'Mark a lesson as completed or incomplete',
        action: 'Toggle lesson progress',
      },
    ],
    default: 'toggleProgress',
  },
];

export const lessonFields: INodeProperties[] = [
  {
    displayName: 'Lesson ID',
    name: 'lessonId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['lesson'],
        operation: ['toggleProgress'],
      },
    },
    description: 'ID of the lesson',
  },
  {
    displayName: 'Enrollment ID',
    name: 'enrollmentId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['lesson'],
        operation: ['toggleProgress'],
      },
    },
    description: 'ID of the student enrollment',
  },
  {
    displayName: 'Mark as Completed',
    name: 'isCompleted',
    type: 'boolean',
    required: true,
    default: true,
    displayOptions: {
      show: {
        resource: ['lesson'],
        operation: ['toggleProgress'],
      },
    },
    description: 'Whether to mark the lesson as completed (true) or incomplete (false)',
  },
];
