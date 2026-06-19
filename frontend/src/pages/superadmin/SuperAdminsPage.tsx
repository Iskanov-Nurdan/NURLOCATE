import { ShieldCheck, ShieldOff, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { grantStaff, listAdminUsers, listStaff, revokeStaff } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Avatar } from "../../components/ui/Avatar";
import { RoleBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import type { User } from "../../types";

export function SuperAdminsPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([listStaff(), listAdminUsers()]);
      setStaff(s);
      setUsers(u.filter((x) => !x.is_staff));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function handleGrant() {
    if (!userId) return;
    setGranting(true);
    try {
      await grantStaff(Number(userId));
      setUserId("");
      await load();
    } finally {
      setGranting(false);
    }
  }

  async function handleRevoke(id: number) {
    setRevoking(id);
    try {
      await revokeStaff(id);
      await load();
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px] animate-fade-in">
      <Card noPadding>
        <CardHeader>
          <div>
            <h2 className="font-semibold">Администраторы</h2>
            <p className="text-xs text-muted">{staff.length} с правами staff</p>
          </div>
        </CardHeader>

        {loading ? (
          <CardBody><SkeletonTable rows={4} cols={3} /></CardBody>
        ) : staff.length === 0 ? (
          <CardBody>
            <EmptyState icon={Users} title="Администраторов нет" description="Назначьте первого администратора справа" />
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs font-medium text-muted">Пользователь</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted">Роль</th>
                  <th className="px-5 py-3 text-xs font-medium text-muted" />
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-white/[0.025]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.username} size={8} />
                        <div>
                          <p className="font-medium">{u.username}</p>
                          <p className="text-xs text-muted">{u.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!u.is_superuser && (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={revoking === u.id}
                          onClick={() => handleRevoke(u.id)}
                        >
                          <ShieldOff size={13} /> Отозвать
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card noPadding>
        <CardHeader>
          <div>
            <h2 className="font-semibold">Назначить</h2>
            <p className="text-xs text-muted">Выдать права администратора</p>
          </div>
          <ShieldCheck size={16} className="text-muted" />
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Select
              label="Пользователь"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              options={[{ value: "", label: "Выберите пользователя..." }, ...users.map((u) => ({ value: String(u.id), label: u.username }))]}
            />
            <Button
              className="w-full"
              disabled={!userId}
              loading={granting}
              onClick={handleGrant}
            >
              <UserPlus size={15} />
              {granting ? "Назначаем..." : "Назначить администратором"}
            </Button>
            <p className="text-xs text-muted">
              Администратор получит доступ к панели управления пользователями и устройствами.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
