"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2 } from "lucide-react";

interface Msg {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

export default function ChatBox({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) setMessages(await res.json());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      await load();
    }
    setSending(false);
  };

  return (
    <div className="flex h-[65vh] flex-col rounded-3xl border border-border bg-white shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-text-muted">
            Démarrez la conversation en toute sécurité, sans partager de numéro de téléphone.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender.id === session?.user?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? "bg-signal text-white" : "bg-paper-2 text-text"
                  }`}
                >
                  {!isMine && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.sender.name}</p>}
                  <p>{m.content}</p>
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
