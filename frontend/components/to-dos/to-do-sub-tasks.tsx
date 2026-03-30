'use client';

import {Draggable, Droppable} from '@hello-pangea/dnd';
import ToDo from '@/components/to-dos/to-do';
import {PlusIcon} from '@/components/ui/icons';
import {ToDoResponse, UpdateToDoRequest} from '@/types/to-do';

interface ToDoSubTasksProps {
  parentId: string;
  subTasks?: ToDoResponse[];
  onUpdate?: (id: string, data: UpdateToDoRequest) => void;
  onDelete?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
}

export default function ToDoSubTasks({parentId, subTasks, onUpdate, onDelete, onAddSubtask}: ToDoSubTasksProps) {
  return (
    <details className="collapse collapse-arrow border border-base-300">
      <summary className="collapse-title font-semibold">
        Sub-Tasks {subTasks && subTasks.length > 0 && `(${subTasks.length})`}
      </summary>
      <div className="collapse-content">
        <Droppable droppableId={`subtasks-${parentId}`} type={parentId}>
          {(provided) => (
            <ul
              className="list bg-base-200/50 rounded-box"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {subTasks?.map((sub, index) => (
                <Draggable key={sub.id} draggableId={sub.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'opacity-75' : ''}
                    >
                      <ToDo
                        id={sub.id}
                        parentId={parentId}
                        title={sub.title}
                        description={sub.description}
                        status={sub.status}
                        sortOrder={sub.sortOrder}
                        blockedById={sub.blockedById}
                        siblings={subTasks?.filter(s => s.id !== sub.id)}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
        <button
          className="btn btn-sm btn-ghost btn-circle mt-2"
          onClick={() => onAddSubtask?.(parentId)}
          aria-label="Add sub-task"
        >
          <PlusIcon className="size-[1em]"/>
        </button>
      </div>
    </details>
  );
}
