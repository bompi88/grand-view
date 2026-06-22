import { createContext, useContext, type ReactNode } from 'react';
import type { PlatformAdapter } from '@gv/platform-adapters';

const PlatformContext = createContext<PlatformAdapter | null>(null);

export function PlatformProvider({
  adapter,
  children,
}: {
  adapter: PlatformAdapter;
  children: ReactNode;
}) {
  return <PlatformContext.Provider value={adapter}>{children}</PlatformContext.Provider>;
}

/** Access the injected platform adapter. UI never imports a concrete adapter. */
export function usePlatform(): PlatformAdapter {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within a <PlatformProvider>');
  return ctx;
}
