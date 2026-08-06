"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Loader2,
  CheckCheck,
  Trash2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  XCircle,
  Info,
} from "lucide-react";

interface Notif {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  type: string;
  createdAt: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  MATCH_TROUVE: Sparkles,
  NOUVEAU_MESSAGE: MessageSquare,
  REPORT_APPROUVE: ShieldCheck,
  REPORT_REJETE: XCircle,
  SYSTEME: Info,
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadFirst = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications?limit=20");
    if (res.ok) {
      const data = await res.json();
      setNotifs(data.notifications);
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    }
    setLoading(false);
  };

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    const res = await fetch(`/api/notifications?limit=20&cursor=${cursor}`);
    if (res.ok) {
      const data = await res.json();
      setNotifs((prev) => [...prev, ...data.notifications]);
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFirst();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearRead = async () => {
    if (!confirm("Supprimer toutes les notifications déjà lues ?")) return;
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifs((prev) => prev.filter((n) => !n.read));
  };

  const deleteOne = async (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="text-signal" size={24} />
          <h1 className="font-display text-2xl font-semibold text-text">Notifications</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-paper-2"
          >
            <CheckCheck size={13} /> Tout marquer lu
          </button>
          <button
            onClick={clearRead}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-paper-2"
          >
            <Trash2 size={13} /> Effacer les lues
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      ) : notifs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-text-muted">
          Aucune notification pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Info;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-2xl border border-border bg-white p-4 ${
                  n.read ? "opacity-60" : ""
                }`}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-2 text-signal">
                  <Icon size={15} />
                </span>
                <Link href={n.link ?? "/notifications"} className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text">{n.title}</p>
                  <p className="text-sm text-text-muted">{n.body}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {new Date(n.createdAt).toLocaleString("fr-FR")}
                  </p>
                </Link>
                <button
                  onClick={() => deleteOne(n.id)}
                  className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-paper-2 hover:text-alert"
                  aria-label="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}

          {hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium text-text hover:bg-paper-2 disabled:opacity-60"
              >
                {loadingMore ? "Chargement..." : "Charger plus"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
