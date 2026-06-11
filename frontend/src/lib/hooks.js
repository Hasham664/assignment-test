import useSWR from 'swr';
import api from './api';

const fetcher = (url) => api.get(url).then((res) => res.data);

export const useAuth = () => {
  const { data, error, isLoading } = useSWR('/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetry: false,
  });

  return {
    user: data?.data?.user,
    isLoading,
    isError: error,
  };
};

export const useUsers = () => {
  const { data, error, isLoading, mutate } = useSWR('/users', fetcher);

  return {
    users: data?.data?.users || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useDevelopers = () => {
  const { data, error, isLoading } = useSWR('/users/developers', fetcher);

  return {
    developers: data?.data?.developers || [],
    isLoading,
    isError: error,
  };
};

export const useProjects = () => {
  const { data, error, isLoading, mutate } = useSWR('/projects', fetcher);

  return {
    projects: data?.data?.projects || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useProject = (id) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/projects/${id}` : null,
    fetcher
  );

  return {
    project: data?.data?.project,
    tasks: data?.data?.tasks || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useTasks = () => {
  const { data, error, isLoading, mutate } = useSWR('/tasks', fetcher);

  return {
    tasks: data?.data?.tasks || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useTasksByProject = (projectId) => {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/tasks/project/${projectId}` : null,
    fetcher
  );

  return {
    tasks: data?.data?.tasks || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useAdminDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR('/dashboard/admin', fetcher);

  return {
    dashboard: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useDevDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR('/dashboard/dev', fetcher);

  return {
    dashboard: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
};
