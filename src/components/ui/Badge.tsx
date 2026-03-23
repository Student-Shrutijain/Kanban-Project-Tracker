import React from 'react';
import { cn } from '../../utils/cn';
import { Priority, Status } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Priority | Status | 'default';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold max-w-max',
          {
            'bg-slate-100 text-slate-800': variant === 'default',
            // Priority colors
            'bg-blue-100 text-blue-800': variant === 'Low',
            'bg-yellow-100 text-yellow-800': variant === 'Medium',
            'bg-orange-100 text-orange-800': variant === 'High',
            'bg-red-100 text-red-800': variant === 'Critical',
            // Status colors
            'bg-slate-200 text-slate-700': variant === 'To Do',
            'bg-cyan-100 text-cyan-800': variant === 'In Progress',
            'bg-purple-100 text-purple-800': variant === 'In Review',
            'bg-green-100 text-green-800': variant === 'Done',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
