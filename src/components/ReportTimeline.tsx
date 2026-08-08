import { MapPin, Camera, Sparkles, MessageSquare, CheckCircle2, Circle } from "lucide-react";

interface TimelineProps {
  createdAt: string;
  hasPhotos: boolean;
  hasMatch: boolean;
  bestMatchScore: number | null;
  hasConversation: boolean;
  isResolved: boolean;
}

export default function ReportTimeline({
  createdAt,
  hasPhotos,
  hasMatch,
  bestMatchScore,
  hasConversation,
  isResolved,
}: TimelineProps) {
  const steps = [
    {
      key: "declared",
      label: "Signalement déclaré",
      done: true,
      date: createdAt,
      icon: MapPin,
    },
    {
      key: "photo",
      label: "Photo ajoutée",
      done: hasPhotos,
      icon: Camera,
    },
    {
      key: "match",
      label: bestMatchScore ? `Correspondance IA trouvée (${bestMatchScore}%)` : "Recherche IA active",
      done: hasMatch,
      icon: Sparkles,
    },
    {
      key: "contact",
      label: "Contact établi",
      done: hasConversation,
      icon: MessageSquare,
    },
    {
      key: "resolved",
      label: "Objet / personne retrouvé(e)",
      done: isResolved,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-white p-6">
      <h2 className="mb-5 font-display text-base font-semibold text-text">Suivi du dossier</h2>
      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.done ? step.icon : Circle;
          const isLast = i === steps.length - 1;
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    step.done ? "bg-found text-white" : "bg-paper-2 text-text-muted"
                  }`}
                >
                  <Icon size={15} />
                </span>
                {!isLast && (
                  <span className={`w-0.5 flex-1 ${step.done ? "bg-found/40" : "bg-border"}`} style={{ minHeight: 24 }} />
                )}
              </div>
              <div className="pb-6">
                <p className={`text-sm font-medium ${step.done ? "text-text" : "text-text-muted"}`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-xs text-text-muted">
                    {new Date(step.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
