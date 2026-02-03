
import { z } from 'zod';
import { insertScanSchema, scans } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  scans: {
    analyze: {
      method: 'POST' as const,
      path: '/api/scans/analyze',
      input: z.object({
        image: z.string()
      }),
      responses: {
        200: z.object({
          objects: z.array(z.string()),
          distances: z.record(z.number()),
          scene: z.string(),
          feedback_text: z.string()
        }),
        500: errorSchemas.internal
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/scans',
      responses: {
        200: z.array(z.custom<typeof scans.$inferSelect>())
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
