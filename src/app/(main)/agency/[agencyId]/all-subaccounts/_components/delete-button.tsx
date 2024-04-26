'use client';

import {
  deleteSubAccountAction,
  getSubaccountDetails,
  saveActivityLogsNotification,
} from '@/lib/queries';
import { useRouter } from 'next/navigation';
import React from 'react';

type Props = {
  subaccountId: string;
};

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter();

  const handleClick = async () => {
    const response = await getSubaccountDetails(subaccountId);
    if (!response) return;

    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Deleted a subaccount | ${response.name}`,
      subAccountId: subaccountId,
    });
    await deleteSubAccountAction(subaccountId);
    router.refresh();
  };

  return <div onClick={handleClick}>Delete sub account</div>;
};

export default DeleteButton;
