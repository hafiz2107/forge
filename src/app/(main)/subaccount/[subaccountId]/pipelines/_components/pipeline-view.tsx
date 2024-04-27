'use client';

import React, { useEffect, useState } from 'react';
import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketAndTags,
} from '@/lib/types';
import { useModal } from '@/provider/modal-provider';
import { Lane, Ticket } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Flag, Kanban, Plus } from 'lucide-react';
import CustomModal from '@/components/global/custom-modal';
import LaneForm from '@/components/forms/lane-form';
import PipelineLane from './pipeline-lane';

type Props = {
  lanes: LaneDetail[];
  pipelineId: string;
  subaccountId: string;
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets;
  updateLanesOrder: (lanes: Lane[]) => Promise<void>;
  updateTicketOrder: (tickets: Ticket[]) => Promise<void>;
};

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subaccountId,
  updateLanesOrder,
  updateTicketOrder,
}: Props) => {
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([]);

  const router = useRouter();
  const { setOpen } = useModal();

  useEffect(() => {
    setAllLanes(lanes);
  }, [lanes]);

  const ticketsFromAllLanes: TicketAndTags[] = [];

  lanes.forEach((item) =>
    item.Tickets.forEach((elem) => ticketsFromAllLanes.push(elem))
  );

  const [allTickets, setAllTickets] =
    useState<TicketAndTags[]>(ticketsFromAllLanes);

  const addLane = () => {
    setOpen(
      <CustomModal
        title="Create new lane"
        subheading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    );
  };
  return (
    <DragDropContext onDragEnd={() => {}}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails?.name}</h1>
          <Button className="flex gap-2" onClick={addLane}>
            <Plus size={15} />
            Create lane
          </Button>
        </div>
        <Droppable
          droppableId="lanes"
          type="lane"
          direction="horizontal"
          key={'lanes'}
        >
          {(provided) => (
            <div
              className="flex items-center gap-x-2 overflow-scroll"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex mt-4">
                {allLanes.map((lane, index) => (
                  <PipelineLane
                    allTickets={allTickets}
                    setAllTickets={setAllTickets}
                    subaccountId={subaccountId}
                    pipelineId={pipelineId}
                    tickets={lane.Tickets}
                    laneDetails={lane}
                    index={index}
                    key={lane.id}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
        {allLanes.length === 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <div className="opacity-100">
              <Kanban width="100%" height="100%" className='opacity-5'/>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default PipelineView;
