import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef } from "react";
import TitleHero from "../pages/landing/TitleHero";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const scrollKey = (p) => `ra.scroll:${p}`;

export default function SiteShell() {
  const navRef = useRef(null);
  const pageTopRef = useRef(null);
  const loc = useLocation();
  const navType = useNavigationType(); // "PUSH" | "POP" | "REPLACE"
  const prevPathRef = useRef(loc.pathname);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const from = prevPathRef.current;
    const to = loc.pathname;

    const leavingCommunityForPost = from === "/community" && to.startsWith("/community/");
    if (!leavingCommunityForPost) {
      sessionStorage.setItem(scrollKey(from), String(window.scrollY));
    }
    prevPathRef.current = to;
  }, [loc.pathname]);

  const jumpToNavbar = (smooth = false) => {
  const el = navRef.current;
  if (!el) return;

  // where the navbar wrapper naturally sits in the document
  const y = el.offsetTop;

  window.scrollTo({
    top: y,
    left: 0,
    behavior: smooth ? "smooth" : "auto",
  });
};

const jumpToPageTop = (smooth = false) => {
  const el = pageTopRef.current;
  if (!el) return;

const navEl = navRef.current;
  const navHeight = navEl?.offsetHeight || 0;

  const y = el.getBoundingClientRect().top + window.scrollY - navHeight;

  window.scrollTo({
    top: Math.max(y, 0),
    left: 0,
    behavior: smooth ? "smooth" : "auto",
  });
};

  useLayoutEffect(() => {
    const path = loc.pathname;
    const isHome          = path === "/" || path === "/home";
    const isCommunity     = path === "/community";
    const isCommunityPost = path.startsWith("/community/");

    if (navType === "POP") {
    // If you still want back-button scroll restore:
    if (!isCommunity || !isHome) {
      const saved = Number(sessionStorage.getItem(scrollKey(path)) || 0);
      window.scrollTo({
        top: Number.isFinite(saved) ? saved : 0,
        left: 0,
        behavior: "auto",
      });
      return;
    }
    // For /community specifically, just go to top of page content
    jumpToPageTop(false);
    return;
  }

  // For all PUSH/REPLACE navigations (normal clicks):
  jumpToPageTop(false);
}, [loc.pathname, navType]);

  const scrollToNav = () => jumpToNavbar(true); 

  return (
  <main className="min-h-screen bg-[#0c0f0d] text-white">
    <TitleHero onClick={scrollToNav} />
    <div ref={navRef} className="sticky top-0 z-50">
      <Navbar />
    </div>
    <div ref={pageTopRef} />
    <Outlet />
    <Footer />
  </main>
  
);
}