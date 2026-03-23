import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { ViewMode } from '../../types';
import { LayoutDashboard, List, CalendarDays } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Avatar } from '../ui/Avatar';
import { USERS } from '../../utils/seedData';

// Simulated users pool (subset for presence)
const PRESENCE_USERS = USERS.slice(0, 4);

export const Header: React.FC = () => {
  const activeView = useStore(state => state.activeView);
  const setView = useStore(state => state.setView);
  const tasks = useStore(state => state.tasks);
  const setActiveUsers = useStore(state => state.setActiveUsers);

  const VIEWS: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: 'Kanban', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Board' },
    { id: 'List', icon: <List className="w-4 h-4" />, label: 'List' },
    { id: 'Timeline', icon: <CalendarDays className="w-4 h-4" />, label: 'Timeline' },
  ];

  // Live Collaboration Simulation
  useEffect(() => {
     const interval = setInterval(() => {
        // Randomly assign presence users to random task IDs
        const newMapping: Record<string, string[]> = {};
        
        // Ensure there are tasks to look at
        if (tasks.length === 0) return;

        PRESENCE_USERS.forEach(pu => {
           // Provide a chance that a user is 'idle' or randomly moving
           if (Math.random() > 0.2) { 
              const randomTask = tasks[Math.floor(Math.random() * Math.min(tasks.length, 50))]; // limit to first 50 for density 
              if (!newMapping[randomTask.id]) {
                 newMapping[randomTask.id] = [];
              }
              newMapping[randomTask.id].push(pu.id);
           }
        });

        setActiveUsers(newMapping);
     }, 4000); // Change positions every 4s

     return () => clearInterval(interval);
  }, [tasks, setActiveUsers]);

  // Aggregate active users count from the mapping
  const activeUsersOnTasks = useStore(state => state.activeUsersOnTasks);
  const totalActiveUsers = useMemo(() => {
     const uniqueUsers = new Set<string>();
     Object.values(activeUsersOnTasks).forEach(userIds => {
        userIds.forEach(id => uniqueUsers.add(id));
     });
     return uniqueUsers.size;
  }, [activeUsersOnTasks]);

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
      <div className="flex flex-col gap-1">
         <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Tracker</h1>
         <p className="text-sm text-slate-500">Manage your tasks and deliverables.</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Live Collaboration Indicators Banner */}
        {totalActiveUsers > 0 && (
           <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-full shadow-sm">
             <div className="flex -space-x-2">
                {PRESENCE_USERS.filter(u => Array.from(new Set(Object.values(activeUsersOnTasks).flat())).includes(u.id))
                  .map(pu => (
                    <Avatar key={pu.id} name={pu.name} color={pu.color} size="sm" className="border-2 border-white ring-1 ring-slate-100" />
                  ))
                }
             </div>
             <span className="text-xs font-medium text-slate-600">
                {totalActiveUsers} {totalActiveUsers === 1 ? 'person is' : 'people are'} viewing this board
             </span>
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
           </div>
        )}

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeView === v.id 
                  ? "bg-white text-primary-700 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              {v.icon}
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
