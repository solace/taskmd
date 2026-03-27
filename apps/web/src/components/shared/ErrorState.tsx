interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

function isConnectionError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    error instanceof TypeError &&
    (msg.includes("fetch") || msg.includes("network"))
  ) || msg.includes("failed to fetch");
}

function isProjectPathError(error: Error): boolean {
  return error.message.includes("project path does not exist");
}

function parseProjectPath(error: Error): string | null {
  const match = error.message.match(/project path does not exist: (.+)/);
  return match?.[1] ?? null;
}

function getErrorInfo(error: Error): { title: string; message: string; variant: "red" | "amber" } {
  if (isConnectionError(error)) {
    return {
      title: "Cannot connect to server",
      message: "The taskmd server is not reachable. Make sure it's running and try again.",
      variant: "red",
    };
  }
  if (isProjectPathError(error)) {
    const path = parseProjectPath(error);
    return {
      title: "Project path not found",
      message: path
        ? `The directory ${path} does not exist or is not accessible. Check that the project path is correct in your global registry.`
        : "The selected project's directory does not exist. Check that the project path is correct in your global registry.",
      variant: "amber",
    };
  }
  return {
    title: "Something went wrong",
    message: error.message,
    variant: "red",
  };
}

const variantStyles = {
  red: {
    border: "border-red-200 dark:border-red-800",
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-500 dark:text-red-400",
    title: "text-red-800 dark:text-red-300",
    message: "text-red-700 dark:text-red-400",
    button: "text-red-700 border-red-300 hover:bg-red-50 dark:text-red-300 dark:border-red-700 dark:hover:bg-gray-700",
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "text-amber-500 dark:text-amber-400",
    title: "text-amber-800 dark:text-amber-300",
    message: "text-amber-700 dark:text-amber-400",
    button: "text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-gray-700",
  },
};

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { title, message, variant } = getErrorInfo(error);
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4 max-w-lg`}>
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} mt-0.5 shrink-0`}>
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0 mb-2">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${styles.message}`}>
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 px-3 py-1.5 text-sm font-medium bg-white border rounded-md transition-colors dark:bg-gray-800 ${styles.button}`}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
