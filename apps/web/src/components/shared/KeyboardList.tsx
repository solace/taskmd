import { useState, useCallback, type ReactNode } from "react";

interface KeyboardListProps {
  itemCount: number;
  onActivate: (index: number) => void;
  className?: string;
  role?: string;
  "aria-label"?: string;
  children: (focusedIndex: number) => ReactNode;
}

export function KeyboardList({
  itemCount,
  onActivate,
  className,
  role = "list",
  "aria-label": ariaLabel,
  children,
}: KeyboardListProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (itemCount === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
          break;
        }
        case "Home": {
          e.preventDefault();
          setFocusedIndex(0);
          break;
        }
        case "End": {
          e.preventDefault();
          setFocusedIndex(itemCount - 1);
          break;
        }
        case "Enter": {
          if (focusedIndex >= 0 && focusedIndex < itemCount) {
            e.preventDefault();
            onActivate(focusedIndex);
          }
          break;
        }
      }
    },
    [itemCount, focusedIndex, onActivate],
  );

  return (
    <div
      tabIndex={0}
      role={role}
      aria-label={ariaLabel}
      className={className}
      onKeyDown={handleKeyDown}
      onBlur={() => setFocusedIndex(-1)}
    >
      {children(focusedIndex)}
    </div>
  );
}
