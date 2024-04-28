'use server';

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { db } from './db';
import { redirect } from 'next/navigation';
import {
  Agency,
  Lane,
  Plan,
  Prisma,
  Role,
  SubAccount,
  Tag,
  Ticket,
  User,
} from '@prisma/client';
import {
  defaultAgencySideBarProps,
  defaultSubAccountSidebarProps,
} from './constants';
import { v4 } from 'uuid';
import { CreateMediaType } from './types';
import { string, z } from 'zod';
import { CreateFunnelFormSchema } from '@/components/forms/form-schema/create-funnel.schema';

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

const createTeamUser = async (agencyId: string, user: User) => {
  try {
    console.log('TTTTTT-> ', user);
    if (user.role === 'AGENCY_OWNER') return null;

    const response = await db.user.create({
      data: { ...user },
    });

    console.log('The response is -------> ', response);
    if (!response) return null;
    return response;
  } catch (err) {
    console.log('Error -> ', err);
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
    console.log('@@@IFF');
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

    console.log('The user details are -> ', userDetails);
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

      return userDetails.agencyId;
    } else {
      return null;
    }
  } else {
    const agency = await db.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
    });

    console.log('On verifyAndAcceptInvitation ELSE -> ', agency);

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
          create: defaultAgencySideBarProps(agency.id),
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

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;

  const agencyOwner = await db.user.findFirst({
    where: { Agency: { id: subAccount.agencyId }, role: 'AGENCY_OWNER' },
  });

  if (!agencyOwner) {
    return console.log('Queries/upsertSubAccount -> There is no agency owner');
  }

  const permissionId = v4();
  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner?.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: {
          name: 'Lead Cycle',
        },
      },
      SidebarOption: {
        create: defaultSubAccountSidebarProps(subAccount.id),
      },
    },
  });

  if (response)
    // TODO Solution for Challenge 1
    await clerkClient.users.updateUserMetadata(agencyOwner.id, {
      privateMetadata: {
        subAccount: response.id,
      },
    });

  return response;
};

export const getUserDetailsWithEmail = async (email: string) => {
  const userDetails = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  return userDetails;
};

export const getAgencyDetails = async ({ agencyId }: { agencyId: string }) => {
  const agencyDetails = await db.agency.findUnique({
    where: {
      id: agencyId,
    },
    include: {
      SubAccount: true,
    },
  });

  return agencyDetails;
};

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  });

  return response;
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

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  });

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || 'SUBACCOUNT_USER',
    },
  });

  return response;
};

export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: {
        id: permissionId,
      },
      update: {
        access: permission,
      },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    });

    return response;
  } catch (err) {
    console.log('queries/changeUserPermissions -> ', err);
    return null;
  }
};

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  });
  return response;
};
export const deleteSubAccountAction = async (subAccountId: string) => {
  return await db.subAccount.delete({
    where: {
      id: subAccountId,
    },
  });
};

export const getAuthUserForTeamPage = async ({
  agencyId,
}: {
  agencyId: string;
}) => {
  const authUser = await db.user.findMany({
    where: {
      Agency: {
        id: agencyId,
      },
    },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });

  return authUser;
};

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
};

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  const response = await db.invitation.create({
    data: { email, agencyId, role },
  });

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return response;
};

export const getMedia = async (subaccountId: string) => {
  const medias = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    include: {
      Media: true,
    },
  });

  return medias;
};

export const createMedia = async (
  subaccountId: string,
  mediaFile: CreateMediaType
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const deleteMedia = async (fileId: string) => {
  const response = await db.media.delete({
    where: {
      id: fileId,
    },
  });

  return response;
};

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findFirst({
    where: {
      id: pipelineId,
    },
  });

  return response;
};

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId: pipelineId,
    },
    orderBy: {
      order: 'asc',
    },
    include: {
      Tickets: {
        orderBy: {
          order: 'asc',
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  });

  return response;
};

export const upsertFunnel = async (
  subaccountId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProduct: string },
  funnelId: string
) => {
  const response = await db.funnel.upsert({
    where: {
      id: funnelId,
    },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
    where: {
      id: pipeline.id || v4(),
    },
    update: pipeline,
    create: pipeline,
  });
  return response;
};

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: {
      id: pipelineId,
    },
  });

  return response;
};

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTransactions = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      })
    );

    await db.$transaction(updateTransactions);
    console.log('✅ Done reorder');
  } catch (err) {
    console.log('queries/updateLanesOrder -> ', err);
  }
};

export const updateTicketOrder = async (tickets: Ticket[]) => {
  try {
    const updateTransactions = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    );

    await db.$transaction(updateTransactions);
    console.log('✅ Done tickets reorder');
  } catch (err) {
    console.log('queries/updateTicketOrder -> ', err);
  }
};

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number;
  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        id: lane.pipelineId,
      },
    });

    order = lanes.length;
  } else {
    order = lane.order;
  }

  const response = await db.lane.upsert({
    where: {
      id: lane.id || v4(),
    },
    update: lane,
    create: { ...lane, order },
  });

  return response;
};

export const deleteLane = async (laneId: string) => {
  const response = await db.lane.delete({
    where: {
      id: laneId,
    },
  });

  return response;
};

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId: pipelineId,
      },
    },
    include: {
      Tags: true,
      Assigned: true,
      Customer: true,
    },
  });

  return response;
};

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const res = await db.ticket.findMany({
    where: {
      laneId: laneId,
    },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  });
  return res;
};

export const getSubaccountTeamMembers = async (subaccountId: string) => {
  const subAccountUsersWithAccess = await db.user.findMany({
    where: {
      role: 'SUBACCOUNT_USER',
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
      Agency: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
    },
  });

  return subAccountUsersWithAccess;
};

export const searchContacts = async (searchTerm: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerm,
      },
    },
  });
  return response;
};

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number;
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: {
        laneId: ticket.laneId,
      },
    });

    order = tickets.length;
  } else {
    order = ticket.order;
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  });

  return response;
};

export const deleteTicket = async (ticketId: string) => {
  const res = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  return res;
};

export const deleteTag = async (tagId: string) => {
  const res = await db.tag.delete({
    where: {
      id: tagId,
    },
  });

  return res;
};

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const res = await db.tag.upsert({
    where: {
      id: tag.id || v4(),
      subAccountId: subaccountId,
    },
    create: { ...tag, subAccountId: subaccountId },
    update: tag,
  });

  return res;
};

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    select: {
      Tags: true,
    },
  });

  return response;
};

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: {
      id: contact.id || v4(),
    },
    create: contact,
    update: contact,
  });

  return response;
};
