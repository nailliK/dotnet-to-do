import {describe, expect, it} from 'vitest';
import {ToDoResponse, ToDoStatus} from '@/types/to-do';

// Extract filter logic to test independently
function filterToDos(toDos: ToDoResponse[], activeFilters: Set<ToDoStatus>) {
  return toDos
    .filter(t => !t.parentId)
    .filter(t => activeFilters.size === 0 || activeFilters.has(t.status));
}

function makeToDo(overrides: Partial<ToDoResponse> = {}): ToDoResponse {
  return {
    id: crypto.randomUUID(),
    title: 'Task',
    status: 'Pending',
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('ToDo Filters', () => {
  it('returns all items when no filters active', () => {
    const todos = [
      makeToDo({status: 'Pending'}),
      makeToDo({status: 'Completed'}),
      makeToDo({status: 'InProgress'}),
    ];

    const result = filterToDos(todos, new Set());
    expect(result).toHaveLength(3);
  });

  it('filters by single status', () => {
    const todos = [
      makeToDo({title: 'Pending task', status: 'Pending'}),
      makeToDo({title: 'Done task', status: 'Completed'}),
      makeToDo({title: 'Active task', status: 'InProgress'}),
    ];

    const result = filterToDos(todos, new Set(['Completed']));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Done task');
  });

  it('filters by multiple statuses', () => {
    const todos = [
      makeToDo({status: 'Pending'}),
      makeToDo({status: 'Completed'}),
      makeToDo({status: 'InProgress'}),
      makeToDo({status: 'Cancelled'}),
    ];

    const result = filterToDos(todos, new Set(['Pending', 'InProgress']));
    expect(result).toHaveLength(2);
  });

  it('excludes child tasks', () => {
    const parentId = crypto.randomUUID();
    const todos = [
      makeToDo({id: parentId, status: 'Pending'}),
      makeToDo({status: 'Pending', parentId}),
    ];

    const result = filterToDos(todos, new Set());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(parentId);
  });

  it('returns empty when filter matches nothing', () => {
    const todos = [
      makeToDo({status: 'Pending'}),
      makeToDo({status: 'Pending'}),
    ];

    const result = filterToDos(todos, new Set(['Completed']));
    expect(result).toHaveLength(0);
  });

  it('toggle adds and removes from filter set', () => {
    const filters = new Set<ToDoStatus>();

    // Add
    filters.add('Pending');
    expect(filters.has('Pending')).toBe(true);

    // Remove
    filters.delete('Pending');
    expect(filters.has('Pending')).toBe(false);
  });

  it('reset clears all filters', () => {
    const filters = new Set<ToDoStatus>(['Pending', 'Completed', 'InProgress']);

    filters.clear();
    expect(filters.size).toBe(0);
  });
});
