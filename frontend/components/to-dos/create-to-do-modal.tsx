'use client';

import React, {useState} from 'react';
import {CreateToDoRequest} from '@/types/to-do';

interface CreateToDoModalProps {
  onSave: (data: CreateToDoRequest) => void;
  isLoading: boolean;
  isSubtask: boolean;
}

const CreateToDoModal = React.forwardRef<HTMLDialogElement, CreateToDoModalProps>(
  function CreateToDoModal({onSave, isLoading, isSubtask}, ref) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (title.trim()) {
        onSave({
          title: title.trim(),
          description: description.trim() || undefined,
        });
        setTitle('');
        setDescription('');
      }
    }

    return (
      <dialog ref={ref} className="modal" aria-labelledby="create-todo-title">
        <div className="modal-box">
          <h3 id="create-todo-title" className="font-bold text-lg">
            {isSubtask ? 'New Sub-Task' : 'New Task'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-control mt-4">
              <label className="label" htmlFor="create-todo-input">
                <span className="label-text">Title</span>
              </label>
              <input
                id="create-todo-input"
                type="text"
                className="input input-bordered w-full"
                placeholder="What do you want to do?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-2">
              <label className="label" htmlFor="create-todo-description">
                <span className="label-text">Description</span>
              </label>
              <textarea
                id="create-todo-description"
                className="textarea textarea-bordered w-full"
                placeholder="Add some details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => ref.current.close()}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading || !title.trim()}>
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Create'}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    );
  },
);

export default CreateToDoModal;
