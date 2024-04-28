import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ContactDetailsSchema } from './form-schema/contact-details.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { useModal } from '@/provider/modal-provider';
import { saveActivityLogsNotification, upsertContact } from '@/lib/queries';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import Loading from '../global/loading';

type Props = {
  subaccountId: string;
};

const ContactForm = ({ subaccountId }: Props) => {
  const { setClose, data } = useModal();

  const form = useForm<z.infer<typeof ContactDetailsSchema>>({
    mode: 'onChange',
    defaultValues: {
      name: data.contact?.name || '',
      email: data.contact?.email || '',
    },
    resolver: zodResolver(ContactDetailsSchema),
  });

  useEffect(() => {
    if (data.contact) {
      form.reset(data.contact);
    }
  }, [data, form.reset]);
  const router = useRouter();
  const isLoading = form.formState.isLoading;
  const onSubmit = async (values: z.infer<typeof ContactDetailsSchema>) => {
    try {
      const response = await upsertContact({
        email: values.email,
        name: values.name,
        subAccountId: subaccountId,
      });

      await saveActivityLogsNotification({
        description: `Updated a contact | ${response.name}`,
        subAccountId: subaccountId,
        agencyId: undefined,
      });

      toast({
        title: 'Success',
        description: 'Successfully added contact',
      });
      setClose();
      router.refresh();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ooops !',
        description: 'Something went wrong',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
        <CardDescription>Please fill in the contact details</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Contact name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Contact Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Contact email</FormLabel>
                  <FormControl>
                    <Input
                      required
                      type="email"
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting && <Loading />} Save contact details
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
