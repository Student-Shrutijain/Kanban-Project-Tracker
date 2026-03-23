import { create } from 'zustand';
import { Task, ViewMode, FilterState, Status } from '../types';
import { MOCK_TASKS } from '../utils/seedData';

interface AppState {
  tasks: Task[];
  activeView: ViewMode;
  filters: FilterState;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, newStatus: Status) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  setView: (view: ViewMode) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  
  // Collaboration
  activeUsersOnTasks: Record<string, string[]>; // taskId -> array of userIds
  setActiveUsers: (mapping: Record<string, string[]>) => void;
}

const initialFilters: FilterState = {
  status: [],
  priority: [],
  assignee: [],
  dateRange: { from: null, to: null }
};

export const useStore = create<AppState>((set) => ({
  tasks: MOCK_TASKS,
  activeView: 'Kanban',
  filters: initialFilters,
  activeUsersOnTasks: {},

  setTasks: (tasks) => set({ tasks }),
  
  updateTaskStatus: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
  })),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
  })),

  setView: (activeView) => set({ activeView }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  clearFilters: () => set({ filters: initialFilters }),

  setActiveUsers: (mapping) => set({ activeUsersOnTasks: mapping }),
}));
