import { INodeProperties } from 'n8n-workflow';

export const studentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['student'],
      },
    },
    options: [
      {
        name: 'Authenticate',
        value: 'authenticate',
        description: 'Authenticate a student and get a remote login URL',
        action: 'Authenticate a student',
      },
      {
        name: 'Register',
        value: 'register',
        description: 'Register a new student',
        action: 'Register a student',
      },
      {
        name: 'Register and Enroll',
        value: 'registerAndEnroll',
        description: 'Register a new student and enroll them in a product',
        action: 'Register and enroll a student',
      },
    ],
    default: 'register',
  },
];

export const studentFields: INodeProperties[] = [
  // ─── register ───────────────────────────────────────────────────────────────
  {
    displayName: 'First Name',
    name: 'firstName',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['register', 'registerAndEnroll'],
      },
    },
    description: 'First name of the student',
  },
  {
    displayName: 'Last Name',
    name: 'lastName',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['register', 'registerAndEnroll'],
      },
    },
    description: 'Last name of the student',
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
        resource: ['student'],
        operation: ['register', 'registerAndEnroll'],
      },
    },
    description: 'Email address of the student',
  },
  {
    displayName: 'Password',
    name: 'password',
    type: 'string',
    required: true,
    default: '',
    typeOptions: {
      password: true,
      minValue: 8,
      maxValue: 30,
    },
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['register', 'registerAndEnroll'],
      },
    },
    description: 'Password for the student account (8–30 characters)',
  },
  {
    displayName: 'Password Confirmation',
    name: 'passwordConfirmation',
    type: 'string',
    required: true,
    default: '',
    typeOptions: {
      password: true,
    },
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['register', 'registerAndEnroll'],
      },
    },
    description: 'Must match the password field',
  },

  // ─── registerAndEnroll extra required fields ─────────────────────────────
  {
    displayName: 'Product Type',
    name: 'productType',
    type: 'options',
    required: true,
    default: 'course',
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['registerAndEnroll'],
      },
    },
    options: [
      { name: 'Audio Library', value: 'audio_library' },
      { name: 'Bundle Course', value: 'bundle_course' },
      { name: 'Coaching Program', value: 'coaching_program' },
      { name: 'Community', value: 'community' },
      { name: 'Course', value: 'course' },
      { name: 'Digital Product', value: 'digital_product' },
      { name: 'Group', value: 'group' },
      { name: 'Membership', value: 'membership' },
      { name: 'Organization', value: 'organization' },
      { name: 'Physical Product', value: 'physical_product' },
      { name: 'Private Chat', value: 'private_chat' },
      { name: 'Video Library', value: 'video_library' },
    ],
    description: 'Type of product to enroll the student in',
  },
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['registerAndEnroll'],
      },
    },
    description: 'ID of the product to enroll the student in',
  },

  // ─── register — Additional Fields ────────────────────────────────────────
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['register'],
      },
    },
    options: [
      {
        displayName: 'Phone Country Code',
        name: 'phoneCountryCode',
        type: 'string',
        default: '',
        placeholder: '+1',
        description: 'Country dial code (e.g. +1, +44)',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        description: 'Phone number of the student',
      },
    ],
  },

  // ─── registerAndEnroll — Additional Fields ───────────────────────────────
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['registerAndEnroll'],
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
        displayName: 'Phone Country Code',
        name: 'phoneCountryCode',
        type: 'string',
        default: '',
        placeholder: '+1',
        description: 'Country dial code (e.g. +1, +44)',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        description: 'Phone number of the student',
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

  // ─── authenticate ────────────────────────────────────────────────────────
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['authenticate'],
      },
    },
    description: 'ID of the student to authenticate. Either User ID or Email is required.',
  },
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    default: '',
    placeholder: 'name@email.com',
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['authenticate'],
      },
    },
    description: 'Email of the student to authenticate. Either User ID or Email is required.',
  },

  // ─── authenticate — Additional Fields ────────────────────────────────────
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['student'],
        operation: ['authenticate'],
      },
    },
    options: [
      {
        displayName: 'Redirect URL',
        name: 'redirectUrl',
        type: 'string',
        default: '',
        placeholder: 'https://your-academy.com/dashboard',
        description: 'URL to redirect the student to after authentication',
      },
    ],
  },
];
