import { Search, UserX, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { blockUser, listAdminUsers } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { RoleBadge } from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Avatar } from "../../components/ui/Avatar";
import type { User } from "../../types";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [blocking, setBlocking] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      setUsers(await listAdminUsers());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function toggleBlock(u: User) {
    setBlocking(u.id);
    try {
      await blockUser(u.id, u.is_active === false);
      await load();
    } finally {
      setBlocking(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <Card noPadding className="animate-fade-in">
      <CardHeader>
        <div>
          <h2 className="font-semibold">Пользователи</h2>
          <p className="text-xs text-muted">{users.length} зарегистрировано</p>
        </div>
        <label className="flex h-9 w-56 items-center gap-2 rounded-card border border-border bg-surface px-3 text-sm text-muted">
          <Search size={14} />
          <input
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted/60"
            placeholder="Поиск по логину или email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </CardHeader>

      {loading ? (
        <CardBody>
          <SkeletonTable rows={6} cols={4} />
        </CardBody>
      ) : filtered.length === 0 ? (
        <CardBody>
          <EmptyState title="Пользователей не найдено" description="Попробуйте изменить поисковый запрос" />
        </CardBody>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-medium text-muted">Пользователь</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Email</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Роль</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Статус</th>
                <th className="px-5 py-3 text-xs font-medium text-muted" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} size={8} />
                      <div>
                        <p className="font-medium">{u.username}</p>
                        {(u.first_name || u.last_name) && (
                          <p className="text-xs text-muted">{[u.first_name, u.last_name].filter(Boolean).join(" ")}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{u.email || "—"}</td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${u.is_active !== false ? "bg-mint" : "bg-critical"}`} />
                      <span className={u.is_active !== false ? "text-mint" : "text-critical"}>
                        {u.is_active !== false ? "Активен" : "Заблокирован"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant={u.is_active === false ? "secondary" : "secondary"}
                      size="sm"
                      loading={blocking === u.id}
                      onClick={() => toggleBlock(u)}
                    >
                      {u.is_active === false ? (
                        <><UserCheck size={13} /> Разблокировать</>
                      ) : (
                        <><UserX size={13} /> Заблокировать</>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
