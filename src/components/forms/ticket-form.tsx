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
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { TicketFormSchema } from './form-schema/ticket-form';
import { toast } from '../ui/use-toast';

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

  return <div>TicketForm</div>;
};

export default TicketForm;
