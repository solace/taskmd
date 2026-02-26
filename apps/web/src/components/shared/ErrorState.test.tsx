import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "./ErrorState.tsx";

describe("ErrorState", () => {
  it("renders a generic error message", () => {
    render(<ErrorState error={new Error("Something broke")} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("renders a connection error message for fetch failures", () => {
    const error = new TypeError("Failed to fetch");
    render(<ErrorState error={error} />);
    expect(screen.getByText("Cannot connect to server")).toBeInTheDocument();
  });

  it("renders a retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(
      <ErrorState error={new Error("fail")} onRetry={onRetry} />,
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("does not render a retry button when onRetry is not provided", () => {
    render(<ErrorState error={new Error("fail")} />);
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorState error={new Error("fail")} onRetry={onRetry} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
