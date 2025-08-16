import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-4'
  };

  return (
    <div 
      className={cn(
        'inline-block border-current border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className, 
  dotClassName 
}) => {
  return (
    <div className={cn('loading-dots', className)} role="status" aria-label="Loading">
      <span className={cn('w-2 h-2 bg-current rounded-full', dotClassName)} />
      <span className={cn('w-2 h-2 bg-current rounded-full', dotClassName)} />
      <span className={cn('w-2 h-2 bg-current rounded-full', dotClassName)} />
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'button' | 'card';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'text',
  lines = 1 
}) => {
  const variantClasses = {
    text: 'h-4 w-full',
    avatar: 'w-10 h-10 rounded-full',
    button: 'h-10 w-24 rounded-lg',
    card: 'h-32 w-full rounded-lg'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              'skeleton',
              variantClasses.text,
              i === lines - 1 && 'w-3/4' // Last line is shorter
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'skeleton',
        variantClasses[variant],
        className
      )}
    />
  );
};

interface TypingIndicatorProps {
  className?: string;
  userName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  className,
  userName = 'Someone'
}) => {
  return (
    <div className={cn('flex items-center space-x-2 text-sm text-muted-foreground', className)}>
      <span>{userName} is typing</span>
      <div className="typing-indicator">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  className,
  showLabel = false,
  label
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  showLabel?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  className,
  showLabel = false
}) => {
  const statusClasses = {
    online: 'status-online',
    offline: 'status-offline', 
    away: 'status-away',
    busy: 'status-busy'
  };

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away', 
    busy: 'Busy'
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={statusClasses[status]} />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Loading...',
  className
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn('loading-overlay', className)}>
      <div className="loading-card">
        <LoadingSpinner size="lg" className="text-brand-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

interface NotificationBadgeProps {
  count?: number;
  showDot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  showDot = false,
  className,
  children
}) => {
  const hasNotification = count && count > 0;
  const showCount = hasNotification && count <= 99;
  const showPlus = hasNotification && count > 99;

  return (
    <div className={cn('relative inline-block', className)}>
      {children}
      {showDot && !hasNotification && <div className="notification-dot" />}
      {hasNotification && (
        <div className="notification-badge">
          {showCount && count}
          {showPlus && '99+'}
        </div>
      )}
    </div>
  );
};