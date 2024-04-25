'use server';

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { db } from './db';
import { redirect } from 'next/navigation';
import { Agency, Plan, User } from '@prisma/client';
import { defaultSideBarProps } from './constants';

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subAccountId,
}: {
  agencyId?: string;
  description: string;
  subAccountId?: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: { some: { id: subAccountId } },
        },
      },
    });

    if (response) userData = response;
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) {
    console.log('Could not find an user');
    return null;
  }

  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subAccountId)
      throw new Error(
        'You need to provide atleast an agency id or subaccount id'
      );
    const response = await db.subAccount.findUnique({
      where: { id: subAccountId },
    });
    if (response) foundAgencyId = response.agencyId;
  }

  if (subAccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: {
            id: subAccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

export const getAuthUserDetails = async () => {
  try {
    const user = await currentUser();

    if (!user) return redirect('/sign-in');

    const userData = await db.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
      include: {
        Agency: {
          include: {
            SidebarOption: true,
            SubAccount: {
              include: {
                SidebarOption: true,
              },
            },
          },
        },
        Permissions: true,
      },
    });

    return userData;
  } catch (err) {
    return null;
  }
};

const createTeamUser = async (agencyId: string, user: User) => {
  try {
    if (user.role === 'AGENCY_OWNER') return null;

    const response = await db.user.create({
      data: { ...user },
    });

    if (!response) return null;
    return response;
  } catch (err) {
    return null;
  }
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();

  if (!user) return redirect('/sign-in');

  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING',
    },
  });

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: 'Joined',
      subAccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'SUBACCOUNT_USER',
        },
      });

      await db.invitation.delete({
        where: {
          email: userDetails.email,
        },
      });

      userDetails.agencyId;
    } else {
      return null;
    }
  } else {
    const agency = await db.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
    });

    return agency ? agency.agencyId : null;
  }
};

export const updateAgencyDetails = async ({
  agencyId,
  agencyDetails,
}: {
  agencyId: string;
  agencyDetails: Partial<Agency>;
}) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: {
      ...agencyDetails,
    },
  });

  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: {
      id: agencyId,
    },
  });

  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) return;
  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,

      role: newUser.role || 'SUBACCOUNT_USER',
    },
  });

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'SUBACCOUNT_USER',
    },
  });

  return userData;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  try {
    if (!agency.companyEmail) return null;

    const agencyDetail = await db.agency.upsert({
      where: { id: agency.id },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        SidebarOption: {
          create: defaultSideBarProps(agency.id),
        },
      },
    });

    return agencyDetail;
  } catch (err) {
    console.log('Query upsertAgency -> ', err);
  }
};

export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId: agencyId },
      include: {
        User: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return response;
  } catch (err) {
    console.log('Query getNotificationAndUser -> ', err);
    return null;
  }
};
