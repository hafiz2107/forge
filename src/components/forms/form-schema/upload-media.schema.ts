import { z } from 'zod';

const UploadMediaSchema = z.object({
  link: z.string().min(1, { message: 'Media file is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
});

export default UploadMediaSchema;
