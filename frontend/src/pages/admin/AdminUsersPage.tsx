import { useEffect, useState } from "react";
import { blockUser, listAdminUsers } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { User } from "../../types";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  async function load() {
    setUsers(await listAdminUsers());
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <Card>
      <h2 className="mb-4 font-bold">Пользователи</h2>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border p-3 text-sm">
            <div>
              <strong>{u.username}</strong> · {u.email}
              <p className="text-muted">{u.role}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => blockUser(u.id, u.is_active === false).then(load)}
            >
              {u.is_active === false ? "Разблокировать" : "Заблокировать"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
