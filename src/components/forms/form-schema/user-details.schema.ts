import { z } from 'zod';

export const userDataSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string(),
  role: z.enum([
    'AGENCY_OWNER',
    'AGENCY_ADMIN',
    'SUBACCOUNT_USER',
    'SUBACCOUNT_GUEST',
  ]),
});
