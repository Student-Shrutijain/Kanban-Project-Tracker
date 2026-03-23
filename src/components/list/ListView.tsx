import React, { useState, useMemo } from 'react';
import { Task, Priority, Status } from '../../types';
import { USERS } from '../../utils/seedData';
import { useVirtualScroll } from './useVirtualScroll';
import { Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { ArrowDownAZ, ArrowUpZA, ArrowUpFromLine, ArrowDownToLine, Calendar, CalendarArrowDown, CalendarArrowUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format, differenceInDays, startOfDay, isBefore } from 'date-fns';

interface ListViewProps {
  tasks: Task[];
}

type SortField = 'title' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const PRIORITY_WEIGHT: Record<Priority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const ListView: React.FC<ListViewProps> = ({ tasks }) => {
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const activeUsersOnTasks = useStore(state => state.activeUsersOnTasks);

  const [sortField, setSortField] = useState<SortField | null>('dueDate');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortField) return tasks;

    return [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'priority') {
        comparison = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]; // Descending normally means highest first
      } else if (sortField === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortField, sortDir]);

  // Virtual scrolling dimensions
  const rowHeight = 64; // 4rem
  const containerHeight = 800; // rough max height, use actual CSS for real bounds

  const { containerRef, totalHeight, visibleItems } = useVirtualScroll({
    itemHeight: rowHeight,
    totalItems: sortedTasks.length,
    containerHeight,
    buffer: 5,
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    if (field === 'title') return sortDir === 'asc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpZA className="w-4 h-4" />;
    if (field === 'priority') return sortDir === 'asc' ? <ArrowUpFromLine className="w-4 h-4" /> : <ArrowDownToLine className="w-4 h-4" />;
    if (field === 'dueDate') return sortDir === 'asc' ? <CalendarArrowDown className="w-4 h-4" /> : <CalendarArrowUp className="w-4 h-4" />;
  };

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-600">No tasks found</p>
          <p className="text-sm text-slate-500 mt-1">Try clearing your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider sticky top-0 z-10">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => handleSort('title')}
        >
          Task Title
          {getSortIcon('title')}
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => handleSort('priority')}
        >
          Priority
          {getSortIcon('priority')}
        </div>
        <div className="flex items-center gap-2">
          Assignee
        </div>
        <div className="flex items-center gap-2">
          Status
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => handleSort('dueDate')}
        >
          Due Date
          {getSortIcon('dueDate')}
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto relative custom-scrollbar"
        style={{ height: '100%', minHeight: '400px' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ index, offsetTop }) => {
            const task = sortedTasks[index];
            const assigneeUser = USERS.find(u => u.name === task.assignee);
            
            const today = startOfDay(new Date());
            const dueDate = startOfDay(new Date(task.dueDate));
            const isOverdue = isBefore(dueDate, today);
            const isDueToday = differenceInDays(dueDate, today) === 0;
            const daysOverdue = isOverdue ? differenceInDays(today, dueDate) : 0;

            const activeUserIds = activeUsersOnTasks[task.id] || [];
            const activeUsers = activeUserIds.map(uid => USERS.find(u => u.id === uid)).filter(Boolean) as React.ComponentProps<typeof Avatar>[];

            return (
              <div 
                key={task.id}
                className="absolute w-full px-6 grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr] gap-4 items-center border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors"
                style={{
                  height: rowHeight,
                  top: offsetTop,
                }}
              >
                <div className="flex items-center gap-3 pr-4 truncate font-medium text-slate-800">
                  <span className="truncate">{task.title}</span>
                  {activeUsers.length > 0 && (
                     <div className="flex -space-x-2 shrink-0">
                     {activeUsers.slice(0, 2).map((u, i) => (
                       <Avatar key={u?.name} name={u?.name!} color={u?.color} size="sm" className="border-2 border-white ring-1 ring-slate-100" />
                     ))}
                   </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Badge variant={task.priority}>{task.priority}</Badge>
                </div>
                <div className="flex items-center gap-2 truncate">
                  {assigneeUser && <Avatar name={assigneeUser.name} color={assigneeUser.color} size="sm" />}
                  <span className="text-sm text-slate-600 truncate">{task.assignee}</span>
                </div>
                <div className="flex items-center pr-8">
                  <Select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                    className="h-8 py-0 pl-3 pr-8 text-xs font-medium bg-transparent border-slate-200 shadow-sm"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </Select>
                </div>
                <div className="flex items-center">
                  {isOverdue && daysOverdue > 7 ? (
                    <span className="text-sm font-medium text-red-600">{daysOverdue} days overdue</span>
                  ) : isOverdue ? (
                    <span className="text-sm font-medium text-red-500">Overdue ({task.dueDate})</span>
                  ) : isDueToday ? (
                    <span className="text-sm font-medium text-orange-500">Due Today</span>
                  ) : (
                    <span className="text-sm text-slate-600">{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
