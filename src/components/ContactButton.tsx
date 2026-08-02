"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MessageCircle, Loader2 } from "lucide-react";

export default function ContactButton({ reportId, isOwner }: { reportId: string; isOwner: boolean }) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isOwner) return null;

  if (status === "unauthenticated") {
    return (
      <Link
        href="/connexion"
        className="flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-ink-2"
      >
        <MessageCircle size={16} /> Se connecter pour contacter
      </Link>
    );
  }

  const startConversation = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Impossible de démarrer la conversation.");
      return;
    }
    router.push(`/messagerie/${data.id}`);
  };

  return (
    <div>
      <button
        onClick={startConversation}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        Contacter en toute sécurité
      </button>
      {error && <p className="mt-2 text-sm text-alert">{error}</p>}
      <p className="mt-2 text-center text-xs text-text-muted">
        Aucune coordonnée personnelle n&apos;est partagée. Discutez via la messagerie SIWEUL.
      </p>
    </div>
  );
}
