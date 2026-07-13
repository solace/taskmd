import { useReducer } from "react";

export type Preset = "default" | "deps-only" | "provenance" | "focus";

export interface GraphState {
  preset: Preset;
  overlays: { seeAlso: boolean; spawnedBy: boolean };
  showParentEdges: boolean;
  clustering: boolean;
  colorBy: string | null;
  focusNodeId: string | null;
  focusDepth: 1 | 2 | 3;
}

export type GraphAction =
  | { type: "SET_PRESET"; preset: Preset }
  | { type: "TOGGLE_SEE_ALSO" }
  | { type: "TOGGLE_SPAWNED_BY" }
  | { type: "SET_COLOR_BY"; scope: string | null }
  | { type: "SET_FOCUS"; nodeId: string }
  | { type: "EXIT_FOCUS" }
  | { type: "SET_FOCUS_DEPTH"; depth: 1 | 2 | 3 };

const PRESET_CONFIG: Record<Preset, Pick<GraphState, "overlays" | "showParentEdges" | "clustering">> = {
  "default":    { overlays: { seeAlso: false, spawnedBy: false }, showParentEdges: true,  clustering: true  },
  "deps-only":  { overlays: { seeAlso: false, spawnedBy: false }, showParentEdges: false, clustering: false },
  "provenance": { overlays: { seeAlso: false, spawnedBy: true  }, showParentEdges: false, clustering: false },
  "focus":      { overlays: { seeAlso: true,  spawnedBy: true  }, showParentEdges: true,  clustering: false },
};

const INITIAL_STATE: GraphState = {
  preset: "default",
  ...PRESET_CONFIG["default"],
  colorBy: null,
  focusNodeId: null,
  focusDepth: 2,
};

function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case "SET_PRESET":
      return {
        ...state,
        preset: action.preset,
        ...PRESET_CONFIG[action.preset],
        focusNodeId: action.preset === "focus" ? state.focusNodeId : null,
      };
    case "TOGGLE_SEE_ALSO":
      return { ...state, overlays: { ...state.overlays, seeAlso: !state.overlays.seeAlso } };
    case "TOGGLE_SPAWNED_BY":
      return { ...state, overlays: { ...state.overlays, spawnedBy: !state.overlays.spawnedBy } };
    case "SET_COLOR_BY":
      return { ...state, colorBy: action.scope };
    case "SET_FOCUS":
      return { ...state, preset: "focus", ...PRESET_CONFIG["focus"], focusNodeId: action.nodeId };
    case "EXIT_FOCUS":
      return { ...state, preset: "default", ...PRESET_CONFIG["default"], focusNodeId: null };
    case "SET_FOCUS_DEPTH":
      return { ...state, focusDepth: action.depth };
    default:
      return state;
  }
}

export function useGraphState() {
  const [state, dispatch] = useReducer(graphReducer, INITIAL_STATE);
  return { state, dispatch };
}
