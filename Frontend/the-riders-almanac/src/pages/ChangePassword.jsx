import { useState } from "react";
import { accountApi } from "../lib/accountApi";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const nav = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (newPassword.length < 8) return setErr("New password must be at least 8 characters.");
    if (newPassword !== confirm) return setErr("Passwords do not match.");
    try {
      setBusy(true);
      await accountApi.changePassword(currentPassword, newPassword);
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
        <h1 className="text-2xl font-extrabold mb-6">Change Password</h1>
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">Current Password</span>
            <input type="password" className="h-11 rounded-xl bg-[#121713] border border-white/10 px-3 outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/70">New Password</span>
            <input type="password" className="h-11 rounded-xl bg-[#121713] border border-white/10 px-3 outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/70">Confirm New Password</span>
            <input type="password" className="h-11 rounded-xl bg-[#121713] border border-white/10 px-3 outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
          </label>

          {err && <p className="text-sm text-red-400">{err}</p>}

          <button disabled={busy} className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold disabled:opacity-60">
            {busy ? "Saving..." : "Save Password"}
          </button>
        </form>
      </div>
    </div>
  );
}