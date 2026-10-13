"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Asset, Transaction, Milestone, ActivityEvent } from "./types";
import { DEMO_ASSET, DEMO_TRANSACTION } from "./demo-data";

interface DemoState {
  assets: Asset[];
  transactions: Transaction[];
}

interface DemoContextValue extends DemoState {
  getTransaction: (id: string) => Transaction | undefined;
  updateMilestoneDate: (txnId: string, milestoneId: string, newDate: string) => void;
  addActivity: (txnId: string, event: ActivityEvent) => void;
  addTransaction: (txn: Transaction) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>({
    assets: [DEMO_ASSET],
    transactions: [DEMO_TRANSACTION],
  });

  const getTransaction = useCallback(
    (id: string) => state.transactions.find((t) => t.id === id),
    [state.transactions]
  );

  const updateMilestoneDate = useCallback((txnId: string, milestoneId: string, newDate: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => {
        if (t.id !== txnId) return t;
        return {
          ...t,
          milestones: t.milestones.map((m) =>
            m.id === milestoneId ? { ...m, targetDate: newDate } : m
          ),
        };
      }),
    }));
  }, []);

  const addActivity = useCallback((txnId: string, event: ActivityEvent) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => {
        if (t.id !== txnId) return t;
        return { ...t, activity: [...t.activity, event] };
      }),
    }));
  }, []);

  const addTransaction = useCallback((txn: Transaction) => {
    setState((prev) => ({
      ...prev,
      transactions: [...prev.transactions, txn],
    }));
  }, []);

  return (
    <DemoContext.Provider
      value={{ ...state, getTransaction, updateMilestoneDate, addActivity, addTransaction }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
