import Link from "next/link";
import { REPORT_TYPE_ORDER, REPORT_TYPES } from "@/lib/reportConfig";
import { getServerDictionary } from "@/i18n/server";

export default async function Footer() {
  const { dict } = await getServerDictionary();

  return (
    <footer className="border-t border-white/10 bg-ink text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-badge.png" alt="SIWEUL" className="h-8 w-8 rounded-full" />
            <span className="font-display text-lg font-semibold text-white">SIWEUL</span>
          </div>
          <p className="mt-3 max-w-xs text-sm">{dict.footer.tagline}</p>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">{dict.footer.modules}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {REPORT_TYPE_ORDER.map((t) => (
              <li key={t}>
                <Link href={`/rechercher?type=${t}`} className="hover:text-white">
                  {REPORT_TYPES[t].labelPlural}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">{dict.footer.platform}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/carte" className="hover:text-white">{dict.footer.interactiveMap}</Link></li>
            <li><Link href="/classement" className="hover:text-white">{dict.footer.communityLeaderboard}</Link></li>
            <li><Link href="/premium" className="hover:text-white">{dict.footer.premiumSubscription}</Link></li>
            <li><Link href="/entreprises" className="hover:text-white">{dict.footer.businessSpace}</Link></li>
            <li><Link href="/ambassadeur" className="hover:text-white">{dict.footer.ambassadorProgram}</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-white">{dict.footer.support}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/comment-ca-marche" className="hover:text-white">{dict.footer.howItWorks}</Link></li>
            <li><Link href="/securite" className="hover:text-white">{dict.footer.security}</Link></li>
            <li><Link href="/contact" className="hover:text-white">{dict.footer.contact}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} SIWEUL — {dict.footer.rights}
      </div>
    </footer>
  );
}
