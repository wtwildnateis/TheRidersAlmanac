import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { listUpcoming } from "../../lib/eventsApi";
import * as forumApi from "../../lib/forumApi";
import mapsBg from "../../assets/maps_bg.png";
import rider from "../../assets/rider.png";

function formatDateRange(ev) {
  try {
    const s = new Date(ev.start || ev.dateStart || ev.startsAt || ev.date);
    const e = ev.end ? new Date(ev.end) : null;
    const opts = { month: "short", day: "numeric" };
    if (e && e.toDateString() !== s.toDateString()) {
      return `${s.toLocaleDateString(undefined, opts)}–${e.toLocaleDateString(undefined, opts)}`;
    }
    const time = s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return `${s.toLocaleDateString(undefined, opts)} • ${time}`;
  } catch {
    return ev?.when || "";
  }
}

export default function HomeSections() {
  /* UPCOMING EVENTS */
  const [upcoming, setUpcoming] = useState([]);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;
    listUpcoming(6)
      .then(rows => { if (alive) { setUpcoming(Array.isArray(rows) ? rows : []); setI(0); } })
      .catch(() => alive && setUpcoming([]));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (paused || upcoming.length <= 1) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setI(v => (v + 1) % upcoming.length), 4500);
    return () => clearInterval(timer.current);
  }, [paused, upcoming.length]);

  const ev = upcoming[i];

  /* TRENDING (Community Feed) */
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const apiList =
          typeof forumApi.listTrending === "function"
            ? forumApi.listTrending
            : typeof forumApi.trending === "function"
            ? forumApi.trending
            : null;

        let items;
        if (apiList) {
          const data = await apiList({ limit: 5, window: "7d" });
          items = Array.isArray(data) ? data : (data?.items ?? data?.content ?? []);
        } else {
          const res = await fetch(`/api/forum/posts/trending?limit=5&window=7d`, { credentials: "include" });
          const data = await res.json();
          items = Array.isArray(data) ? data : (data?.items ?? data?.content ?? []);
        }
        if (alive) setTrending(items || []);
      } catch (e) {
        console.error("Trending load failed:", e);
        if (alive) setTrending([]);
      } finally {
        if (alive) setLoadingTrending(false);
      }
    };

    load();
    return () => { alive = false; };
  }, []);

  const trendingForList = useMemo(() => {
    return (trending || []).map(p => ({
      id: p.id,
      title: p.title || p.name || p.subject || "Untitled",
      authorName:
        p.authorName ??
        p.authorUsername ??
        p.author?.displayName ??
        p.author?.username ??
        p.createdByUsername ??
        p.createdBy?.username ??
        "user",
      avatarUrl: p.author?.avatarUrl || p.avatarUrl || null,
    }));
  }, [trending]);

  const [tI, setTI] = useState(0);
  const [tPaused, setTPaused] = useState(false);
  const tTimer = useRef(null);

  useEffect(() => {
    if (tPaused || trendingForList.length <= 2) return;
    if (tTimer.current) clearInterval(tTimer.current);
    tTimer.current = setInterval(() => {
      setTI(v => (v + 2) % trendingForList.length);
    }, 4800);
    return () => clearInterval(tTimer.current);
  }, [tPaused, trendingForList.length]);

  return (
    <div className="w-full bg-[#0c0f0d] text-white">
      {/* HERO */}
      <section className="w-full bg-[#0c0f0d] py-6">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8 lg:px-10 grid md:grid-cols-[minmax(0,1fr)_480px] gap-x-10 gap-y-8 items-stretch">
          <div className="min-w-0">
            <h2 className="font-extrabold uppercase text-balance tracking-[-0.015em] leading-[0.96] text-[34px] sm:text-[42px] md:text-[54px] lg:text-[60px] max-w-[20ch]">
              BUILT FOR
              <br />THE <span className="text-[#e16634]">STREETS.</span>
              <br />INSPIRED
              <br />BY THE RIDE
            </h2>
            <p className="mt-6 text-white/85 text-[17px] md:text-[18px] leading-relaxed max-w-[40ch]">
              Empowering cyclists to explore new routes, connect with local riders, and find stoke in every session.
            </p>
          </div>

          <div className="w-full md:justify-self-end">
            <div className="relative overflow-hidden rounded-none ring-0 shadow-[0_18px_50px_rgba(0,0,0,.45)] h-[min(86vh,820px)] w-full">
              <img src={rider} alt="Night ride" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,.35))] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-white/10 my-8 md:my-10" />

      {/* UPCOMING EVENTS */}
      <section className="mx-auto max-w-[1200px] px-6 pb-12 md:pb-16">
        <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}`}</style>

        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-2xl md:text-[26px] font-extrabold tracking-wide">UPCOMING EVENTS</h3>
          <Link to="/events" className="text-[#8AE79A] hover:opacity-80 text-sm tracking-widest">SEE ALL EVENTS →</Link>
        </div>

        <div
          className="relative overflow-hidden rounded-[18px] ring-1 ring-white/10 h-[420px] md:h-[480px]"
          style={{ backgroundImage: `url(${mapsBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] md:w-[720px] bg-black/78 backdrop-blur-sm rounded-3xl p-6 md:p-7 ring-1 ring-white/10 shadow-[0_18px_50px_rgba(0,0,0,.45)]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {ev ? (
              <>
                {/* NON-CLICKABLE body: title + details + flyer */}
                <div
                  className="relative z-[1] grid grid-cols-[1fr_160px] md:grid-cols-[1fr_170px] gap-6 items-center w-full text-left"
                  style={{ animation: "fadeSlide .45s ease both" }}
                  key={ev?.id ?? i}
                >
                  {/* LEFT: text */}
                  <div className="min-w-0">
                    <div className="text-[20px] md:text-[24px] font-extrabold tracking-widest leading-tight uppercase">
                      {ev.title || ev.name || "Untitled Event"}
                    </div>
                    <div className="mt-2 text-[13px] md:text-[14px] text-white/75">
                      {formatDateRange(ev)}{ev.location ? <> • {ev.location}</> : null}
                    </div>
                    <div className="mt-4 text-[14px] md:text-[15px] font-semibold">
                      {ev.city || ev.organizer || ev.category || "Featured ride"}
                    </div>
                    {/* Only show summary if present; no default “Tap to view details” */}
                    {ev.summary || ev.description ? (
                      <div className="text-[13px] md:text-[14px] text-white/65 line-clamp-2">
                        {ev.summary || ev.description}
                      </div>
                    ) : null}
                  </div>

                    {/* RIGHT: flyer */}
                  <div className="justify-self-end">
                    <div className="relative h-[150px] w-[150px] md:h-[160px] md:w-[160px] rounded-2xl overflow-hidden">
                      {(() => {
                        const flyerSrc =
                          ev.flyer || ev.flyerUrl || ev.flyer_url || ev.flyerImage || null;

                        return flyerSrc ? (
                          <img
                            src={flyerSrc}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="pointer-events-none h-full w-full grid place-items-center text-white/75 bg-[radial-gradient(75%_75%_at_30%_20%,rgba(255,255,255,.10),rgba(255,255,255,.04)_60%,rgba(255,255,255,.02)_100%)]">
                            <div className="text-center">
                              <svg width="32" height="32" viewBox="0 0 24 24" className="mx-auto mb-2 opacity-85">
                                <path d="M4 7h3l2-2h6l2 2h3v12H4z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                              <span className="text-[11px] tracking-[0.18em] uppercase">No flyer</span>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
                    </div>
                  </div>
                </div>

                {/* Controls */}
                {upcoming.length > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {upcoming.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setI(idx); }}
                          className={[
                            "h-1.5 rounded-full transition-all",
                            idx === i ? "w-5 bg-[#8AE79A]" : "w-2.5 bg-white/25 hover:bg-white/35",
                          ].join(" ")}
                          aria-label={`Go to event ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/15"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setI((v) => (v - 1 + upcoming.length) % upcoming.length); }}
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/15"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setI((v) => (v + 1) % upcoming.length); }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-white/60 text-sm">No upcoming events.</div>
            )}
          </div>
        </div>
      </section>

      {/* COMMUNITY FEED (Trending) */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16">
        <style>{`
          @keyframes fadeSlideX { 0%{opacity:0;transform:translateX(8px)} 100%{opacity:1;transform:translateX(0)} }
        `}</style>

        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-2xl md:text-[26px] font-extrabold tracking-wide">COMMUNITY FEED</h3>
          <Link to="/community" className="text-[#8AE79A] hover:opacity-80 text-sm tracking-widest">
            SEE ALL POSTS →
          </Link>
        </div>

        {loadingTrending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0,1,2,3].map(k => (
              <div key={k} className="rounded-2xl bg-white/5 ring-1 ring-white/10 h-[96px] animate-pulse" />
            ))}
          </div>
        ) : !trendingForList.length ? (
          <div className="text-white/60">No trending posts yet.</div>
        ) : (
          <div
            className="relative rounded-[18px] ring-1 ring-white/10 bg-black/40 backdrop-blur-sm p-5 md:p-6"
            onMouseEnter={() => setTPaused(true)}
            onMouseLeave={() => setTPaused(false)}
          >
            {(() => {
              const L = trendingForList.length;
              const pages = Math.ceil(L / 2);
              const safeIndex = ((tI % L) + L) % L;
              const a = trendingForList[safeIndex];
              const b = L > 1 ? trendingForList[(safeIndex + 1) % L] : null;
              const cards = L > 1 ? [a, b] : [a];

              const Card = ({ p }) => (
                <div
                  className="
                    group w-full text-left rounded-2xl
                    px-5 bg-[#151a17]/70 hover:bg-[#151a17]/85
                    ring-1 ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,.35)]
                    transition-colors grid grid-cols-[56px_1fr] gap-4 items-center
                    h-[96px]
                  "
                >
                  {/* avatar */}
                  <span className="h-12 w-12 rounded-full ring-1 ring-white/10 bg-white/5 grid place-items-center overflow-hidden">
                    {p.avatarUrl ? (
                      <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-white/90 font-semibold text-sm">
                        {(p.authorName?.[0] || "U").toUpperCase()}
                      </span>
                    )}
                  </span>

                  {/* text */}
                  <span className="min-w-0">
                    <span className="block text-[18px] md:text-[20px] font-bold tracking-wide truncate">
                      {p.title}
                    </span>
                    <span className="block text-[12px] md:text-[13px] text-white/60 truncate">
                      {p.authorName}
                    </span>
                  </span>
                </div>
              );

              return (
                <>
                  <div
                    className={`grid gap-5 md:gap-6 ${cards.length === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}
                    style={{ animation: "fadeSlideX .45s ease both" }}
                    key={`${a?.id}-${b?.id ?? "single"}`}
                  >
                    {cards.map((p, idx) => p && <Card key={p.id ?? idx} p={p} />)}
                  </div>

                  {/* dots + controls */}
                  {pages > 1 && (
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Array.from({ length: pages }).map((_, page) => {
                          const active = Math.floor(safeIndex / 2) === page;
                          return (
                            <button
                              type="button"
                              key={page}
                              onClick={() => setTI((page * 2) % L)}
                              className={[
                                "h-1.5 rounded-full transition-all",
                                active ? "w-5 bg-[#8AE79A]" : "w-2.5 bg-white/25 hover:bg-white/35"
                              ].join(" ")}
                              aria-label={`Go to trending page ${page + 1}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/15"
                          onClick={() => setTI(v => (v - 2 + L) % L)}
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/15"
                          onClick={() => setTI(v => (v + 2) % L)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </section>
    </div>
  );
}