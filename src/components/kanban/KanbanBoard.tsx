import React, { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { KanbanColumn } from './KanbanColumn';
import { Status, Task } from '../../types';

interface KanbanBoardProps {
  tasks: Task[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<Status | null>(null);

  const COLUMNS: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    // Custom drag ghost image
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.opacity = '0.9';
    ghost.style.transform = 'rotate(2deg)';
    ghost.style.boxShadow = '0 25px 50px -12px rgb(0 0 0 / 0.25)';
    ghost.id = 'drag-ghost';
    document.body.appendChild(ghost);
    
    e.dataTransfer.setDragImage(ghost, 20, 20);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    
    // Setup timeout to remove ghost class after event loop
    setTimeout(() => {
      const el = document.getElementById('drag-ghost');
      if (el) document.body.removeChild(el);
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedTaskId(null);
    setDragOverColumnId(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = useCallback((e: React.DragEvent, status: Status) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== status) {
      setDragOverColumnId(status);
    }
  }, [dragOverColumnId]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, status: Status) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
    setDraggedTaskId(null);
  }, [updateTaskStatus]);

  return (
    <div className="flex h-full w-full gap-6 overflow-x-auto pb-6 pt-2">
      {COLUMNS.map((colStatus) => (
        <KanbanColumn
          key={colStatus}
          status={colStatus}
          tasks={tasks.filter(t => t.status === colStatus)}
          draggedTaskId={draggedTaskId}
          dragOverColumnId={dragOverColumnId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
