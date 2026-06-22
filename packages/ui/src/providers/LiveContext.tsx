import { createContext, useContext, type ReactNode } from 'react';
import type { PresenceUser } from '@gv/shared';
import type { Awareness } from '@gv/sync-providers';

export interface LiveValue {
  awareness?: Awareness;
  user?: PresenceUser;
}

const LiveContext = createContext<LiveValue>({});

/** Provides the live collaboration awareness + local identity to the editor. */
export function LiveProvider({ value, children }: { value: LiveValue; children: ReactNode }) {
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive(): LiveValue {
  return useContext(LiveContext);
}
