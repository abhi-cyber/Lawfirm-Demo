import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ITask, ICase } from '@/types';

interface MyWorkProps {
  tasks: ITask[];
  cases: ICase[];
  currentUserId?: string;
}

function formatDueDate(dateStr: string): { text: string; isOverdue: boolean; isUrgent: boolean } {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isUrgent: true };
  if (diffDays === 0) return { text: 'Due today', isOverdue: false, isUrgent: true };
  if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false, isUrgent: true };
  if (diffDays <= 7) return { text: `Due in ${diffDays}d`, isOverdue: false, isUrgent: false };
  return { text: date.toLocaleDateString(), isOverdue: false, isUrgent: false };
}

export function MyWork({ tasks, cases }: MyWorkProps) {
  // Filter for pending/in-progress tasks
  const myTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Filter for active cases
  const myCases = cases
    .filter((c) => c.status !== 'closed')
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 4);

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* My Tasks */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">My Tasks</CardTitle>
            {overdueTasks > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueTasks} overdue
              </Badge>
            )}
          </div>
          <Link to="/tasks">
            <Button variant="ghost" size="sm" className="text-xs">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {myTasks.length > 0 ? (
            <div className="space-y-3">
              {myTasks.map((task) => {
                const due = formatDueDate(task.dueDate);
                return (
                  <div
                    key={task._id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'flex items-center gap-1 text-xs',
                          due.isOverdue ? 'text-red-600' : due.isUrgent ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400'
                        )}>
                          {due.isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                          {due.text}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'secondary'}
                      className="text-xs flex-shrink-0"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
              No pending tasks
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Cases */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">My Cases</CardTitle>
          <Link to="/cases">
            <Button variant="ghost" size="sm" className="text-xs">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {myCases.length > 0 ? (
            <div className="space-y-3">
              {myCases.map((caseItem) => {
                const deadline = caseItem.deadline ? formatDueDate(caseItem.deadline) : null;
                return (
                  <div
                    key={caseItem._id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {caseItem.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {caseItem.stage}
                        </Badge>
                        {deadline && (
                          <span className={cn(
                            'flex items-center gap-1 text-xs',
                            deadline.isOverdue ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'
                          )}>
                            <Clock className="w-3 h-3" />
                            {deadline.text}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={caseItem.priority === 'high' ? 'destructive' : caseItem.priority === 'medium' ? 'warning' : 'secondary'}
                      className="text-xs flex-shrink-0"
                    >
                      {caseItem.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
              No active cases
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

