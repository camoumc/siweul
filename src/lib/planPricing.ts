import { prisma } from "@/lib/prisma";

export async function getSubscriptionAmount(plan: "PREMIUM" | "PRO"): Promise<number | null> {
  const rule = await prisma.pricingRule.findUnique({ where: { key: `${plan}_MONTHLY` } });
  if (!rule || !rule.active) return null;
  return rule.amount;
}
