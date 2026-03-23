import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Priority, Status, FilterState } from '../../types';
import { USERS } from '../../utils/seedData';
import { Button } from '../ui/Button';
import { Filter, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const FilterBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useStore(state => state.filters);
  const setFilters = useStore(state => state.setFilters);
  const clearStoreFilters = useStore(state => state.clearFilters);

  const [isOpen, setIsOpen] = useState(false); // Mobile toggle

  // URL -> State on mount
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const assigneeParam = searchParams.get('assignee');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const initialFilters: Partial<FilterState> = {};
    if (statusParam) initialFilters.status = statusParam.split(',') as Status[];
    if (priorityParam) initialFilters.priority = priorityParam.split(',') as Priority[];
    if (assigneeParam) initialFilters.assignee = assigneeParam.split(',');
    if (fromParam || toParam) initialFilters.dateRange = { from: fromParam || null, to: toParam || null };

    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, []);

  // State -> URL on change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status.length) params.set('status', filters.status.join(','));
    if (filters.priority.length) params.set('priority', filters.priority.join(','));
    if (filters.assignee.length) params.set('assignee', filters.assignee.join(','));
    if (filters.dateRange.from) params.set('from', filters.dateRange.from);
    if (filters.dateRange.to) params.set('to', filters.dateRange.to);

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleToggleFilter = (key: keyof Pick<FilterState, 'status' | 'priority' | 'assignee'>, value: string) => {
    const currentList = filters[key] as string[];
    const newList = currentList.includes(value) 
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    
    setFilters({ [key]: newList });
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    setFilters({ dateRange: { ...filters.dateRange, [type]: value || null } });
  };

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0 || filters.assignee.length > 0 || filters.dateRange.from || filters.dateRange.to;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6 flex flex-col gap-4">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </div>

          <div className="flex items-center gap-3">
             {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={() => clearStoreFilters()} className="text-slate-500 h-8">
                  Clear All Filters
                </Button>
             )}
          </div>
       </div>

       <div className="flex flex-wrap gap-x-8 gap-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
            <div className="flex flex-wrap gap-2">
              {['To Do', 'In Progress', 'In Review', 'Completed'].map(s => (
                <button
                  key={s}
                  onClick={() => handleToggleFilter('status', s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    filters.status.includes(s as Status) 
                      ? "bg-primary-50 text-primary-700 border-primary-200" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</span>
            <div className="flex flex-wrap gap-2">
              {['Critical', 'High', 'Medium', 'Low'].map(p => (
                <button
                  key={p}
                  onClick={() => handleToggleFilter('priority', p)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    filters.priority.includes(p as Priority) 
                      ? "bg-primary-50 text-primary-700 border-primary-200" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</span>
            <div className="flex flex-wrap gap-2 max-w-[300px]">
              {USERS.map(u => (
                <button
                  key={u.name}
                  onClick={() => handleToggleFilter('assignee', u.name)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    filters.assignee.includes(u.name) 
                      ? "bg-primary-50 text-primary-700 border-primary-200" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</span>
             <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={filters.dateRange.from || ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="flex-1 h-9 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
                <span className="text-slate-400">to</span>
                <input 
                  type="date" 
                  value={filters.dateRange.to || ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="flex-1 h-9 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
             </div>
          </div>
       </div>
    </div>
  );
};
