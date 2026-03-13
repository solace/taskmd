import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { BoardGroup } from "../../api/types.ts";
import { BoardColumn } from "./BoardColumn.tsx";

const draggableGroupByFields = ["status", "priority", "effort", "type"];

interface BoardViewProps {
  groups: BoardGroup[];
  groupBy: string;
  readonly: boolean;
  onTaskMove?: (taskId: string, sourceGroup: string, targetGroup: string) => void;
  showPhase?: boolean;
}

export function BoardView({ groups, groupBy, readonly, onTaskMove, showPhase = true }: BoardViewProps) {
  const canDrag = !readonly && draggableGroupByFields.includes(groupBy);
  const navigate = useNavigate();
  const [focusedCol, setFocusedCol] = useState(-1);
  const [focusedCard, setFocusedCard] = useState(-1);

  const handleBoardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const colCount = groups.length;
      if (colCount === 0) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextCol = focusedCol < colCount - 1 ? focusedCol + 1 : 0;
        setFocusedCol(nextCol);
        const cardCount = groups[nextCol].tasks.length;
        setFocusedCard(cardCount > 0 ? Math.min(focusedCard, cardCount - 1) : -1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevCol = focusedCol > 0 ? focusedCol - 1 : colCount - 1;
        setFocusedCol(prevCol);
        const cardCount = groups[prevCol].tasks.length;
        setFocusedCard(cardCount > 0 ? Math.min(focusedCard, cardCount - 1) : -1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (focusedCol < 0) {
          setFocusedCol(0);
          setFocusedCard(groups[0].tasks.length > 0 ? 0 : -1);
          return;
        }
        const cardCount = groups[focusedCol]?.tasks.length ?? 0;
        if (cardCount > 0) {
          setFocusedCard((prev) => (prev < cardCount - 1 ? prev + 1 : 0));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (focusedCol < 0) return;
        const cardCount = groups[focusedCol]?.tasks.length ?? 0;
        if (cardCount > 0) {
          setFocusedCard((prev) => (prev > 0 ? prev - 1 : cardCount - 1));
        }
      } else if (e.key === "Enter") {
        if (focusedCol >= 0 && focusedCard >= 0) {
          const task = groups[focusedCol]?.tasks[focusedCard];
          if (task) {
            e.preventDefault();
            navigate(`/tasks/${task.id}`);
          }
        }
      }
    },
    [groups, focusedCol, focusedCard, navigate],
  );

  return (
    <div
      className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-4"
      tabIndex={0}
      role="grid"
      aria-label="Task board"
      onKeyDown={handleBoardKeyDown}
      onBlur={() => { setFocusedCol(-1); setFocusedCard(-1); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {groups.map((g, colIdx) => (
        <BoardColumn
          key={g.group}
          group={g}
          canDrag={canDrag}
          onTaskDrop={onTaskMove}
          focusedCardIndex={colIdx === focusedCol ? focusedCard : -1}
          showPhase={showPhase}
        />
      ))}
    </div>
  );
}
