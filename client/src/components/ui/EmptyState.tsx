import {type ReactNode} from "react";
import {type LucideIcon, Inbox} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  description?: string;
  action?:
    | {
        label: string;
        onClick: () => void;
      }
    | ReactNode;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: IconOrNode = Inbox,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  // Check if icon is a ReactNode (element) or a LucideIcon (component)
  const isReactNode = typeof IconOrNode !== "function";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}>
      <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        {isReactNode ? (
          IconOrNode
        ) : (
          <IconOrNode className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          {description}
        </p>
      )}
      {action &&
        (typeof action === "object" &&
        "label" in action &&
        "onClick" in action ? (
          <Button onClick={action.onClick} className="mt-6">
            {action.label}
          </Button>
        ) : (
          <div className="mt-6">{action}</div>
        ))}
      {children}
    </div>
  );
}
