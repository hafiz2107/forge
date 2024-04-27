import { z } from 'zod';

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
});
