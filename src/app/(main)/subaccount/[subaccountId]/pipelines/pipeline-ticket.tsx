import TicketForm from '@/components/forms/ticket-form';
import CustomModal from '@/components/global/custom-modal';
import TagComponent from '@/components/global/tag';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { toast } from '@/components/ui/use-toast';
import { deleteTicket, saveActivityLogsNotification } from '@/lib/queries';
import { TicketWithTags } from '@/lib/types';
import { useModal } from '@/provider/modal-provider';
import {
  Contact2,
  Edit,
  LinkIcon,
  MoreHorizontal,
  Trash,
  User2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { Dispatch, SetStateAction } from 'react';
import { Draggable } from 'react-beautiful-dnd';

type Props = {
  setAllTickets: Dispatch<SetStateAction<TicketWithTags>>;
  allTickets: TicketWithTags;
  ticket: TicketWithTags[0];
  subaccountId: string;
  key: string;
  index: number;
};

const PipelineTicket = ({
  allTickets,
  index,
  key,
  setAllTickets,
  subaccountId,
  ticket,
}: Props) => {
  const { setOpen, data } = useModal();
  const router = useRouter();

  const editNewTicket = async (ticket: TicketWithTags[0]) => {
    setAllTickets((tickets) =>
      allTickets.map((t) => (t.id === ticket.id ? ticket : t))
    );
  };

  const handleDeleteTicket = async () => {
    try {
      setAllTickets((tickets) => tickets.filter((t) => t.id !== ticket.id));

      const response = await deleteTicket(ticket.id);
      toast({
        title: 'Deleted',
        description: 'The ticket have been removed from lane',
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a ticket | ${response.name}`,
        subAccountId: subaccountId,
      });
      router.refresh();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Oops',
        description: 'Could not delete the ticket',
      });
      console.log('Pipeline ticket -> ', err);
    }
  };

  const handleClickEditTicket = async () => {
    setOpen(
      <CustomModal title={'Update ticket details'} subheading="">
        <TicketForm
          getNewTicket={editNewTicket}
          laneId={ticket.laneId}
          subaccountId={subaccountId}
        />
      </CustomModal>,
      async () => {
        return { ticket: ticket };
      }
    );
  };
  return (
    <Draggable draggableId={ticket.id.toString()} index={index}>
      {(provided, snapshot) => {
        if (snapshot.isDragging) {
          const offset = { x: 300, y: 20 };
          //   @ts-ignore
          const x = provided.draggableProps.style.left - offset.x;
          //   @ts-ignore
          const y = provided.draggableProps.style.top - offset.y;

          //   @ts-ignore
          provided.draggableProps.style = {
            ...provided.draggableProps.style,
            top: y,
            left: x,
          };
        }

        return (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <AlertDialog>
              <DropdownMenu>
                <Card className="my-4 dark:bg-slate-900 bg-white shadow-none transition-all">
                  <CardHeader className="p-[12px]">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg w-full">{ticket.name}</span>
                      <DropdownMenuTrigger>
                        <MoreHorizontal className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                    </CardTitle>
                    <span className="text-muted-foreground text-xs">
                      {new Date().toLocaleDateString()}
                    </span>
                    <div className="flex items-center flex-wrap gap-2">
                      {ticket.Tags.map((tag) => (
                        <TagComponent
                          key={tag.id}
                          title={tag.name}
                          colorName={tag.color}
                        />
                      ))}
                    </div>
                    <CardDescription className="w-full">
                      {ticket.description}
                    </CardDescription>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="p-2 text-mute flex gap-2 hover:bg-muted transition-all rounded-lg cursor-pointer items-center">
                          <LinkIcon />
                          <span className="text-xs font-bold">Contact</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-fit" side="right">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage />
                            <AvatarFallback className="bg-primary">
                              {ticket.Customer?.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">
                              {ticket.Customer?.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {ticket.Customer?.email}
                            </p>
                            <div className="flex items-center pt-2">
                              <Contact2 className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-xs text-muted-foreground">
                                Joined{' '}
                                {ticket.Customer?.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </CardHeader>

                  <CardFooter className="m-0 p-2 border-t-[1px] border-muted-foreground/20 flex items-center justify-between">
                    <div className="flex item-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          alt="contact"
                          src={ticket.Assigned?.avatarUrl}
                        />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          {ticket.Assigned?.name}
                          {!ticket.assignedUserId && <User2 size={14} />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col justify-center">
                        <span className="text-sm text-muted-foreground">
                          {ticket.assignedUserId ? 'Assigned to' : 'Unassigned'}
                        </span>
                        {ticket.assignedUserId && (
                          <span className="text-xs w-28  overflow-ellipsis overflow-hidden whitespace-nowrap text-muted-foreground">
                            {ticket.Assigned?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      {!!ticket.value &&
                        new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: 'USD',
                        }).format(+ticket.value)}
                    </span>
                  </CardFooter>

                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size={15} />
                        Delete Ticket
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleClickEditTicket}
                    >
                      <Edit size={15} />
                      Edit Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </Card>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the ticket and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTicket}
                      className="bg-destructive"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </DropdownMenu>
            </AlertDialog>
          </div>
        );
      }}
    </Draggable>
  );
};

export default PipelineTicket;
