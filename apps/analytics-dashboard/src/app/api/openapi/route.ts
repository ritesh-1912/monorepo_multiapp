/**
 * GET /api/openapi — OpenAPI 3.0 spec for the public metrics API.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Analytics API',
    version: '1.0.0',
    description: 'Public metrics API. Use an API key in Authorization header.',
  },
  servers: [{ url: '/api/v1', description: 'Current' }],
  paths: {
    '/metrics': {
      get: {
        summary: 'Get metrics',
        description:
          'Returns aggregated metrics and KPIs for the given date range. Requires API key.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'from',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Start date (YYYY-MM-DD)',
          },
          {
            name: 'to',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'End date (YYYY-MM-DD)',
          },
          {
            name: 'metric',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['revenue', 'signups', 'page_views'] },
            description: 'Filter by metric',
          },
        ],
        responses: {
          200: {
            description: 'Metrics and aggregated data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    from: { type: 'string' },
                    to: { type: 'string' },
                    metric: { type: 'string' },
                    kpis: {
                      type: 'object',
                      properties: { total: { type: 'integer' }, count: { type: 'integer' } },
                    },
                    data: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          401: { description: 'Missing or invalid API key' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'API Key' },
    },
  },
};

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3002';
  const fullSpec = {
    ...spec,
    servers: [{ url: `${baseUrl}/api/v1`, description: 'Current' }],
  };
  return NextResponse.json(fullSpec);
}
