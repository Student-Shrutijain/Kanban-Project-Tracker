export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: Priority;
  status: Status;
  startDate: string | null;
  dueDate: string;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

export type ViewMode = 'Kanban' | 'List' | 'Timeline';

export interface FilterState {
  status: Status[];
  priority: Priority[];
  assignee: string[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
}
