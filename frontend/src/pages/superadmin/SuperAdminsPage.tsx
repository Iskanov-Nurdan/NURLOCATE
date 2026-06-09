import { useEffect, useState } from "react";
import { grantStaff, listAdminUsers, listStaff, revokeStaff } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import type { User } from "../../types";

export function SuperAdminsPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");

  async function load() {
    const [s, u] = await Promise.all([listStaff(), listAdminUsers()]);
    setStaff(s);
    setUsers(u.filter((x) => !x.is_staff));
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 font-bold">Администраторы</h2>
        <div className="space-y-2">
          {staff.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-card border border-border p-3 text-sm">
              <span>{u.username} {u.is_superuser ? "(super)" : ""}</span>
              {!u.is_superuser && (
                <Button variant="ghost" onClick={() => revokeStaff(u.id).then(load)}>Отозвать</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 font-bold">Назначить администратора</h2>
        <Select
          label="Пользователь"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          options={users.map((u) => ({ value: String(u.id), label: u.username }))}
        />
        <Button className="mt-3" disabled={!userId} onClick={() => grantStaff(Number(userId)).then(load)}>
          Назначить
        </Button>
      </Card>
    </div>
  );
}
