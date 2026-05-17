"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ChildMood, TimeAvailable } from "@/types";

/**
 * Persisted record of the last activity-pick the parent made. Lets us
 * resume the in-progress flow if they close and reopen the app mid-session,
 * and serves as a fallback for the /activity/[id] route when URL query
 * params are missing.
 *
 * `date` (YYYY-MM-DD) lets the consumer ignore stale picks from prior days.
 */
export interface LastPickContext {
  childId: string;
  activityId: string;
  time: TimeAvailable;
  mood: ChildMood;
  date: string;
}

export interface AppState {
  parentId: string | null;
  activeChildId: string | null;
  lastPickContext: LastPickContext | null;

  setParent: (id: string) => void;
  setActiveChild: (id: string) => void;
  setLastPickContext: (ctx: LastPickContext) => void;
  clearLastPickContext: () => void;
  reset: () => void;
}

const INITIAL: Pick<AppState, "parentId" | "activeChildId" | "lastPickContext"> = {
  parentId: null,
  activeChildId: null,
  lastPickContext: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...INITIAL,
      setParent: (id) => set({ parentId: id }),
      setActiveChild: (id) => set({ activeChildId: id }),
      setLastPickContext: (ctx) => set({ lastPickContext: ctx }),
      clearLastPickContext: () => set({ lastPickContext: null }),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: "fokus_app_state",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => ({
        parentId: state.parentId,
        activeChildId: state.activeChildId,
        lastPickContext: state.lastPickContext,
      }),
    },
  ),
);
