import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {DragDropContext, Droppable} from '@hello-pangea/dnd';
import ToDo from '@/components/to-dos/to-do';

function renderToDo(props: Parameters<typeof ToDo>[0]) {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test" type="top-level">
        {(provided) => (
          <ul ref={provided.innerRef} {...provided.droppableProps}>
            <ToDo {...props} />
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>,
  );
}

describe('ToDo', () => {
  it('renders title and description', () => {
    renderToDo({id: '1', title: 'Buy milk', description: 'From the store'});

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('From the store')).toBeInTheDocument();
  });

  it('shows edit form when edit button clicked', () => {
    renderToDo({id: '1', title: 'Buy milk'});

    const listRow = screen.getByText('Buy milk').closest('li')!;
    fireEvent.mouseEnter(listRow);
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));

    expect(screen.getByPlaceholderText('What do you want to do?')).toBeInTheDocument();
  });

  it('calls onUpdate when saving edits', () => {
    const onUpdate = vi.fn();
    renderToDo({id: '1', title: 'Buy milk', onUpdate});

    const listRow = screen.getByText('Buy milk').closest('li')!;
    fireEvent.mouseEnter(listRow);
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));

    const input = screen.getByPlaceholderText('What do you want to do?');
    fireEvent.change(input, {target: {value: 'Buy eggs'}});

    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({title: 'Buy eggs'}));
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    renderToDo({id: '1', title: 'Buy milk', onDelete});

    const listRow = screen.getByText('Buy milk').closest('li')!;
    fireEvent.mouseEnter(listRow);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('disables status select when blocked by incomplete task', () => {
    const siblings = [{
      id: '2',
      title: 'Blocker',
      status: 'Pending' as const,
      sortOrder: 0,
      createdAt: '',
      updatedAt: '',
    }];

    renderToDo({id: '1', title: 'Blocked task', blockedById: '2', siblings});

    const listRow = screen.getByText('Blocked task').closest('li')!;
    fireEvent.mouseEnter(listRow);
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));

    const statusSelect = screen.getByDisplayValue('Pending');
    expect(statusSelect).toBeDisabled();
  });

  it('enables status select when blocked by completed task', () => {
    const siblings = [{
      id: '2',
      title: 'Done task',
      status: 'Completed' as const,
      sortOrder: 0,
      createdAt: '',
      updatedAt: '',
    }];

    renderToDo({id: '1', title: 'Unblocked task', blockedById: '2', siblings});

    const listRow = screen.getByText('Unblocked task').closest('li')!;
    fireEvent.mouseEnter(listRow);
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));

    const statusSelect = screen.getByDisplayValue('Pending');
    expect(statusSelect).not.toBeDisabled();
  });

  it('forces status to Pending when blocked by incomplete task', () => {
    const onUpdate = vi.fn();
    const siblings = [{
      id: '2',
      title: 'Other task',
      status: 'Pending' as const,
      sortOrder: 0,
      createdAt: '',
      updatedAt: '',
    }];

    renderToDo({id: '1', title: 'My task', status: 'InProgress', siblings, onUpdate});

    const listRow = screen.getByText('My task').closest('li')!;
    fireEvent.mouseEnter(listRow);
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));

    const blockedSelect = screen.getByDisplayValue('None');
    fireEvent.change(blockedSelect, {target: {value: '2'}});

    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({status: 'Pending'}));
  });

  it('does not force status to Pending when blocked by completed task', () => {
    const onUpdate = vi.fn();
    const siblings = [{
      id: '2',
      title: 'Done task',
      status: 'Completed' as const,
      sortOrder: 0,
      createdAt: '',
      updatedAt: '',
    }];

    renderToDo({id: '1', title: 'My task', status: 'InProgress', siblings, onUpdate});

    const listRow = screen.getByText('My task').closest('li')!;
    fireEvent.mouseEnter(listRow);
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));

    const blockedSelect = screen.getByDisplayValue('None');
    fireEvent.change(blockedSelect, {target: {value: '2'}});

    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({status: 'InProgress'}));
  });

  it('shows subtasks accordion for top-level items', () => {
    renderToDo({id: '1', title: 'Parent task'});
    expect(screen.getByText(/Sub-Tasks/)).toBeInTheDocument();
  });

  it('hides subtasks accordion for child items', () => {
    renderToDo({id: '1', title: 'Child task', parentId: '2'});
    expect(screen.queryByText(/Sub-Tasks/)).not.toBeInTheDocument();
  });

  it('shows subtask count', () => {
    const subTasks = [
      {id: 's1', title: 'Sub 1', status: 'Pending' as const, sortOrder: 0, createdAt: '', updatedAt: ''},
      {id: 's2', title: 'Sub 2', status: 'Pending' as const, sortOrder: 1, createdAt: '', updatedAt: ''},
    ];
    renderToDo({id: '1', title: 'Parent', subTasks});
    expect(screen.getByText(/Sub-Tasks \(2\)/)).toBeInTheDocument();
  });
});
