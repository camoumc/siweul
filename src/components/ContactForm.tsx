"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const CONTACT_EMAIL = "contact@siweul.pro";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.subject || "Contact depuis SIWEUL");
    const body = encodeURIComponent(
      `Nom : ${form.name}\nEmail : ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-text">Nom</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-text">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-text">Sujet</label>
        <input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="Partenariat, question, signalement urgent..."
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-full bg-signal px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark"
      >
        <Send size={16} /> Envoyer par email
      </button>
      <p className="text-xs text-text-muted">
        Ce bouton ouvre votre application email habituelle avec le message pré-rempli, à
        destination de {CONTACT_EMAIL}.
      </p>
    </form>
  );
}
