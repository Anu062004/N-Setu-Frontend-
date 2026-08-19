import { createContext, useContext, useMemo, useState } from "react";
import type { Channel, NeedRequest, TaxCategory } from "../../lib/types";

export interface IntakeState {
  step: number;
  taxonomyCode: TaxCategory | null;
  state: string;
  district: string;
  language: string;
  modePref: Channel;
  feeCeiling: number | null;
  selfDeclaredSection12: string | null;
  urgency: "NORMAL" | "URGENT";
  needId: string | null;
}

interface IntakeContextValue {
  state: IntakeState;
  setStep: (step: number) => void;
  setField: <K extends keyof IntakeState>(key: K, value: IntakeState[K]) => void;
  submit: () => Promise<NeedRequest & { selfDeclaredSection12: string | null }>;
}

const IntakeContext = createContext<IntakeContextValue | null>(null);

export function IntakeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IntakeState>({
    step: 0,
    taxonomyCode: null,
    state: "Bihar",
    district: "",
    language: "hi",
    modePref: "APP",
    feeCeiling: null,
    selfDeclaredSection12: null,
    urgency: "NORMAL",
    needId: null,
  });

  const value = useMemo<IntakeContextValue>(
    () => ({
      state,
      setStep: (step) => setState((s) => ({ ...s, step })),
      setField: (key, val) => setState((s) => ({ ...s, [key]: val })),
      submit: async () => {
        const payload: NeedRequest = {
          id: `req_${Math.random().toString(36).slice(2, 10)}`,
          taxonomyCode: state.taxonomyCode ?? "OTHER",
          district: state.district || "Patna",
          language: state.language,
          modePref: state.modePref,
          feeCeiling: state.feeCeiling,
          urgency: state.urgency,
        };
        const need = { ...payload, selfDeclaredSection12: state.selfDeclaredSection12 };
        await new Promise((r) => setTimeout(r, 400));
        setState((s) => ({ ...s, needId: payload.id }));
        return need;
      },
    }),
    [state],
  );

  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
}

export function useIntake() {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error("useIntake must be used inside IntakeProvider");
  return ctx;
}