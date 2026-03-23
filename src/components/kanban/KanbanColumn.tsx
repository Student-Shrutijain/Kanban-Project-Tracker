import React from 'react';
import { Status, Task } from '../../types';
import { KanbanCard } from './KanbanCard';
import { cn } from '../../utils/cn';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  draggedTaskId: string | null;
  dragOverColumnId: Status | null;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, status: Status) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: Status) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  draggedTaskId,
  dragOverColumnId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const isDragOver = dragOverColumnId === status;
  
  return (
    <div className="flex h-full min-w-[320px] w-[320px] shrink-0 flex-col rounded-xl bg-slate-100/50 p-4">
      <div className="mb-4 flex items-center justify-between px-1">
        <h3 className="font-semibold text-slate-700">{status}</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden rounded-lg transition-colors pb-10",
          isDragOver ? "bg-primary-50/50 ring-2 ring-primary-500/20 ring-inset" : "bg-transparent"
        )}
        onDragOver={(e) => onDragOver(e, status)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, status)}
      >
        {tasks.length === 0 && !isDragOver ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-4 text-center">
            <p className="text-sm font-medium text-slate-500">No tasks</p>
            <p className="text-xs text-slate-400 mt-1">Drag and drop here</p>
          </div>
        ) : (
          tasks.map(task => (
            <React.Fragment key={task.id}>
              {draggedTaskId === task.id ? (
                // Render placeholder in the original position to prevent layout shift
                <KanbanCard 
                  task={task} 
                  isPlaceholder 
                  onDragStart={onDragStart} 
                  onDragEnd={onDragEnd} 
                />
              ) : (
                <KanbanCard 
                  task={task} 
                  onDragStart={onDragStart} 
                  onDragEnd={onDragEnd} 
                />
              )}
            </React.Fragment>
          ))
        )}
        
        {/* Empty placeholder at the end of the column if we drag over it but it doesn't contain the dragged item */}
        {isDragOver && !tasks.find(t => t.id === draggedTaskId) && (
          <div className="h-32 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/50 mt-3 transition-all" />
        )}
      </div>
    </div>
  );
};
