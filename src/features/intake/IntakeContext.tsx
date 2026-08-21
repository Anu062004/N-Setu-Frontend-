import { createContext, useContext, useMemo, useState } from "react";
import type { Channel, EligibilityDecision, TaxCategory } from "../../lib/types";
import { api } from "../../lib/api";
import type { NeedRequest } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";

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
  submit: () => Promise<{
    need: NeedRequest & { selfDeclaredSection12: string | null };
    decision: EligibilityDecision | null;
  }>;
}

const IntakeContext = createContext<IntakeContextValue | null>(null);

export function IntakeProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
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
        if (!session?.userId) throw new Error("Not signed in");
        const { need, decision } = await api.createNeed({
          citizenUserId: session.userId,
          taxonomyCode: state.taxonomyCode ?? "OTHER",
          district: state.district || "Patna",
          language: state.language,
          modePreference: state.modePref,
          channel: state.modePref,
          feeCeiling: state.feeCeiling,
          urgency: state.urgency,
          ...(state.selfDeclaredSection12
            ? { selfDeclaredSection12Category: state.selfDeclaredSection12 }
            : {}),
        });
        setState((s) => ({ ...s, needId: need.id }));
        return { need, decision };
      },
    }),
    [state, session?.userId],
  );

  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
}

export function useIntake() {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error("useIntake must be used inside IntakeProvider");
  return ctx;
}
