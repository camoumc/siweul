import ContactForm from "@/components/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-text">Parlons-en</h1>
      <p className="mt-3 max-w-lg text-text-muted">
        Une question, un partenariat, un compte institution a activer ? Ecrivez-nous.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ContactForm />

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-paper-2 p-5">
            <Mail className="mt-0.5 text-signal" size={20} />
            <div>
              <p className="font-semibold text-text">Email</p>
              <p className="text-sm text-text-muted">contact@siweul.pro</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-paper-2 p-5">
            <Phone className="mt-0.5 text-signal" size={20} />
            <div>
              <p className="font-semibold text-text">Assistance</p>
              <p className="text-sm text-text-muted">Via la messagerie interne SIWEUL une fois connecte</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-paper-2 p-5">
            <MapPin className="mt-0.5 text-signal" size={20} />
            <div>
              <p className="font-semibold text-text">Zone couverte</p>
              <p className="text-sm text-text-muted">Senegal, extension progressive en Afrique de l&apos;Ouest</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
