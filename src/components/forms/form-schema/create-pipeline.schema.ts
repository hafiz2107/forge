import { z } from 'zod';

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1, { message: 'Pipeline name is required' }),
});
