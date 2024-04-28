'use client';

import ContactForm from '@/components/forms/contact-details';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { useModal } from '@/provider/modal-provider';
import React from 'react';

type Props = {
  subaccountId: string;
};

const CreateContactButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal();

  const handleCreateContactButton = () => {
    setOpen(
      <CustomModal
        title="Create or update contact"
        subheading="Contacts are like customers. You can have tickets assigned to a contact"
      >
        <ContactForm subaccountId={subaccountId} />
      </CustomModal>
    );
  };
  return <Button onClick={handleCreateContactButton}>Create contact</Button>;
};

export default CreateContactButton;
