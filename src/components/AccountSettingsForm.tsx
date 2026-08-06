"use client";

import { useState } from "react";
import { Loader2, Save, KeyRound, UserCog } from "lucide-react";
import { SENEGAL_CITIES } from "@/lib/reportConfig";

export default function AccountSettingsForm({
  initialName,
  initialPhone,
  initialCity,
}: {
  initialName: string;
  initialPhone: string;
  initialCity: string;
}) {
  const [profile, setProfile] = useState({ name: initialName, phone: initialPhone, city: initialCity });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  const inputClass =
    "mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20";

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    setProfileErr("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setProfileLoading(false);
    if (res.ok) setProfileMsg("Profil mis à jour ✓");
    else setProfileErr("Erreur lors de la mise à jour.");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");
    if (pwd.next !== pwd.confirm) {
      setPwdErr("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setPwdLoading(true);
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
    });
    setPwdLoading(false);
    if (res.ok) {
      setPwdMsg("Mot de passe changé avec succès ✓");
      setPwd({ current: "", next: "", confirm: "" });
    } else {
      const data = await res.json();
      setPwdErr(data.error ?? "Erreur.");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={saveProfile} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserCog size={18} className="text-signal" />
          <h2 className="font-display text-lg font-semibold text-text">Informations personnelles</h2>
        </div>
        {profileErr && <p className="mb-3 rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{profileErr}</p>}
        {profileMsg && <p className="mb-3 rounded-xl bg-found/10 px-3 py-2 text-sm text-found">{profileMsg}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-text">Nom complet</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text">Téléphone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-text">Ville</label>
            <select
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className={inputClass}
            >
              <option value="">—</option>
              {SENEGAL_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={profileLoading}
          className="mt-4 flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {profileLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Enregistrer
        </button>
      </form>

      <form onSubmit={changePassword} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound size={18} className="text-signal" />
          <h2 className="font-display text-lg font-semibold text-text">Changer le mot de passe</h2>
        </div>
        {pwdErr && <p className="mb-3 rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{pwdErr}</p>}
        {pwdMsg && <p className="mb-3 rounded-xl bg-found/10 px-3 py-2 text-sm text-found">{pwdMsg}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text">Mot de passe actuel</label>
            <input
              type="password"
              required
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={pwd.next}
                onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text">Confirmer</label>
              <input
                type="password"
                required
                minLength={6}
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={pwdLoading}
          className="mt-4 flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
        >
          {pwdLoading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}
