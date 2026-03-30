export type ToDoStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export interface ToDoState {
  title: string;
  description: string;
  status: ToDoStatus;
  sortOrder: number;
  blockedById?: string;
}

export interface ToDoProps {
  id: string;
  title?: string;
  description?: string;
  status?: ToDoStatus;
  sortOrder?: number;
  parentId?: string;
  blockedById?: string;
  siblings?: ToDoResponse[];
  subTasks?: ToDoResponse[];
  onUpdate?: (id: string, data: UpdateToDoRequest) => void;
  onDelete?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
}

export interface ToDoResponse {
  id: string;
  title: string;
  description?: string;
  status: ToDoStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  parentId?: string;
  blockedById?: string;
  subTasks?: ToDoResponse[];
}

export interface CreateToDoRequest {
  title: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateToDoRequest {
  title?: string;
  description?: string;
  status?: ToDoStatus;
  sortOrder?: number;
  parentId?: string;
  blockedById?: string;
}
