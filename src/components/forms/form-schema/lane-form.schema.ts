import { z } from 'zod';

export const LaneFormSchema = z.object({
  name: z.string().min(1, { message: 'Lane name is required' }),
});
