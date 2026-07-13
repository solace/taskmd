import { memo } from "react";

type Variant = "phase" | "group";

interface ContainerNodeData {
  label: string;
  variant: Variant;
}

interface ContainerNodeProps {
  data: ContainerNodeData;
}

const VARIANT_STYLES: Record<Variant, { border: string; bg: string; text: string }> = {
  phase: {
    border: "border-indigo-300 dark:border-indigo-600",
    bg: "bg-indigo-50/40 dark:bg-indigo-900/10",
    text: "text-indigo-500 dark:text-indigo-400",
  },
  group: {
    border: "border-teal-300 dark:border-teal-600",
    bg: "bg-teal-50/40 dark:bg-teal-900/10",
    text: "text-teal-500 dark:text-teal-400",
  },
};

export const ContainerNode = memo(function ContainerNode({ data }: ContainerNodeProps) {
  const styles = VARIANT_STYLES[data.variant] ?? VARIANT_STYLES.phase;
  return (
    <div
      className={`absolute inset-0 rounded-md border border-dashed ${styles.border} ${styles.bg}`}
      style={{ pointerEvents: "none" }}
    >
      <span className={`absolute top-1.5 left-2 text-xs font-medium select-none ${styles.text}`}>
        {data.label}
      </span>
    </div>
  );
});
