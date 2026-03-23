import React from 'react';
import { Task, User } from '../../types';
import { MOCK_TASKS, USERS } from '../../utils/seedData';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { isBefore, startOfDay, differenceInDays } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
  isPlaceholder?: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ 
  task, 
  isDragging, 
  isPlaceholder,
  onDragStart,
  onDragEnd,
}) => {
  const activeUsersOnTasks = useStore(state => state.activeUsersOnTasks);
  const activeUserIds = activeUsersOnTasks[task.id] || [];
  
  const assigneeUser = USERS.find(u => u.name === task.assignee);
  const activeUsers = activeUserIds.map(uid => USERS.find(u => u.id === uid)).filter(Boolean) as User[];

  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.dueDate));
  const isOverdue = isBefore(dueDate, today);
  const isDueToday = differenceInDays(dueDate, today) === 0;
  const daysOverdue = isOverdue ? differenceInDays(today, dueDate) : 0;

  if (isPlaceholder) {
    return (
      <div className="h-32 mb-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-all opacity-50" />
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative mb-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 !shadow-2xl scale-105 z-50 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 leading-snug">{task.title}</h4>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        <Badge variant={task.priority}>{task.priority}</Badge>
        
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border max-w-full w-fit",
          isOverdue && daysOverdue > 7 ? "bg-red-50 text-red-700 border-red-200" :
          isOverdue ? "bg-red-50 text-red-600 border-red-100" :
          isDueToday ? "bg-orange-50 text-orange-600 border-orange-100" :
          "bg-slate-50 text-slate-500 border-slate-200"
        )}>
          <Clock className="w-3 h-3" />
          <span>
            {isOverdue && daysOverdue > 7 ? `${daysOverdue} days overdue` : 
             isOverdue ? "Overdue" : 
             isDueToday ? "Due Today" : 
             task.dueDate}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 mt-2 pt-3">
        <div className="text-xs text-slate-500 font-medium">
          {task.id}
        </div>

        <div className="flex items-center gap-2">
          {/* Active Collaboration Users Indicators */}
          {activeUsers.length > 0 && (
            <div className="flex -space-x-2 mr-2">
              {activeUsers.slice(0, 3).map((u, i) => (
                <Avatar 
                  key={u.id} 
                  name={u.name} 
                  color={u.color} 
                  size="sm" 
                  className="border-2 border-white relative z-[1]"
                  style={{ zIndex: 3 - i }}
                />
              ))}
              {activeUsers.length > 3 && (
                <div className="relative z-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-medium text-slate-600">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
          )}

          {assigneeUser && (
            <Avatar name={assigneeUser.name} color={assigneeUser.color} size="md" />
          )}
        </div>
      </div>
    </div>
  );
};
