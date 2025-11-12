import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'expired' | 'cancelled';
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        status === 'active' && 'bg-status-active/10 text-status-active',
        status === 'expired' && 'bg-status-expired/10 text-status-expired',
        status === 'cancelled' && 'bg-status-cancelled/10 text-status-cancelled',
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
