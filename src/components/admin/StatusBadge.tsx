import { cn } from '@/lib/utils';
import { Clock, CreditCard, Truck, CheckCircle2, XCircle } from 'lucide-react';

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; icon: any }> = {
  PENDING:   { label: 'Pending',   className: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  PAID:      { label: 'Paid',      className: 'bg-blue-50 text-blue-700 border-blue-200', icon: CreditCard },
  SHIPPED:   { label: 'Shipped',   className: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
  DELIVERED: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export default function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as OrderStatus] ?? {
    label: status,
    className: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    icon: null,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border',
        config.className,
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
export type { OrderStatus };
