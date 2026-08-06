"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2, ChevronUp, Check, CheckCheck } from "lucide-react";

interface Msg {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: { id: string; name: string };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default function ChatBox({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadLatest = useCallback(async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      setHasMore(data.hasMore);
    }
    setInitialLoading(false);
  }, [conversationId]);

  const loadOlder = async () => {
    if (messages.length === 0) return;
    setLoadingOlder(true);
    const container = scrollRef.current;
    const prevHeight = container?.scrollHeight ?? 0;

    const res = await fetch(
      `/api/conversations/${conversationId}/messages?before=${messages[0].id}`
    );
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      // Conserve la position de scroll après insertion des anciens messages en haut
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevHeight;
      });
    }
    setLoadingOlder(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLatest();
    const interval = setInterval(loadLatest, 5000);
    return () => clearInterval(interval);
  }, [loadLatest]);

  useEffect(() => {
    if (!initialLoading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      setText("");
      await loadLatest();
    }
    setSending(false);
  };

  let lastDay = "";

  return (
    <div className="flex h-[65vh] flex-col rounded-3xl border border-border bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto p-5">
        {hasMore && (
          <div className="mb-3 text-center">
            <button
              onClick={loadOlder}
              disabled={loadingOlder}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-paper-2 disabled:opacity-60"
            >
              {loadingOlder ? <Loader2 size={12} className="animate-spin" /> : <ChevronUp size={12} />}
              Messages précédents
            </button>
          </div>
        )}

        {initialLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-text-muted" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-text-muted">
            Démarrez la conversation en toute sécurité, sans partager de numéro de téléphone.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender.id === session?.user?.id;
            const day = dayLabel(m.createdAt);
            const showDaySeparator = day !== lastDay;
            lastDay = day;

            return (
              <div key={m.id}>
                {showDaySeparator && (
                  <div className="my-4 flex items-center justify-center">
                    <span className="rounded-full bg-paper-2 px-3 py-1 text-[11px] font-medium text-text-muted">
                      {day}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-2 py-1 ${isMine ? "justify-end" : "justify-start"}`}>
                  {!isMine && (
                    <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                      {initials(m.sender.name)}
                    </span>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMine
                        ? "rounded-br-sm bg-signal text-white"
                        : "rounded-bl-sm bg-paper-2 text-text"
                    }`}
                  >
                    {!isMine && <p className="mb-0.5 text-xs font-semibold text-found">{m.sender.name}</p>}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <div
                      className={`mt-1 flex items-center gap-1 text-[10px] ${
                        isMine ? "justify-end text-white/70" : "text-text-muted"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      {isMine && (m.readAt ? <CheckCheck size={12} /> : <Check size={12} />)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Écrire un message..."
          maxLength={2000}
          className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
        <button
          onClick={send}
          disabled={sending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-signal text-white hover:bg-signal-dark disabled:opacity-60"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
