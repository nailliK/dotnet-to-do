import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import CreateToDoModal from '@/components/to-dos/create-to-do-modal';

function renderModal(props: Partial<Parameters<typeof CreateToDoModal>[0]> = {}) {
  const ref = createRef<HTMLDialogElement>();
  const onSave = vi.fn();
  render(
    <CreateToDoModal
      ref={ref}
      onSave={onSave}
      isLoading={false}
      isSubtask={false}
      {...props}
    />,
  );
  return { ref, onSave };
}

describe('CreateToDoModal', () => {
  it('shows "New Task" title by default', () => {
    renderModal();
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('shows "New Sub-Task" title when isSubtask', () => {
    renderModal({ isSubtask: true });
    expect(screen.getByText('New Sub-Task')).toBeInTheDocument();
  });

  it('disables create button when title is empty', () => {
    renderModal();
    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('enables create button when title has text', () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('What do you want to do?'), {
      target: { value: 'New task' },
    });
    expect(screen.getByText('Create')).not.toBeDisabled();
  });

  it('disables create button when title is only whitespace', () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('What do you want to do?'), {
      target: { value: '   ' },
    });
    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('calls onSave with trimmed title and description', () => {
    const { onSave } = renderModal();

    fireEvent.change(screen.getByPlaceholderText('What do you want to do?'), {
      target: { value: '  Buy milk  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Add some details...'), {
      target: { value: '  From the store  ' },
    });
    fireEvent.submit(screen.getByPlaceholderText('What do you want to do?').closest('form')!);

    expect(onSave).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: 'From the store',
    });
  });

  it('sends undefined description when empty', () => {
    const { onSave } = renderModal();

    fireEvent.change(screen.getByPlaceholderText('What do you want to do?'), {
      target: { value: 'Task' },
    });
    fireEvent.submit(screen.getByPlaceholderText('What do you want to do?').closest('form')!);

    expect(onSave).toHaveBeenCalledWith({
      title: 'Task',
      description: undefined,
    });
  });

  it('shows spinner when loading', () => {
    renderModal({ isLoading: true });
    fireEvent.change(screen.getByPlaceholderText('What do you want to do?'), {
      target: { value: 'Task' },
    });
    expect(screen.queryByText('Create')).not.toBeInTheDocument();
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton).toBeDisabled();
    expect(submitButton.querySelector('.loading-spinner')).toBeInTheDocument();
  });
});
