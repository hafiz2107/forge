import AgencyDetails from '@/components/forms/agency-details';
import UserDetails from '@/components/forms/user-details';
import { getAgencyDetails, getUserDetailsWithEmail } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server';
import React from 'react';

type Props = {
  params: {
    agencyId: string;
  };
};

const Page = async ({ params }: Props) => {
  const authUer = await currentUser();
  if (!authUer) return null;

  const userDetails = await getUserDetailsWithEmail(
    authUer.emailAddresses[0].emailAddress
  );

  if (!userDetails) return null;

  const agencyDetails = await getAgencyDetails({
    agencyId: params.agencyId,
  });

  if (!agencyDetails) return null;
  const subAccounts = agencyDetails.SubAccount;

  return (
    <div className="flex !lg:flex-row flex-col gap-4">
      <AgencyDetails data={agencyDetails} />
      <UserDetails
        type="agency"
        id={params.agencyId}
        subAccounts={subAccounts}
        userData={userDetails}
      />
    </div>
  );
};

export default Page;
