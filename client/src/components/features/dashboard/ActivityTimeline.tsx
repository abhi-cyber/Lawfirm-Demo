import { 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  UserPlus,
  AlertCircle,
  type LucideIcon 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

export type ActivityType = 'case_created' | 'case_updated' | 'task_completed' | 'note_added' | 'client_added' | 'deadline_warning';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: Record<string, string>;
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  case_created: { icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  case_updated: { icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  task_completed: { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  note_added: { icon: MessageSquare, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  client_added: { icon: UserPlus, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  deadline_warning: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityTimeline({ activities, maxItems = 8 }: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {displayActivities.length > 0 ? (
          <div className="space-y-1">
            {displayActivities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              const isLast = index === displayActivities.length - 1;

              return (
                <div key={activity.id} className="flex gap-3 py-2">
                  <div className="flex flex-col items-center">
                    <div className={cn('p-2 rounded-full', config.bgColor)}>
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                      {activity.user && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {activity.user}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
}

