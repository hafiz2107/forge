import {
  getAgencyDetails,
  getAuthUserDetails,
  getAuthUserForTeamPage,
} from '@/lib/queries';
import React from 'react';
import DataTable from './_components/data-table';
import { PlusIcon } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { columns } from './_components/columns';

type Props = {
  params: {
    agencyId: string;
  };
};

const TeamPage = async ({ params }: Props) => {
  const authUser = await currentUser();
  const teamMembers = await getAuthUserForTeamPage({
    agencyId: params.agencyId,
  });
  if (!authUser) return null;

  const agencyDetails = await getAgencyDetails({
    agencyId: params.agencyId,
  });

  if (!agencyDetails) return null;

  return (
    <DataTable
      actionButtonText={
        <>
          <PlusIcon size={15} />
          Add
        </>
      }
      modalChildren={<></>}
      filterValue="Name"
      columns={columns}
      data={teamMembers}
    ></DataTable>
  );
};

export default TeamPage;
