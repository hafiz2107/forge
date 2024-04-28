'use client';

import {
  getSubaccountTeamMembers,
  saveActivityLogsNotification,
  searchContacts,
  upsertTicket,
} from '@/lib/queries';
import { TicketWithTags } from '@/lib/types';
import { useModal } from '@/provider/modal-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { Contact, Tag, User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React, { HtmlHTMLAttributes, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { TicketFormSchema } from './form-schema/ticket-form';
import { toast } from '../ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CheckIcon, ChevronsUpDown, User2 } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Loading from '../global/loading';
import TagCreator from '../global/tag-creator';

type Props = {
  getNewTicket: (ticket: TicketWithTags[0]) => void;
  laneId: string;
  subaccountId: string;
};

const TicketForm = ({ getNewTicket, laneId, subaccountId }: Props) => {
  const { data: defaultData, setClose } = useModal();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [contact, setContact] = useState('');
  const [search, setSearch] = useState('');
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<User[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [assignedTo, setAssignedTo] = useState(
    defaultData.ticket?.Assigned?.id || ''
  );

  const form = useForm<z.infer<typeof TicketFormSchema>>({
    defaultValues: {
      description: defaultData.ticket?.description || '',
      name: defaultData.ticket?.name || '',
      value: String(defaultData.ticket?.value || 0),
    },
    mode: 'onChange',
    resolver: zodResolver(TicketFormSchema),
  });

  const isLoading = form.formState.isLoading;

  useEffect(() => {
    if (subaccountId) {
      const fetchData = async () => {
        const response = await getSubaccountTeamMembers(subaccountId);
        if (response) setAllTeamMembers(response);
      };
      fetchData();
    }
  }, [subaccountId]);

  useEffect(() => {
    if (defaultData.ticket) {
      form.reset({
        name: defaultData.ticket.name || '',
        description: defaultData.ticket.description || '',
        value: String(defaultData.ticket.value || 0),
      });

      if (defaultData.ticket.customerId)
        setContact(defaultData.ticket.customerId);

      const fetchData = async () => {
        const response = await searchContacts(
          defaultData.ticket?.Customer?.name as string
        );

        setContactList(response);
      };
      fetchData();
    }
  }, [defaultData]);

  const onSubmit = async (values: z.infer<typeof TicketFormSchema>) => {
    if (!laneId) return;
    try {
      const response = await upsertTicket(
        {
          ...values,
          laneId,
          id: defaultData.ticket?.id,
          assignedUserId: assignedTo,
          ...(contact ? { customerId: contact } : {}),
        },
        tags
      );

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a ticket | ${response?.name}`,
        subAccountId: subaccountId,
      });

      toast({
        title: 'Success',
        description: 'Saved  details',
      });
      if (response) getNewTicket(response);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: 'Could not save pipeline details',
      });
    }
    setClose();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
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
                <FormItem>
                  <FormLabel>Ticket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3>Add tags</h3>

            <TagCreator
              subAccountId={subaccountId}
              getSelectedTags={setTags}
              defaultTags={defaultData.ticket?.Tags || []}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormLabel>Assigned to team member</FormLabel>
            <Select onValueChange={setAssignedTo} defaultValue={assignedTo}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        Not Assigned
                      </span>
                    </div>
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allTeamMembers.map((teamMember) => (
                  <SelectItem key={teamMember.id} value={teamMember.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" src={teamMember.avatarUrl} />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        {teamMember.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FormLabel>Customer</FormLabel>
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between"
                >
                  {contact
                    ? contactList.find((c) => c.id === contact)?.name
                    : 'Select Customer'}

                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search customer..."
                    className="h-9"
                    value={search}
                    onChangeCapture={async (value) => {
                      // @ts-ignore
                      setSearch(value.target.value);

                      if (saveTimerRef.current)
                        clearTimeout(saveTimerRef.current);

                      saveTimerRef.current = setTimeout(async () => {
                        const response = await searchContacts(
                          // @ts-ignore
                          value.target.value
                        );

                        setContactList(response);
                        setSearch('');
                      }, 1000);
                    }}
                  />

                  <CommandList>
                    <CommandGroup>
                      <CommandEmpty>No results found.</CommandEmpty>
                      {contactList.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.id}
                          onSelect={(currentValue) =>
                            setContact(
                              currentValue === contact ? '' : currentValue
                            )
                          }
                        >
                          {c.name}
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              contact === c.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              className="w-20 mt-4 flex gap-2"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isLoading && <Loading />} Save
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;
