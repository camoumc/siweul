"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Search, PlusCircle, LayoutDashboard, ShieldCheck } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full border border-signal siweul-radar-ring" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-badge.png" alt="SIWEUL" className="h-9 w-9 rounded-full" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            SIWEUL
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/rechercher" className="text-sm font-medium text-white/80 hover:text-white">
            Rechercher
          </Link>
          <Link href="/carte" className="text-sm font-medium text-white/80 hover:text-white">
            Carte
          </Link>
          <Link href="/classement" className="text-sm font-medium text-white/80 hover:text-white">
            Classement
          </Link>
          <Link href="/premium" className="text-sm font-medium text-white/80 hover:text-white">
            Premium
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <NotificationBell />
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
              <Link
                href="/tableau-de-bord"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                <LayoutDashboard size={16} /> Mon espace
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-white/60 hover:text-white"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink hover:bg-white/90"
              >
                Créer un compte
              </Link>
            </>
          )}
          <Link
            href="/signaler"
            className="flex items-center gap-1.5 rounded-full bg-signal px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-signal-dark"
          >
            <PlusCircle size={16} /> Signaler
          </Link>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            <Link href="/rechercher" className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">
              <Search size={16} /> Rechercher
            </Link>
            <Link href="/carte" className="rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">
              Carte
            </Link>
            <Link href="/classement" className="rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">
              Classement
            </Link>
            <Link href="/signaler" className="mt-2 flex items-center gap-2 rounded-lg bg-signal px-3 py-2 font-semibold text-white">
              <PlusCircle size={16} /> Signaler
            </Link>
            {status === "authenticated" ? (
              <>
                <Link href="/tableau-de-bord" className="rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">
                  Mon espace
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg px-3 py-2 text-left text-white/60 hover:bg-white/10"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/connexion" className="rounded-lg px-3 py-2 text-white/90 hover:bg-white/10">
                  Connexion
                </Link>
                <Link href="/inscription" className="rounded-lg bg-white px-3 py-2 font-semibold text-ink">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
