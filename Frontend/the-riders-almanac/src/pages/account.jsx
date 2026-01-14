import { useAuthStore } from "../stores/auth";

export default function AccountPage() {
  const { user, setUser } = useAuthStore();

  return (
    <div className="min-h-[80vh] px-6 py-10 bg-[#0a0d0a] text-white">
      <div className="max-w-3xl mx-auto border border-white/10 rounded-2xl bg-[#0f1311] shadow-2xl p-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Account</h1>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm text-white/70">Username</label>
            <input
              className="h-11 rounded-xl bg-[#121713] border border-white/10 px-3 outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20"
              defaultValue={user?.username || ""}
              disabled
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-white/70">Email</label>
            <input
              className="h-11 rounded-xl bg-[#121713] border border-white/10 px-3 outline-none focus:border-[#8AE79A] focus:ring-2 focus:ring-[#8AE79A]/20"
              defaultValue={user?.email || ""}
              disabled
            />
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-5">
  <a href="/change-password" className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center font-semibold">Change Password</a>
  <a href="/change-username" className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center font-semibold">Change Username</a>
  <a href="/change-email" className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center font-semibold">Change Email</a>
</div>
      </div>
    </div>
  );
}