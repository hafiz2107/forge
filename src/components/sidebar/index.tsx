import { getAuthUserDetails } from '@/lib/queries';
import React from 'react';
import MenuOptions from './menu-options';

type Props = {
  id: string;
  type: 'agency' | 'subaccount';
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();

  if (!user) return null;

  if (!user.Agency) return;
  let subaccount;
  if (type === 'subaccount')
    subaccount = user?.Agency.SubAccount.find((subac) => subac.id === id);
  const details = type === 'agency' ? user?.Agency : subaccount;

  const isWhiteLabeldAgency = user.Agency.whiteLabel;

  if (!details) return;

  let sidebarLogo = user.Agency.agencyLogo || '/assets/forge-logo.svg';

  if (!isWhiteLabeldAgency) {
    if (type === 'subaccount') {
      sidebarLogo =
        user.Agency.SubAccount.find((subAc) => subAc.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sideBarOpt =
    type === 'agency'
      ? user.Agency.SidebarOption || []
      : subaccount?.SidebarOption || [];

  const subaccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpened
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        subAccounts={subaccounts}
        sidebarOpt={sideBarOpt}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        subAccounts={subaccounts}
        sidebarOpt={sideBarOpt}
        user={user}
      />
    </>
  );
};
export default Sidebar;
