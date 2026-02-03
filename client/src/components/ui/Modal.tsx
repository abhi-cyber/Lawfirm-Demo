import {type ReactNode, useEffect, useCallback} from "react";
import {createPortal} from "react-dom";
import {X} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-50 w-full rounded-xl bg-white shadow-xl",
          "dark:bg-slate-900 dark:border dark:border-slate-800",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto",
          sizeClasses[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 pb-0 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex-1 min-w-0 pr-2">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 flex-shrink-0"
                aria-label="Close modal">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({children, className}: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100 dark:border-slate-800",
        "-mx-4 md:-mx-6 -mb-4 md:-mb-6 px-4 md:px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl",
        className,
      )}>
      {children}
    </div>
  );
}
