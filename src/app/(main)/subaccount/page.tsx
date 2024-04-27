import Unauthorized from '@/components/unauthorized';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  searchParams: {
    state: string; //Subaccount id that we are going to redirect (From stripe)
    code: string; //For auth
  };
};

const SubAccountMainPage = async ({ searchParams }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return <Unauthorized />;
  }

  const user = await getAuthUserDetails();
  const firstSubaccountWithAccess = user?.Permissions.find(
    (permission) => permission.access === true
  );


  if (searchParams.state) {
    const statePath = searchParams.state.split('___')[0];
    const stateSubaccountId = searchParams.state.split('___')[1];

    if (!stateSubaccountId) return <Unauthorized />;

    return redirect(
      `/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`
    );
  }

  if (firstSubaccountWithAccess)
    return redirect(`/subaccount/${firstSubaccountWithAccess.subAccountId}`);

  return <Unauthorized />;
};

export default SubAccountMainPage;
