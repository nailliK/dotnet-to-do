'use client';

import React, {useState} from 'react';
import {ToDoProps, ToDoState} from '@/types/to-do';
import {CheckIcon, EditIcon, TrashIcon} from '@/components/ui/icons';
import ToDoEditForm from '@/components/to-dos/to-do-edit-form';
import ToDoSubTasks from '@/components/to-dos/to-do-sub-tasks';

export default function ToDo({
                               id,
                               title,
                               description,
                               status,
                               sortOrder,
                               blockedById,
                               parentId,
                               siblings,
                               subTasks,
                               onUpdate,
                               onDelete,
                               onAddSubtask,
                             }: ToDoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [todo, setTodo] = useState<ToDoState>({
    title: title ?? '',
    description: description ?? '',
    status: status ?? 'Pending',
    sortOrder: sortOrder ?? 0,
    blockedById: blockedById,
  });

  function updateField<K extends keyof ToDoState>(field: K, value: ToDoState[K]) {
    setTodo(prev => {
      const updated = {...prev, [field]: value};
      if (field === 'blockedById' && value) {
        const blocker = siblings?.find(s => s.id === value);
        if (blocker && blocker.status !== 'Completed') {
          updated.status = 'Pending';
        }
      }
      return updated;
    });
  }

  function handleSave() {
    onUpdate?.(id, {
      title: todo.title,
      description: todo.description,
      status: todo.status,
      sortOrder: todo.sortOrder,
      parentId: parentId,
      blockedById: todo.blockedById,
    });
    setIsEditing(false);
  }

  function toggleEdit() {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  }

  const actionsVisible = isEditing || showActions;

  return (
    <li
      className="list-row grid-cols-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="list-col-grow flex flex-wrap gap-4 w-full">
        <div className="flex justify-between w-full">
          <h2 className="text-lg uppercase font-semibold w-full">{todo.title}</h2>

          <div
            className={`flex gap-1 transition-opacity ${actionsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button className="btn btn-square btn-sm" onClick={toggleEdit} aria-label={isEditing ? 'Save' : 'Edit'}>
              {isEditing ? <CheckIcon/> : <EditIcon/>}
            </button>
            <button className="btn btn-square btn-sm btn-error" onClick={() => onDelete?.(id)} aria-label="Delete">
              <TrashIcon/>
            </button>
          </div>
        </div>

        {isEditing ? (
          <ToDoEditForm todo={todo} onFieldChange={updateField} siblings={siblings}/>
        ) : (
          <p className="text-s">{todo.description}</p>
        )}

        {!parentId && (
          <ToDoSubTasks
            parentId={id}
            subTasks={subTasks}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddSubtask={onAddSubtask}
          />
        )}
      </div>
    </li>
  );
}
