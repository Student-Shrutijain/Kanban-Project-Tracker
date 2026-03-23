import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showInitials?: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, color = '#cbd5e1', size = 'md', showInitials = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        title={name}
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-full overflow-hidden text-white font-medium',
          {
            'h-6 w-6 text-[10px]': size === 'sm',
            'h-8 w-8 text-xs': size === 'md',
            'h-10 w-10 text-sm': size === 'lg',
          },
          className
        )}
        style={{ backgroundColor: color }}
        {...props}
      >
        {showInitials && <span>{getInitials(name)}</span>}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
