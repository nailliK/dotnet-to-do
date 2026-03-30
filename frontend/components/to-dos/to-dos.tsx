'use client';

import React, { useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import ToDo from '@/components/to-dos/to-do';
import CreateToDoModal from '@/components/to-dos/create-to-do-modal';
import { PlusIcon } from '@/components/ui/icons';
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from '@/hooks/use-todos';
import { CreateToDoRequest, ToDoStatus, UpdateToDoRequest } from '@/types/to-do';

export default function ToDos() {
  const { data: toDos, isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalParentId, setModalParentId] = useState<string | undefined>();
  const [confettiKey, setConfettiKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Set<ToDoStatus>>(new Set());

  function toggleFilter(status: ToDoStatus) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  function openCreateModal(parentId?: string) {
    setModalParentId(parentId);
    modalRef.current?.showModal();
  }

  function handleCreate(data: CreateToDoRequest) {
    const siblings = (toDos ?? []).filter(t => (t.parentId ?? null) === (modalParentId ?? null));
    const maxOrder = siblings.reduce((max, t) => Math.max(max, t.sortOrder), -1);
    createTodo.mutate({ ...data, parentId: modalParentId, sortOrder: maxOrder + 1 }, {
      onSuccess: () => {
        modalRef.current?.close();
        setModalParentId(undefined);
      },
    });
  }

  function handleUpdate(id: string, data: UpdateToDoRequest) {
    if (data.status === 'Completed') {
      setConfettiKey(prev => prev + 1);
    }
    updateTodo.mutate({ id, data });
  }

  function handleDelete(id: string) {
    deleteTodo.mutate(id);
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination || result.source.index === result.destination.index) return;

    const parentId = result.type === 'top-level' ? null : result.type;
    const sorted = (toDos ?? [])
      .filter(t => (t.parentId ?? null) === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const movedId = result.draggableId;
    const reordered = sorted.filter(t => t.id !== movedId);
    const moved = sorted.find(t => t.id === movedId);
    if (!moved) return;

    reordered.splice(result.destination.index, 0, moved);

    reordered.forEach((item, index) => {
      if (item.sortOrder !== index) {
        updateTodo.mutate({ id: item.id, data: { sortOrder: index } });
      }
    });
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  const topLevel = (toDos ?? [])
    .filter(t => !t.parentId)
    .filter(t => activeFilters.size === 0 || activeFilters.has(t.status))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
    <Confetti key={confettiKey} recycle={false} numberOfPieces={confettiKey > 0 ? 300 : 0} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }} />
    <div className="grid grid-cols-1 gap-4 justify-center content-center">
      <form className="flex gap-1 justify-self-center" onReset={() => setActiveFilters(new Set())}>
        {(['Pending', 'InProgress', 'Completed', 'Cancelled'] as ToDoStatus[]).map(status => (
          <input
            key={status}
            className={`btn btn-sm ${activeFilters.has(status) ? 'btn-active' : ''}`}
            type="checkbox"
            aria-label={status === 'InProgress' ? 'In Progress' : status}
            checked={activeFilters.has(status)}
            onChange={() => toggleFilter(status)}
          />
        ))}
        <input className="btn btn-sm btn-square" type="reset" value="×" aria-label="Clear filters"/>
      </form>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="top-level" type="top-level">
          {(provided) => (
            <ul
              className="list bg-base-100 rounded-box shadow-md w-96 pt-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {topLevel.length > 0 ? topLevel.map((toDo, index) => (
                <Draggable key={toDo.id} draggableId={toDo.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'opacity-75' : ''}
                    >
                      <ToDo
                        id={toDo.id}
                        title={toDo.title}
                        description={toDo.description}
                        status={toDo.status}
                        sortOrder={toDo.sortOrder}
                        blockedById={toDo.blockedById}
                        siblings={topLevel.filter(t => t.id !== toDo.id)}
                        subTasks={(toDos ?? []).filter(t => t.parentId === toDo.id).sort((a, b) => a.sortOrder - b.sortOrder)}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onAddSubtask={openCreateModal}
                      />
                    </div>
                  )}
                </Draggable>
              )) : (
                <li className="p-8 text-center text-xl font-semibold">Add some tasks.</li>
              )}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <button
        className="btn btn-primary btn-circle justify-self-center"
        onClick={() => openCreateModal()}
        aria-label="Add task"
      >
        <PlusIcon/>
      </button>

      <CreateToDoModal
        ref={modalRef}
        onSave={handleCreate}
        isLoading={createTodo.isPending}
        isSubtask={!!modalParentId}
      />
    </div>
    </>
  );
}
