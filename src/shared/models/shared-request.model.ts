import z from 'zod';

export const EmptyBodySchema = z.object({}).strict().default({});

export type EmptyBodyType = z.infer<typeof EmptyBodySchema>;
