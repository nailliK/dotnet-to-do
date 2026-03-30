import { CreateToDoRequest, ToDoResponse, UpdateToDoRequest } from '@/types/to-do';

const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.text().catch(() => '');
      throw new Error(error || `Request failed: ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const todosApi = {
  getAll: (token: string): Promise<ToDoResponse[]> =>
    fetchWithAuth('/api/todos', token),

  getById: (id: string, token: string): Promise<ToDoResponse> =>
    fetchWithAuth(`/api/todos/${id}`, token),

  create: (data: CreateToDoRequest, token: string): Promise<ToDoResponse> =>
    fetchWithAuth('/api/todos', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateToDoRequest, token: string): Promise<null> =>
    fetchWithAuth(`/api/todos/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string, token: string): Promise<null> =>
    fetchWithAuth(`/api/todos/${id}`, token, {
      method: 'DELETE',
    }),
};
