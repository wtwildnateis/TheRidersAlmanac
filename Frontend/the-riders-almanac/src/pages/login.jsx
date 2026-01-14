import { useState } from "react";
import { login, me } from "../lib/authApi";
import { useAuthStore } from "../stores/auth";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [form, setForm] = useState({ login: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await login(form);
      setToken(res.token);
      const profile = await me();
      setUser(profile);
      nav("/home");
    } catch (e) {
      setErr("Invalid credentials. Please double-check and try again.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0d0a] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(166,217,138,.18)] bg-[#0e1311] shadow-[0_20px_50px_rgba(0,0,0,.5)] p-8">
        {/* Heading */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#8AE79A] uppercase">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Sign in to your account          
          </h1>
          <p className="mt-2 text-sm text-[#9fb2a0]">
            Sign in to The Rider’s Almanac and pick up right where you left off.
          </p>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-4 rounded-lg border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-[0.18em] text-[#9fb2a0] uppercase">
              Email or Username
            </label>
            <input
              className="block w-full rounded-xl border border-[rgba(255,255,255,.08)] bg-[#121712] px-3 py-2.5 text-sm outline-none transition focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/40"
              placeholder="you@example.com"
              value={form.login}
              onChange={(e) =>
                setForm((f) => ({ ...f, login: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-[0.18em] text-[#9fb2a0] uppercase">
              Password
            </label>
            <input
              type="password"
              className="block w-full rounded-xl border border-[rgba(255,255,255,.08)] bg-[#121712] px-3 py-2.5 text-sm outline-none transition focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/40"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-[#8AE79A]/70 bg-[#8AE79A] px-4 py-2.5 text-sm font-semibold tracking-wide text-[#05190f] transition hover:bg-[#9df2aa] hover:border-[#9df2aa]"
          >
            Sign In
          </button>
        </form>

        {/* Footer text */}
        <p className="mt-4 text-center text-xs text-[#9fb2a0]">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#8AE79A] hover:text-[#9df2aa]"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}