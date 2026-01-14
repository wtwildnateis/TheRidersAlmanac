import { useEffect, useState, useCallback, useRef } from "react";
import { listEvents, listUpcoming } from "../../lib/eventsApi";

function UpcomingSidebar({ limit = 5, windowDays = 35 }) {
  const [items, setItems] = useState([]);
  const alive = useRef(true);

  const fmtShort = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const openInCalendar = (ev) =>
    window.dispatchEvent(new CustomEvent("ra:openEvent", { detail: ev }));

  const refetch = useCallback(async () => {
    try {
      // fetch
      let data;
      try {
        data = await listUpcoming(limit);
      } catch {
        const now = new Date();
        const all = await listEvents({});
        data = (all || [])
          .filter((e) => new Date(e.end ?? e.start) >= now)
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, limit * 3);
      }

      // filter to keep it close to the visible calendar
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + windowDays);

      const windowed = (data || []).filter((e) => {
        if (e.status && e.status !== "ACTIVE") return false;
        const s = new Date(e.start);
        return s >= now && s <= end;
      });

      // sort, dedupe, limit
      const seen = new Set();
      const cleaned = windowed
        .filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)))
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, limit);

      if (alive.current) setItems(cleaned);
    } catch {
      if (alive.current) setItems([]);
    }
  }, [limit, windowDays]);

  // initial load & whenever limit/windowDays change
  useEffect(() => {
    alive.current = true;
    refetch();
    return () => {
      alive.current = false;
    };
  }, [refetch]);

  // listen for create/update/delete broadcasts and refetches
  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener("ra:events:changed", onChanged);
    return () => window.removeEventListener("ra:events:changed", onChanged);
  }, [refetch]);

  return (
    <ul className="up-list">
      {items.map((ev) => (
        <li
          key={ev.id}
          className="up-item"
          onClick={() => openInCalendar(ev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openInCalendar(ev)}
        >
          {/* LEFT: flyer */}
          {ev.flyer ? (
            <img src={ev.flyer} alt="" className="up-thumb" />
          ) : (
            <div className="up-thumb up-thumb--placeholder">TRA</div>
          )}

          {/* MIDDLE: title + date */}
          <div className="up-main">
            <div className="up-title truncate">{ev.title}</div>
            <div className="up-date">{fmtShort(ev.start)}</div>
          </div>

          {/* RIGHT: check */}
          <div className="up-badge">✓</div>
        </li>
      ))}
    </ul>
  );
}

export default UpcomingSidebar;