import { useEffect, useState } from 'react';
import type { PresenceUser } from '@gv/shared';
import type { Awareness } from '@gv/sync-providers';

/** Distinct collaborators currently present in the document (incl. self). */
export function usePresence(awareness?: Awareness): PresenceUser[] {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!awareness) {
      setUsers([]);
      return;
    }
    const update = () => {
      const seen = new Map<string, PresenceUser>();
      awareness.getStates().forEach((state) => {
        const u = (state as { user?: PresenceUser }).user;
        if (u?.deviceId) seen.set(u.deviceId, u);
      });
      setUsers([...seen.values()]);
    };
    awareness.on('change', update);
    update();
    return () => awareness.off('change', update);
  }, [awareness]);

  return users;
}
