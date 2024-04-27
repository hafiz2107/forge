'use client';

import { Button } from '@/components/ui/button';
import { useModal } from '@/provider/modal-provider';
import { PlusCircleIcon, PlusIcon } from 'lucide-react';
import React from 'react';
import CustomModal from '../custom-modal';
import UploadMediaForm from '@/components/forms/upload-media';

type Props = {
  subaccountId: string;
};

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal();
  const handleClick = () => {
    setOpen(
      <CustomModal title="Upload media" subheading="Upload any media file">
        <UploadMediaForm subaccountId={subaccountId} />
      </CustomModal>
    );
  };

  return (
    <Button className="flex gap-2" onClick={handleClick}>
      <PlusCircleIcon size={15} />
      Upload
    </Button>
  );
};

export default MediaUploadButton;
