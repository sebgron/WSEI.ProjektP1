import { apiFetch } from './api';
import { IServiceTaskResponse, TaskStatus, TaskType } from '@turborepo/shared';

export const staffAPI = {
  getTasks: async (filters?: {
    status?: TaskStatus;
    type?: TaskType;
    myTasks?: boolean;
  }): Promise<IServiceTaskResponse[]> => {
    let endpoint = 'service-tasks';
    const params = new URLSearchParams();
    
    if (filters?.myTasks) {
      endpoint = 'service-tasks/my';
    }
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return apiFetch<IServiceTaskResponse[]>(url);
  },

  updateTaskStatus: async (id: number, status: TaskStatus): Promise<IServiceTaskResponse> => {
    return apiFetch<IServiceTaskResponse>(`service-tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  reportIssue: async (data: {
    roomId: number;
    description: string;
  }): Promise<IServiceTaskResponse> => {
    return apiFetch<IServiceTaskResponse>('service-tasks', {
      method: 'POST',
      body: JSON.stringify({
        roomId: data.roomId,
        description: data.description,
        type: TaskType.REPAIR,
        status: TaskStatus.PENDING
      }),
    });
  },

  updateTask: async (id: number, data: Partial<{
    type: TaskType;
    description: string;
    status: TaskStatus;
    newDoorCode?: string;
  }>): Promise<IServiceTaskResponse> => {
    return apiFetch<IServiceTaskResponse>(`service-tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};
