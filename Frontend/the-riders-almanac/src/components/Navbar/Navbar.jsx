import { NavLink, useLocation } from "react-router-dom";
import { Sling as Hamburger } from "hamburger-react";
import { useEffect, useRef, useState } from "react";
import AuthMenu from "../AuthMenu";
import { useAuthStore } from "../../stores/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);
  const burgerRef = useRef(null);

  const { token, user, setToken, setUser } = useAuthStore();
  const { pathname } = useLocation();

  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (
        drawerRef.current && !drawerRef.current.contains(e.target) &&
        burgerRef.current && !burgerRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [open]);

  const linkBase = "uppercase tracking-[0.14em] text-[13px] transition-colors font-semibold";
  const linkCls = ({ isActive }) => [linkBase, isActive ? "text-[#8AE79A]" : "text-white/95 hover:text-white"].join(" ");
  const isAccountActive =
    pathname.startsWith("/account") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/change-username") ||
    pathname.startsWith("/change-email");
  const accountTriggerCls = [linkBase, isAccountActive ? "text-[#8AE79A]" : "text-white/95 hover:text-white"].join(" ");

  return (
    <header id="ra-navbar" className="w-full sticky top-0 z-50 bg-[#0c0f0d]/95 backdrop-blur border-b border-white/5">
      <div className="mx-auto max-w-[1200px] h-16 px-6 md:px-8 lg:px-10 flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/home" className={linkCls}>Home</NavLink>
          <NavLink to="/events" className={linkCls}>Events</NavLink>
          <NavLink to="/resources" className={linkCls}>Resources</NavLink>
          <NavLink to="/community" className={linkCls}>Community</NavLink>
          <NavLink to="/contact-us" className={linkCls}>Contact Us</NavLink>
        </nav>

        <div className="hidden md:flex items-center">
          <AuthMenu triggerClassName={accountTriggerCls} />
        </div>

        <button
          ref={burgerRef}
          aria-label="Menu"
          className="md:hidden inline-flex items-center"
        >
          <Hamburger toggled={open} toggle={setOpen} size={20} color="#ffffff" />
        </button>
      </div>

      <div
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 md:hidden",
          "bg-[#0a0d0a]",                       
          "transition-opacity",
          open ? "opacity-100 pointer-events-auto z-[998]" : "opacity-0 pointer-events-none z-[-1]"
        ].join(" ")}
      />

      <aside
        ref={drawerRef}
        className={[
          "fixed left-0 top-0 h-screen w-[78vw] max-w-[320px] md:hidden",
          "bg-[#0c0f0d] border-r border-white/10 shadow-[0_20px_60px_rgba(0,0,0,.75)]",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "z-[999] p-4 overflow-y-auto overscroll-contain"
        ].join(" ")}
      >
        <nav className="grid gap-2">
          <NavLink to="/home" onClick={() => setOpen(false)} className={linkCls}>Home</NavLink>
          <NavLink to="/events" onClick={() => setOpen(false)} className={linkCls}>Events</NavLink>
          <NavLink to="/resources" onClick={() => setOpen(false)} className={linkCls}>Resources</NavLink>
          <NavLink to="/community" onClick={() => setOpen(false)} className={linkCls}>Community</NavLink>
          <NavLink to="/contact-us" onClick={() => setOpen(false)} className={linkCls}>Contact Us</NavLink>

          <div className="h-px my-3 bg-white/10" />

          {!token ? (
            <div className="grid gap-2">
              <NavLink to="/login" onClick={() => setOpen(false)} className={linkCls}>Login</NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)} className={linkCls}>Register</NavLink>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl border border-white/10 bg-[#121713]">
                <div className="w-9 h-9 rounded-xl bg-[#0f1512] border border-white/10 grid place-items-center font-extrabold text-[#8AE79A]">
                  {(user?.username || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate">{user?.username || "user"}</div>
                  <div className="text-xs text-white/60 truncate">{user?.email || ""}</div>
                </div>
              </div>
              <NavLink to="/account" onClick={() => setOpen(false)} className={linkCls}>Account</NavLink>
              <button
                onClick={() => { setToken(null); setUser(null); setOpen(false); }}
                className="text-left uppercase tracking-[0.14em] text-[13px] font-semibold text-red-300 hover:text-red-200"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </aside>
    </header>
  );
}