import type { PresenceUser } from '@gv/shared';

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

/** Avatar row of collaborators currently in the document. */
export function PresenceBar({ users }: { users: PresenceUser[] }) {
  if (users.length === 0) return null;
  return (
    <div className="gv-presence" data-testid="presence" title={users.map((u) => u.name).join(', ')}>
      {users.map((u) => (
        <span
          key={u.deviceId}
          className="gv-avatar"
          style={{ background: u.color }}
          title={u.name}
        >
          {initials(u.name)}
        </span>
      ))}
      <span className="gv-muted-text gv-presence-count" data-testid="presence-count">
        {users.length} online
      </span>
    </div>
  );
}
