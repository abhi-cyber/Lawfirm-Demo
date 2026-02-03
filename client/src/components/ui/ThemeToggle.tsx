import {Sun, Moon, Monitor} from "lucide-react";
import {useTheme} from "@/contexts/ThemeContext";
import {cn} from "@/lib/utils";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({showLabel = false, className}: ThemeToggleProps) {
  const {theme, setTheme} = useTheme();

  const options = [
    {value: "light" as const, icon: Sun, label: "Light"},
    {value: "dark" as const, icon: Moon, label: "Dark"},
    {value: "system" as const, icon: Monitor, label: "System"},
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800",
        className,
      )}>
      {options.map(({value, icon: Icon, label}) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            theme === value
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
          )}
          title={label}>
          <Icon className="h-4 w-4" />
          {showLabel && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

// Simple toggle button (just light/dark)
export function ThemeToggleSimple({className}: {className?: string}) {
  const {resolvedTheme, setTheme} = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100",
        "dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800",
        "transition-colors",
        className,
      )}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}>
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
