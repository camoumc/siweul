import { Flag, HeartHandshake, Award, Medal, Trophy, BadgeCheck, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Flag,
  HeartHandshake,
  Award,
  Medal,
  Trophy,
  BadgeCheck,
};

export default function BadgeIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? BadgeCheck;
  return <Icon size={size} />;
}
