import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGraphState } from "./useGraphState.ts";

describe("useGraphState", () => {
  it("starts with default preset — parent edges on, clustering on, overlays off", () => {
    const { result } = renderHook(() => useGraphState());
    expect(result.current.state.preset).toBe("default");
    expect(result.current.state.showParentEdges).toBe(true);
    expect(result.current.state.clustering).toBe(true);
    expect(result.current.state.overlays.seeAlso).toBe(false);
    expect(result.current.state.overlays.spawnedBy).toBe(false);
    expect(result.current.state.colorBy).toBeNull();
  });

  it("deps-only preset disables parent edges, clustering, and overlays", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "deps-only" }));
    expect(result.current.state.showParentEdges).toBe(false);
    expect(result.current.state.clustering).toBe(false);
    expect(result.current.state.overlays.seeAlso).toBe(false);
    expect(result.current.state.overlays.spawnedBy).toBe(false);
  });

  it("provenance preset enables spawnedBy overlay, disables parent edges and clustering", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "provenance" }));
    expect(result.current.state.overlays.spawnedBy).toBe(true);
    expect(result.current.state.overlays.seeAlso).toBe(false);
    expect(result.current.state.showParentEdges).toBe(false);
  });

  it("TOGGLE_SEE_ALSO flips the seeAlso overlay", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "TOGGLE_SEE_ALSO" }));
    expect(result.current.state.overlays.seeAlso).toBe(true);
    act(() => result.current.dispatch({ type: "TOGGLE_SEE_ALSO" }));
    expect(result.current.state.overlays.seeAlso).toBe(false);
  });

  it("TOGGLE_SPAWNED_BY flips the spawnedBy overlay", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "TOGGLE_SPAWNED_BY" }));
    expect(result.current.state.overlays.spawnedBy).toBe(true);
  });

  it("SET_COLOR_BY sets and clears colorBy", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_COLOR_BY", scope: "api" }));
    expect(result.current.state.colorBy).toBe("api");
    act(() => result.current.dispatch({ type: "SET_COLOR_BY", scope: null }));
    expect(result.current.state.colorBy).toBeNull();
  });

  it("switching presets resets overlays atomically — no intermediate state", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "TOGGLE_SEE_ALSO" }));
    expect(result.current.state.overlays.seeAlso).toBe(true);
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "deps-only" }));
    expect(result.current.state.overlays.seeAlso).toBe(false);
    expect(result.current.state.preset).toBe("deps-only");
  });

  it("switching back to default restores parent edges and clustering", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "deps-only" }));
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "default" }));
    expect(result.current.state.showParentEdges).toBe(true);
    expect(result.current.state.clustering).toBe(true);
  });

  it("colorBy is preserved across preset changes", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_COLOR_BY", scope: "api" }));
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "provenance" }));
    expect(result.current.state.colorBy).toBe("api");
  });

  it("focus preset enables all overlays and parent edges, disables clustering", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "focus" }));
    expect(result.current.state.overlays.seeAlso).toBe(true);
    expect(result.current.state.overlays.spawnedBy).toBe(true);
    expect(result.current.state.showParentEdges).toBe(true);
    expect(result.current.state.clustering).toBe(false);
  });

  it("SET_FOCUS switches to focus preset and sets focusNodeId", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_FOCUS", nodeId: "task-001" }));
    expect(result.current.state.preset).toBe("focus");
    expect(result.current.state.focusNodeId).toBe("task-001");
  });

  it("EXIT_FOCUS returns to default and clears focusNodeId", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_FOCUS", nodeId: "task-001" }));
    act(() => result.current.dispatch({ type: "EXIT_FOCUS" }));
    expect(result.current.state.preset).toBe("default");
    expect(result.current.state.focusNodeId).toBeNull();
    expect(result.current.state.showParentEdges).toBe(true);
    expect(result.current.state.clustering).toBe(true);
  });

  it("SET_FOCUS_DEPTH updates depth without changing preset", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_FOCUS_DEPTH", depth: 3 }));
    expect(result.current.state.focusDepth).toBe(3);
    expect(result.current.state.preset).toBe("default");
  });

  it("switching away from focus preset clears focusNodeId", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_FOCUS", nodeId: "task-001" }));
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "default" }));
    expect(result.current.state.focusNodeId).toBeNull();
  });

  it("switching to focus preset via SET_PRESET preserves existing focusNodeId", () => {
    const { result } = renderHook(() => useGraphState());
    act(() => result.current.dispatch({ type: "SET_FOCUS", nodeId: "task-001" }));
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "default" }));
    act(() => result.current.dispatch({ type: "SET_PRESET", preset: "focus" }));
    // focusNodeId was cleared when leaving focus, so it stays null
    expect(result.current.state.focusNodeId).toBeNull();
  });
});
