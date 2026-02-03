import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  subLabel?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:gap-6', gridCols[columns])}>
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stat.value}
                </p>
                {stat.subLabel && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {stat.subLabel}
                  </p>
                )}
                {stat.change && (
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        stat.change.trend === 'up' && 'text-emerald-600',
                        stat.change.trend === 'down' && 'text-red-600',
                        stat.change.trend === 'neutral' && 'text-slate-500'
                      )}
                    >
                      {stat.change.trend === 'up' && '↑'}
                      {stat.change.trend === 'down' && '↓'}
                      {stat.change.value}%
                    </span>
                    <span className="text-xs text-slate-400">vs last month</span>
                  </div>
                )}
              </div>
              <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                <stat.icon className={cn('w-5 h-5 lg:w-6 lg:h-6', stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

