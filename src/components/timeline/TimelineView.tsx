import React, { useMemo, useRef, useEffect } from 'react';
import { Task, Priority } from '../../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, differenceInDays } from 'date-fns';
import { cn } from '../../utils/cn';

interface TimelineViewProps {
  tasks: Task[];
}

const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'bg-blue-400',
  Medium: 'bg-yellow-400',
  High: 'bg-orange-400',
  Critical: 'bg-red-500',
};

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Spanning the current month (or a broader range to fit all tasks if needed, but requirements say "spanning the current month")
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());
  
  const daysInMonth = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);
  
  // Column width per day
  const DAY_WIDTH = 40; 

  // Auto-scroll to today
  useEffect(() => {
    if (scrollContainerRef.current) {
      const todayIndex = daysInMonth.findIndex(d => isToday(d));
      if (todayIndex > -1) {
        scrollContainerRef.current.scrollLeft = Math.max(0, todayIndex * DAY_WIDTH - scrollContainerRef.current.clientWidth / 2);
      }
    }
  }, [daysInMonth]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden select-none">
      
      <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50 sticky left-0 z-20">
        <h2 className="font-semibold text-slate-700">Timeline / Gantt</h2>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto relative custom-scrollbar bg-slate-50/50"
      >
        <div style={{ width: `${daysInMonth.length * DAY_WIDTH}px` }} className="min-h-full pb-8">
          {/* Header row (Dates) */}
          <div className="flex border-b border-slate-200 absolute top-0 z-10 bg-white shadow-sm w-full">
            {daysInMonth.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex flex-col items-center justify-center border-r border-slate-100 py-2 h-12 shrink-0 text-xs font-medium",
                  isToday(day) ? "text-primary-600 bg-primary-50 font-bold" : "text-slate-500"
                )}
                style={{ width: `${DAY_WIDTH}px` }}
              >
                <span>{format(day, 'E').charAt(0)}</span>
                <span>{format(day, 'd')}</span>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute top-12 bottom-0 left-0 flex w-full pointer-events-none">
            {daysInMonth.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "border-r h-full shrink-0 relative",
                  isToday(day) ? "border-primary-200" : "border-slate-100"
                )}
                style={{ width: `${DAY_WIDTH}px` }}
              >
                {isToday(day) && (
                  <div className="absolute left-[50%] top-0 bottom-0 w-px bg-primary-500 z-0" />
                )}
              </div>
            ))}
          </div>

          {/* Tasks rows */}
          <div className="pt-16 pb-4 px-2 flex flex-col gap-2 relative z-10">
            {tasks.length === 0 && (
               <div className="absolute w-full mt-20 text-center text-slate-500 italic">No tasks in this view</div>
            )}
            {tasks.map((task) => {
              const taskDue = new Date(task.dueDate);
              const taskStart = task.startDate ? new Date(task.startDate) : taskDue;
              
              // Only render if it overlaps with the current month at all
              if ((taskDue < startDate) || (taskStart > endDate)) {
                return null;
              }

              // Calculate horizontal plotting
              // Clamp start and end to boundaries of the displayed month
              const clampedStart = taskStart < startDate ? startDate : taskStart;
              const clampedEnd = taskDue > endDate ? endDate : taskDue;

              const startOffsetDays = differenceInDays(clampedStart, startDate);
              const durationDays = Math.max(1, differenceInDays(clampedEnd, clampedStart) + 1);

              const leftPos = startOffsetDays * DAY_WIDTH;
              const widthPos = durationDays * DAY_WIDTH;

              // Handle single day tasks (no start date) visually
              const isSingleDay = !task.startDate;

              return (
                <div key={task.id} className="relative h-10 w-full group">
                  <div 
                    className={cn(
                      "absolute h-7 top-1.5 rounded-md flex items-center px-3 shadow-sm text-xs font-medium text-white truncate transition-transform hover:-translate-y-0.5 hover:shadow-md cursor-default",
                      PRIORITY_COLORS[task.priority],
                      isSingleDay ? "rounded-full opacity-90 pl-3" : ""
                    )}
                    style={{
                      left: `${leftPos + (isSingleDay ? DAY_WIDTH/2 - 14 : 4)}px`, // offset for styling
                      width: `${isSingleDay ? Math.min(widthPos, 28) : Math.max(widthPos - 8, 20)}px`,
                    }}
                    title={`${task.title} (${task.priority})`}
                  >
                    {!isSingleDay && <span className="truncate">{task.title}</span>}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
