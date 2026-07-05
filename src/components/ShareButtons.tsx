"use client";

import { Share2, MessageCircle, Send, Link2 } from "lucide-react";
import { useState } from "react";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

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
