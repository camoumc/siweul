import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://www.siweul.pro";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/rechercher`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/carte`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/signaler`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/comment-ca-marche`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/securite`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/premium`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/entreprises`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/ambassadeur`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/classement`, changeFrequency: "daily", priority: 0.4 },
  ];

  let reportPages: MetadataRoute.Sitemap = [];
  try {
    const reports = await prisma.report.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    reportPages = reports.map((r) => ({
      url: `${BASE_URL}/annonces/${r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // base non joignable au moment du build : sitemap statique seulement
  }

  return [...staticPages, ...reportPages];
}
