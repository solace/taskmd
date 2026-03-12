import { createContext, useContext, useState, type ReactNode } from "react";

interface PhaseContextValue {
  phase: string | null;
  setPhase: (phase: string | null) => void;
}

const PhaseContext = createContext<PhaseContextValue>({
  phase: null,
  setPhase: () => {},
});

export function PhaseProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<string | null>(null);
  return (
    <PhaseContext.Provider value={{ phase, setPhase }}>
      {children}
    </PhaseContext.Provider>
  );
}

export function usePhase() {
  return useContext(PhaseContext);
}
