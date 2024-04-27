'use client';

import React from 'react';
import { z } from 'zod';
import UploadMediaSchema from './form-schema/upload-media.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createMedia, saveActivityLogsNotification } from '@/lib/queries';
import { Input } from '../ui/input';
import FileUpload from '../global/file-upload';
import { Button } from '../ui/button';
import { useModal } from '@/provider/modal-provider';

type Props = {
  subaccountId: string;
};

const UploadMediaForm = ({ subaccountId }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<z.infer<typeof UploadMediaSchema>>({
    mode: 'onSubmit',
    defaultValues: {
      link: '',
      name: '',
    },
    resolver: zodResolver(UploadMediaSchema),
  });

  const onSubmit = async (values: z.infer<typeof UploadMediaSchema>) => {
    try {
      const response = await createMedia(subaccountId, values);
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Uploaded a media file | ${response.name}`,
        subAccountId: subaccountId,
      });

      toast({
        title: 'Success',
        description: 'Uploaded a media file',
      });
      router.refresh();
      setClose();
    } catch (err) {
      toast({
        title: 'Oops',
        description: 'Failed to upload media',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media information</CardTitle>
        <CardDescription>Please enter the details of your file</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your file name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media File</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndPoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4">
              Upload Media
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadMediaForm;
