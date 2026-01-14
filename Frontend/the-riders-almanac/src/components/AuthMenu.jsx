import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, me } from "../lib/authApi";
import { useAuthStore } from "../stores/auth";

export default function AuthMenu({ triggerClassName = "", ...props }) {
  const nav = useNavigate();
  const { token, user, setToken, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ login: "", password: "" });
  const pop = useRef(null);
  const btn = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (pop.current && !pop.current.contains(e.target) && !btn.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await login(form);
      setToken(res.token);
      const profile = await me();
      setUser(profile);
      setOpen(false);
      setForm({ login: "", password: "" });
      nav("/home");
    } catch (e) {
      setErr("Invalid credentials");
    }
  }

  function onLogout() {
    setToken(null);
    setUser(null);
    setOpen(false);
    nav("/home");
  }

  const isAuthed = !!token;

  return (
    <div className="relative" {...props}>
      <button
        ref={btn}
        onClick={() => setOpen(v => !v)}
        className={`${triggerClassName} inline-flex items-center gap-2`}
        aria-expanded={open ? "true" : "false"}
        aria-haspopup="menu"
        aria-controls="authmenu-popover"
      >
        {isAuthed ? "Account" : "Login"}
        <svg className="w-3.5 h-3.5 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5" />
        </svg>
      </button>

      {open && (
        <div
          id="authmenu-popover"
          ref={pop}
          role="menu"
          className="absolute right-0 mt-2 w-[min(22rem,92vw)] rounded-2xl border border-white/10 bg-[#0f1311] shadow-2xl z-50"
        >
          {!isAuthed ? (
            <form onSubmit={onSubmit} className="p-4 grid gap-3">
              <h4 className="text-[#8AE79A] font-extrabold tracking-widest text-sm">SIGN IN</h4>

              <div className="grid gap-1.5">
                <label className="text-xs text-white/70 pl-1">Email or Username</label>
                <input
                  className="h-10 rounded-xl bg-[#121713] border border-white/10 px-3 text-white outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20"
                  value={form.login}
                  onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                  placeholder="you@domain.com"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs text-white/70 pl-1">Password</label>
                <input
                  type="password"
                  className="h-10 rounded-xl bg-[#121713] border border-white/10 px-3 text-white outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {err && <p className="text-red-400 text-sm">{err}</p>}

              <button
                type="submit"
                className="h-10 rounded-xl bg-[#0b0f0c] hover:bg-white/10 border border-white/10 text-white font-semibold"
              >
                Sign In
              </button>

              <div className="text-sm text-white/70 pt-1">
                Don’t have an account{" "}
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="text-[#8AE79A] font-semibold hover:opacity-90"
                >
                  Register here
                </Link>
              </div>
            </form>
          ) : (
            <div className="p-4 grid gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center font-extrabold text-[#8AE79A]">
                  {(user?.username || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate">{user?.username || "user"}</div>
                  <div className="text-xs text-white/60 truncate">{user?.email || ""}</div>
                </div>
              </div>

              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold grid place-items-center"
              >
                Profile Settings
              </Link>

              <button
                onClick={onLogout}
                className="h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-red-400/40 text-red-300 font-semibold"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}