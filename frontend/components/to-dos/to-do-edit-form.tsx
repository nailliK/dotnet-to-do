'use client';

import { ToDoResponse, ToDoState, ToDoStatus } from '@/types/to-do';

interface ToDoEditFormProps {
  todo: ToDoState;
  onFieldChange: <K extends keyof ToDoState>(field: K, value: ToDoState[K]) => void;
  siblings?: ToDoResponse[];
}

export default function ToDoEditForm({ todo, onFieldChange, siblings }: ToDoEditFormProps) {
  const blocker = siblings?.find(s => s.id === todo.blockedById);
  const isBlocked = !!blocker && blocker.status !== 'Completed';

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      <input
        type="text"
        className="input w-full focus:outline-none"
        placeholder="What do you want to do?"
        value={todo.title}
        onChange={(e) => onFieldChange('title', e.target.value)}
      />
      <textarea
        className="textarea w-full focus:outline-none"
        placeholder="Lorem ipsum dolor sit amet."
        value={todo.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
      />

      <div className="w-full flex gap-4">
        <fieldset className="fieldset grow">
          <legend className="fieldset-legend">Status</legend>
          <select
            className="select select-sm"
            value={todo.status}
            onChange={(e) => onFieldChange('status', e.target.value as ToDoStatus)}
            disabled={isBlocked}
          >
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </fieldset>

        <fieldset className="fieldset grow">
          <legend className="fieldset-legend">Blocked by</legend>
          <select
            className="select select-sm"
            value={todo.blockedById ?? ''}
            onChange={(e) => onFieldChange('blockedById', e.target.value || undefined)}
          >
            <option value="">None</option>
            {siblings?.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </fieldset>
      </div>
    </div>
  );
}
