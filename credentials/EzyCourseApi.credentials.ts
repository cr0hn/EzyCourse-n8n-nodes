import {
  ICredentialTestRequest,
  ICredentialType,
  IHttpRequestMethods,
  INodeProperties,
} from 'n8n-workflow';

export class EzyCourseApi implements ICredentialType {
  name = 'ezyCourseApi';
  displayName = 'EzyCourse API';
  documentationUrl = 'https://github.com/cr0hn/n8n-nodes-ezycourse#authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: '',
      placeholder: 'https://your-academy.com',
      required: true,
      description: 'The base URL of your EzyCourse platform. No trailing slash.',
    },
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Access token from your EzyCourse Webhook (Data-In) settings page.',
    },
    {
      displayName: 'Signature Token',
      name: 'signatureToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: false,
      description:
        'Signature token from your EzyCourse Webhook (Data-Out) settings page. Used to verify HMAC-SHA256 signatures on incoming webhooks. Leave empty to skip verification.',
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      method: 'POST' as IHttpRequestMethods,
      url: '={{$credentials.baseUrl}}/api/ezycourse/webhooks/register-student/{{$credentials.accessToken}}',
      body: {},
      // A missing-fields POST returns 422 (valid token) vs 401/403 (invalid token).
      // 422 = Unprocessable Entity means the token was accepted but the empty
      // body failed validation — which confirms the credentials are correct.
    },
    rules: [
      {
        type: 'responseCode' as const,
        properties: {
          value: 422,
          message: 'Credentials are valid (server returned 422 as expected for empty payload)',
        },
      },
    ],
  };
}
