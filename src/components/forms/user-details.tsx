'use client';

import {
  AuthUserWithAgencySidebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from '@/lib/types';
import { useModal } from '@/provider/modal-provider';
import { SubAccount, User } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { toast, useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from '@/lib/queries';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { userDataSchema } from './form-schema/user-details.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import FileUpload from '../global/file-upload';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import Loading from '../global/loading';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { v4 } from 'uuid';

type Props = {
  id: string | null;
  userData?: Partial<User>;
  subAccounts?: SubAccount[];
  type: 'agency' | 'subaccount';
};

const UserDetails = ({ id, type, subAccounts, userData }: Props) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts | null>(null);

  const { data, setClose } = useModal();
  const [roleState, setRoleState] = useState('');
  const [loadingPermission, setLoadingPermission] = useState(false);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsSubAccounts | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails();
        if (response) setAuthUserData(response);
      };
      fetchDetails();
    }
  }, [data]);

  const form = useForm<z.infer<typeof userDataSchema>>({
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data.user?.name,
      email: userData ? userData.email : data.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data.user?.avatarUrl,
      role: userData ? userData.role : data.user?.role,
    },
    resolver: zodResolver(userDataSchema),
  });

  useEffect(() => {
    if (!data.user) return;

    const getPermissions = async () => {
      if (!data.user) return;
      const permission = await getUserPermissions(data.user.id);

      setSubAccountPermissions(permission);
    };
    getPermissions();
  }, [data, form]);

  useEffect(() => {
    if (data.user) {
      form.reset(data.user);
    }
    if (userData) {
      form.reset(userData);
    }
  }, [userData, data]);

  const onChangePermission = async (
    subAccountId: string,
    val: boolean,
    permissionsId: string | undefined
  ) => {
    if (!data.user?.email) return;
    setLoadingPermission(true);
    const response = await changeUserPermissions(
      permissionsId ? permissionsId : v4(),
      data.user.email,
      subAccountId,
      val
    );

    if (type === 'agency')
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Gave ${userData?.name} access to | ${
          subAccountPermissions?.Permissions.find(
            (p) => p.subAccountId === subAccountId
          )?.SubAccount.name
        } `,
        subAccountId: subAccountPermissions?.Permissions.find(
          (p) => p.subAccountId === subAccountId
        )?.SubAccount.id,
      });

    if (response) {
      toast({
        title: 'Success',
        description: 'Successfully added permission to user',
      });
      if (subAccountPermissions) {
        subAccountPermissions.Permissions.find((perm) => {
          if (perm.subAccountId === subAccountId) {
            return { ...perm, access: !perm.access };
          }
          return perm;
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Failed to update permission of user',
      });
    }
    router.refresh();
    setLoadingPermission(false);
  };

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return;
    if (userData || data?.user) {
      const updatedUser = await updateUser(values);
      authUserData?.Agency?.SubAccount.filter((subacc) =>
        authUserData.Permissions.find(
          (p) => p.subAccountId === subacc.id && p.access
        )
      ).forEach(async (subaccount) => {
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Updated ${userData?.name} information`,
          subAccountId: subaccount.id,
        });
      });

      if (updatedUser) {
        toast({
          title: 'Success',
          description: 'Update User Information',
        });
        setClose();
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Oppse!',
          description: 'Could not update user information',
        });
      }
    } else {
      console.log('Error could not submit');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User details</CardTitle>
        <CardDescription className="text-muted-foreground">
          Add or edit your details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndPoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === 'AGENCY_OWNER' ||
                        form.formState.isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-1 flex-col">
                    <FormLabel>User role</FormLabel>
                    <Select
                      disabled={field.value === 'AGENCY_OWNER'}
                      onValueChange={(value) => {
                        if (
                          value === 'SUBACCOUNT_USER' ||
                          value === 'SUBACCOUNT_GUEST'
                        ) {
                          setRoleState(
                            'You need to have subaccounts to assign Subaccount access to team members.'
                          );
                        } else {
                          setRoleState('');
                        }
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AGENCY_ADMIN">
                          Agency Admin
                        </SelectItem>

                        <SelectItem
                          value="AGENCY_OWNER"
                          disabled={
                            data.user?.role === 'AGENCY_OWNER' ||
                            data.user?.role === 'AGENCY_ADMIN'
                          }
                        >
                          Agency Owner
                        </SelectItem>

                        <SelectItem value="SUBACCOUNT_USER">
                          Sub Account User
                        </SelectItem>
                        <SelectItem value="SUBACCOUNT_GUEST">
                          Sub Account Guest
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground">{roleState}</p>
                  </FormItem>
                );
              }}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loading /> : 'Save user'}
            </Button>
            {authUserData?.role === 'AGENCY_OWNER' && (
              <div>
                <Separator className="my-4" />
                <FormLabel>User permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team member by turning on
                  access control for each Sub Account. This is only visible to
                  agency owners
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAc) => {
                    const subAccountPermissionDetails =
                      subAccountPermissions?.Permissions.find(
                        (per) => per.subAccountId === subAc.id
                      );

                    return (
                      <div
                        key={subAc.id}
                        className="flex flex-col items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAc.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermission}
                          checked={subAccountPermissionDetails?.access}
                          onCheckedChange={(permission) =>
                            onChangePermission(
                              subAc.id,
                              permission,
                              subAccountPermissionDetails?.id
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
