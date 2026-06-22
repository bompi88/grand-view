import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createUndoController, type UndoController } from '@gv/core';
import { useDoc } from './DocContext.js';

interface UndoValue {
  controller: UndoController;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoContext = createContext<UndoValue | null>(null);

export function UndoProvider({ children }: { children: ReactNode }) {
  const doc = useDoc();
  const controller = useMemo(() => createUndoController(doc), [doc]);
  const [state, setState] = useState({ canUndo: false, canRedo: false });

  useEffect(() => {
    const sync = () =>
      setState({ canUndo: controller.canUndo(), canRedo: controller.canRedo() });
    controller.manager.on('stack-item-added', sync);
    controller.manager.on('stack-item-popped', sync);
    controller.manager.on('stack-cleared', sync);
    sync();
    return () => {
      controller.destroy();
    };
  }, [controller]);

  const value = useMemo(
    () => ({ controller, canUndo: state.canUndo, canRedo: state.canRedo }),
    [controller, state],
  );
  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>;
}

export function useUndo(): UndoValue {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error('useUndo must be used within an <UndoProvider>');
  return ctx;
}
