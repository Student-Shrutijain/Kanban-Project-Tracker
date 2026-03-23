import React, { useMemo } from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/layout/FilterBar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { ListView } from './components/list/ListView';
import { TimelineView } from './components/timeline/TimelineView';
import { isWithinInterval, startOfDay } from 'date-fns';

function App() {
  const tasks = useStore(state => state.tasks);
  const activeView = useStore(state => state.activeView);
  const filters = useStore(state => state.filters);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status Filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
      // Priority Filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
      // Assignee Filter
      if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) return false;
      // Date Range Filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const taskDate = startOfDay(new Date(task.dueDate));
        const fromDate = filters.dateRange.from ? startOfDay(new Date(filters.dateRange.from)) : new Date(-8640000000000000); // Min date
        const toDate = filters.dateRange.to ? startOfDay(new Date(filters.dateRange.to)) : new Date(8640000000000000); // Max date
        
        if (!isWithinInterval(taskDate, { start: fromDate, end: toDate })) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 h-screen flex flex-col">
        <Header />
        <FilterBar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {filteredTasks.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900">No tasks found</h3>
                <p className="text-slate-500 max-w-[300px] text-center mt-1">
                   We couldn't find any tasks matching your current filter criteria.
                </p>
                <button 
                  onClick={() => useStore.getState().clearFilters()}
                  className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors"
                >
                  Clear all filters
                </button>
             </div>
          ) : (
             <>
               {activeView === 'Kanban' && <KanbanBoard tasks={filteredTasks} />}
               {activeView === 'List' && <ListView tasks={filteredTasks} />}
               {activeView === 'Timeline' && <TimelineView tasks={filteredTasks} />}
             </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
