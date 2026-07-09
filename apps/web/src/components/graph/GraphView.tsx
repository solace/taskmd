import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type NodeMouseHandler,
  type Node,
  type Edge,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TaskNode } from "./TaskNode.tsx";
import { ContainerNode } from "./ContainerNode.tsx";
import { useTheme } from "../../hooks/use-theme.ts";

const nodeTypes: NodeTypes = { task: TaskNode, container: ContainerNode };

// Injected into the document so React Flow edge SVGs can reference url(#rf-diamond-filled)
function GraphMarkerDefs() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <marker id="rf-diamond-filled" viewBox="0 0 20 10" refX="0" refY="5"
                markerWidth="12" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 5 L 10 0 L 20 5 L 10 10 Z" fill="#6366f1" />
        </marker>
      </defs>
    </svg>
  );
}

const fitViewOptions = { minZoom: 0.5, maxZoom: 1, padding: 0.15 };

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  defaultViewport?: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
  // Called when a task node is clicked — caller decides navigate vs. focus
  onTaskClick?: (taskId: string) => void;
  // Called with nodeId on mouseenter, null on mouseleave
  onNodeHover?: (nodeId: string | null) => void;
}

export function GraphView({
  nodes,
  edges,
  defaultViewport,
  onViewportChange,
  onTaskClick,
  onNodeHover,
}: GraphViewProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const taskId = node.data.taskId as string | undefined;
      if (!taskId) return;
      if (onTaskClick) {
        onTaskClick(taskId);
      } else {
        navigate(`/tasks/${taskId}`);
      }
    },
    [navigate, onTaskClick],
  );

  const onNodeMouseEnter: NodeMouseHandler = useCallback(
    (_event, node) => {
      const taskId = node.data.taskId as string | undefined;
      if (taskId && onNodeHover) onNodeHover(taskId);
    },
    [onNodeHover],
  );

  const onNodeMouseLeave: NodeMouseHandler = useCallback(
    () => {
      if (onNodeHover) onNodeHover(null);
    },
    [onNodeHover],
  );

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-400">
        No tasks to display
      </div>
    );
  }

  const hasRestoredViewport = defaultViewport !== undefined;
  const dotColor = theme === "dark" ? "#374151" : "#e5e7eb";

  return (
    <>
      <GraphMarkerDefs />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView={!hasRestoredViewport}
        fitViewOptions={fitViewOptions}
        defaultViewport={hasRestoredViewport ? defaultViewport : undefined}
        onViewportChange={onViewportChange}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-right" />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color={dotColor} />
      </ReactFlow>
    </>
  );
}
