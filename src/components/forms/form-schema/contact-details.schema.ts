import { z } from 'zod';

export const ContactDetailsSchema = z.object({
  name: z.string().min(1, { message: 'Contact name is required' }),
  email: z.string().min(1, {
    message: 'Contact email is required',
  }),
});
