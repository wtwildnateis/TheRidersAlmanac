import { useState } from "react";
import { useAuthStore } from "../stores/auth";
import { accountApi } from "../lib/accountApi";
import { useNavigate } from "react-router-dom";

export default function ChangeEmailPage() {
  const nav = useNavigate();
  const { user, setUser } = useAuthStore();
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return setErr("Enter a valid email address.");
    try {
      setBusy(true);
      await accountApi.changeEmail(newEmail);
      setUser({ ...user, email: newEmail });
      nav("/account");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[80vh] px-6 py-10 bg-[#0a0d0a] text-white">
      <div className="max-w-md mx-auto border border-white/10 rounded-2xl bg-[#0f1311] shadow-2xl p-6">
        <h1 className="text-2xl font-extrabold mb-6">Change Email</h1>
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">New Email</span>
            <input type="email" className="h-11 rounded-xl bg-[#121713] border border-white/10 px-3 outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required />
          </label>

          {err && <p className="text-sm text-red-400">{err}</p>}

          <button disabled={busy} className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold disabled:opacity-60">
            {busy ? "Saving..." : "Save Email"}
          </button>
        </form>
      </div>
    </div>
  );
}