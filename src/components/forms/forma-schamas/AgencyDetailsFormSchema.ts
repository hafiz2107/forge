import { z } from 'zod';

export const AgencyDetailsFormsSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Agency name must be atleast 2 characters' }),
  companyEmail: z
    .string()
    .min(2, { message: 'Comapany email must be atleast 2 characters' }),

  companyPhone: z
    .string()
    .min(7, { message: 'Comapany phone must be atleast 7 characters' }),
  address: z
    .string()
    .min(3, { message: 'Address must be atleast 3 characters' }),

  city: z.string().min(2, { message: 'City must be atleast 3 characters' }),
  zipCode: z
    .string()
    .min(6, { message: 'Zipcode must be atleast 6 characters' }),
  state: z.string().min(2, { message: 'State must be atleast 2 characters' }),
  country: z
    .string()
    .min(2, { message: 'Country must be atleast 2 characters' }),

  goal: z.number().min(1, { message: 'Goal must be atleast 2' }),
  whiteLabel: z.boolean(),
  agencyLogo: z.string().min(1),
});
