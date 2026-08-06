"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";

interface Notif {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return;
      const data = await res.json();
      setUnread(data.count);
    } catch {
      // silencieux
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCount();
    const interval = setInterval(loadCount, 20000);
    return () => clearInterval(interval);
  }, [loadCount]);

  const openDropdown = async () => {
    setOpen((o) => !o);
    if (!open) {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications?limit=8");
        if (res.ok) {
          const data = await res.json();
          setNotifs(data.notifications);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openDropdown}
        className="relative rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold text-text">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-found">
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={18} className="animate-spin text-text-muted" />
              </div>
            ) : notifs.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-text-muted">
                Aucune notification pour l&apos;instant.
              </p>
            ) : (
              notifs.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "/notifications"}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-2 text-sm hover:bg-paper-2 ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <p className="font-semibold text-text">{n.title}</p>
                  <p className="line-clamp-2 text-text-muted">{n.body}</p>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-3 py-2 text-center text-xs font-semibold text-signal hover:bg-paper-2"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
