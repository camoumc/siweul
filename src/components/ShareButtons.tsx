"use client";

import { Share2, MessageCircle, Send, Link2 } from "lucide-react";
import { useState } from "react";

export default function ShareButtons({
  title,
  url,
  reportId,
}: {
  title: string;
  url: string;
  reportId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const trackShare = () => {
    if (!reportId) return;
    // Attribution de points "au clic" (best-effort, non anti-fraude) — simple
    // levier de gamification pour encourager le relais des annonces.
    fetch("/api/points/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    }).catch(() => {});
  };

  const links = [
    {
      label: "Facebook",
      icon: Share2,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackShare}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:border-signal hover:text-signal"
          aria-label={`Partager sur ${l.label}`}
        >
          <l.icon size={16} />
        </a>
      ))}
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          trackShare();
          setTimeout(() => setCopied(false), 2000);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:border-signal hover:text-signal"
        aria-label="Copier le lien"
      >
        <Link2 size={16} />
      </button>
      {copied && <span className="text-xs text-found">Lien copié !</span>}
    </div>
  );
}
