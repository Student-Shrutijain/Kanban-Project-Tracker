import { addDays, subDays, format } from 'date-fns';
import { Task, User, Priority, Status } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Smith', color: '#d72828ff' },
  { id: 'u2', name: 'Bob Johnson', color: '#fb923c' },
  { id: 'u3', name: 'Charlie Davis', color: '#fbbf24' },
  { id: 'u4', name: 'Diana Evans', color: '#34d399' },
  { id: 'u5', name: 'Ethan Foster', color: '#60a5fa' },
  { id: 'u6', name: 'Fiona Green', color: '#a78bfa' },
];

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

const TASKS_COUNT = 550;

const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateTasks = (): Task[] => {
  const result: Task[] = [];
  const today = new Date();

  for (let i = 0; i < TASKS_COUNT; i++) {
    // 20% overdue, 10% due today, 70% future
    const isOverdue = Math.random() < 0.2;
    const isDueToday = !isOverdue && Math.random() < 0.1;
    
    let dueDateObj: string | number | Date;
    if (isOverdue) {
      dueDateObj = subDays(today, getRandomInt(1, 15));
    } else if (isDueToday) {
      dueDateObj = today;
    } else {
      dueDateObj = addDays(today, getRandomInt(1, 30));
    }

    // 15% without start date
    const noStartDate = Math.random() < 0.15;
    let startDateObj = null;
    if (!noStartDate) {
      startDateObj = subDays(dueDateObj, getRandomInt(1, 10));
    }

    result.push({
      id: `task-${i + 1}`,
      title: `Project Task ${i + 1} - ${getRandomItem(['Update', 'Fix', 'Implement', 'Review'])} module`,
      assignee: getRandomItem(USERS).name,
      priority: getRandomItem(PRIORITIES),
      status: getRandomItem(STATUSES),
      startDate: startDateObj ? format(startDateObj, 'yyyy-MM-dd') : null,
      dueDate: format(dueDateObj, 'yyyy-MM-dd'),
    });
  }

  return result;
};

export const MOCK_TASKS = generateTasks();
