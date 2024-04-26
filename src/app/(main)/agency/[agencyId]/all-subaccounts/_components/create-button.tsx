'use client';

import SubAccountDetails from '@/components/forms/subaccount-details';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { useModal } from '@/provider/modal-provider';
import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  user: User & {
    Agency:
      | Agency
      | (null & {
          SubAccount: SubAccount[];
          SideBarOption: AgencySidebarOption[];
        })
      | null;
  };
  id: string;
  className: string;
};

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user.Agency;

  if (!agencyDetails) return;

  const handleClick = async () => {
    setOpen(
      <CustomModal
        title="Create a subaccont"
        subheading="You can switch between sub accounts"
      >
        <SubAccountDetails
          agencyDetails={agencyDetails}
          userId={user.id}
          userName={user.name}
        />
      </CustomModal>
    );
  };

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={handleClick}
    >
      <PlusCircle size={15} /> Create Subaccount
    </Button>
  );
};

export default CreateSubaccountButton;
