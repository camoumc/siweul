"use client";

import { useEffect, useState, useCallback } from "react";
import { Ban, ShieldCheck, Search } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  isBanned: boolean;
  isVerified: boolean;
  points: number;
  _count: { reports: number };
}

const ROLES = [
  "USER",
  "ENTREPRISE",
  "POLICE",
  "GENDARMERIE",
  "MAIRIE",
  "HOPITAL",
  "ASSOCIATION",
  "ADMIN",
  "SUPER_ADMIN",
];

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, [q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const patch = async (id: string, data: Record<string, unknown>) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    load();
  };

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full rounded-full border border-border py-2 pl-9 pr-4 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-2 text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Signalements</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Chargement...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text">
                    {u.name} {u.isVerified && <ShieldCheck size={13} className="ml-1 inline text-found" />}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => patch(u.id, { role: e.target.value })}
                      className="rounded-lg border border-border px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{u._count.reports}</td>
                  <td className="px-4 py-3 text-text-muted">{u.points}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => patch(u.id, { isVerified: !u.isVerified })}
                        className={`rounded-lg p-1.5 hover:bg-found/10 ${u.isVerified ? "text-found" : "text-text-muted"}`}
                        title="Vérifier"
                      >
                        <ShieldCheck size={14} />
                      </button>
                      <button
                        onClick={() => patch(u.id, { isBanned: !u.isBanned })}
                        className={`rounded-lg p-1.5 hover:bg-alert/10 ${u.isBanned ? "text-alert" : "text-text-muted"}`}
                        title={u.isBanned ? "Débannir" : "Bannir"}
                      >
                        <Ban size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
