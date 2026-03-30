import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { todosApi } from '@/lib/api';
import { CreateToDoRequest, UpdateToDoRequest } from '@/types/to-do';

export function useTodos() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';

  return useQuery({
    queryKey: ['todos'],
    queryFn: () => todosApi.getAll(token),
    enabled: !!token,
  });
}

export function useTodo(id: string) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';

  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todosApi.getById(id, token),
    enabled: !!token && !!id,
  });
}

export function useCreateTodo() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateToDoRequest) => todosApi.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateToDoRequest }) =>
      todosApi.update(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todosApi.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
