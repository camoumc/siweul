import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getServerDictionary } from "@/i18n/server";
import { isRtl } from "@/i18n/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const notoArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SIWEUL — Retrouver ensemble",
  description:
    "SIWEUL est la plateforme communautaire pour retrouver objets perdus, personnes disparues, animaux égarés, véhicules volés et documents administratifs.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, dict } = await getServerDictionary();
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${fraunces.variable} ${manrope.variable} ${jetbrains.variable} ${notoArabic.variable} antialiased`}
      >
        <SessionProvider>
          <LocaleProvider locale={locale} dict={dict}>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
