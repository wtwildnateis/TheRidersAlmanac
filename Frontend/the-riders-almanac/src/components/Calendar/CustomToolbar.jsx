import { useEffect, useRef, useState } from "react";
import Button from "../Button/Button";
import "./calendar-theme.css";

const DEFAULT_TYPES = ["Group Ride","Bike Race","BMX Jam","Meet Ups","Other"];

export default function CustomToolbar({
  label,
  onNavigate,
  onTypeFilterChange,
  currentType = "All",
  availableTypes = DEFAULT_TYPES,
  activeTypes,
  onMultiTypeChange,
}) {
  const go = (a) => onNavigate && onNavigate(a);
  const [month, year] = (label || "").split(" ");

  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [checked, setChecked] = useState(() =>
    Array.isArray(activeTypes) && activeTypes.length
      ? new Set(activeTypes)
      : currentType && currentType !== "All"
      ? new Set([currentType])
      : new Set()
  );

  // keep checked in sync with parent
  useEffect(() => {
    if (Array.isArray(activeTypes)) setChecked(new Set(activeTypes));
  }, [activeTypes]);

  // detect mobile / narrow view
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // esc to close drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Anchor drawer to the calendar card
  useEffect(() => {
    const card = rootRef.current?.closest(".ra-calendar-card");
    if (!card) return;
    if (open) {
      card.classList.add("ra-has-drawer");
      card.style.position = "relative";
      card.style.overflow = "visible";
      card.style.isolation = "isolate";
    } else {
      card.classList.remove("ra-has-drawer");
    }
  }, [open]);

  const emit = (set) => {
    const arr = Array.from(set);
    if (onMultiTypeChange) return onMultiTypeChange(arr);
    if (onTypeFilterChange)
      return onTypeFilterChange(arr.length === 1 ? arr[0] : "All");
  };

  const toggle = (t) => {
    const next = new Set(checked);
    next.has(t) ? next.delete(t) : next.add(t);
    setChecked(next);
    emit(next);
  };

  const selectAll = () => {
    const next = new Set(availableTypes);
    setChecked(next);
    emit(next);
  };
  const clearAll = () => {
    const next = new Set();
    setChecked(next);
    emit(next);
  };

  // short label for mobile
  const shortMonth = month ? month.slice(0, 3) : "";
  const shortYear = year ? year.slice(-2) : "";

  return (
    <div ref={rootRef} className="rbc-toolbar ra-toolbar">
      <div className={`ra-toolbar__grid ${isMobile ? "ra-toolbar__grid--mobile" : ""}`}>
        {/* DESKTOP / TABLET LAYOUT – same as before */}
        {!isMobile && (
          <>
            {/* LEFT: Filter, Today, Prev */}
            <div className="ra-toolbar__group ra-toolbar__group--left">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="ra-pillbtn ra-pillbtn--icon"
                title="Filters"
                aria-label="Filters"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M3 7h18" />
                    <circle
                      cx="9"
                      cy="7"
                      r="2"
                      fill="currentColor"
                      stroke="none"
                    />
                    <path d="M3 17h18" />
                    <circle
                      cx="15"
                      cy="17"
                      r="2"
                      fill="currentColor"
                      stroke="none"
                    />
                  </g>
                </svg>
              </button>

              <Button
                className="ra-pillbtn ra-pillbtn--today"
                onClick={() => go("TODAY")}
              >
                Today
              </Button>

              <button
                type="button"
                className="ra-pillbtn ra-pillbtn--tall"
                onClick={() => go("PREV")}
                aria-label="Previous"
                title="Previous"
              >
                ‹
              </button>
            </div>

            {/* CENTER LABEL */}
            <span className="rbc-toolbar-label ra-toolbar__label">
              <strong className="ra-label-month">{month}</strong>{" "}
              <span className="ra-label-year">{year}</span>
            </span>

            {/* RIGHT: Next */}
            <div className="ra-toolbar__group ra-toolbar__group--right">
              <button
                type="button"
                className="ra-pillbtn ra-pillbtn--tall"
                onClick={() => go("NEXT")}
                aria-label="Next"
                title="Next"
              >
                ›
              </button>
            </div>
          </>
        )}

        {/* MOBILE LAYOUT */}
        {isMobile && (
          <>
            {/* Row 1: left (filters+today), right (prev+next) */}
            <div className="ra-toolbar__row ra-toolbar__row--top">
              <div className="ra-toolbar__group ra-toolbar__group--left">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="ra-pillbtn ra-pillbtn--icon"
                  title="Filters"
                  aria-label="Filters"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M3 7h18" />
                      <circle
                        cx="9"
                        cy="7"
                        r="2"
                        fill="currentColor"
                        stroke="none"
                      />
                      <path d="M3 17h18" />
                      <circle
                        cx="15"
                        cy="17"
                        r="2"
                        fill="currentColor"
                        stroke="none"
                      />
                    </g>
                  </svg>
                </button>

                <Button
                  className="ra-pillbtn ra-pillbtn--today"
                  onClick={() => go("TODAY")}
                >
                  Today
                </Button>
              </div>

              <div className="ra-toolbar__group ra-toolbar__group--right">
                <button
                  type="button"
                  className="ra-pillbtn ra-pillbtn--tall"
                  onClick={() => go("PREV")}
                  aria-label="Previous"
                  title="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="ra-pillbtn ra-pillbtn--tall"
                  onClick={() => go("NEXT")}
                  aria-label="Next"
                  title="Next"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Row 2: centered month/year, abbreviated */}
            <div className="ra-toolbar__row ra-toolbar__row--bottom">
              <span className="rbc-toolbar-label ra-toolbar__label">
                <strong className="ra-label-month">{shortMonth}</strong>{" "}
                <span className="ra-label-year"> {shortYear}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Drawer + scrim */}
      {open && (
        <>
          <div
            className="ra-filter-scrim"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="ra-filter-drawer"
            role="dialog"
            aria-label="Event filters"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ra-filter-header">
              <strong>Filters</strong>
              <button
                type="button"
                className="ra-filter-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="ra-filter-actions">
              <button type="button" className="ra-chip" onClick={selectAll}>
                Select all
              </button>
              <button type="button" className="ra-chip" onClick={clearAll}>
                Clear
              </button>
            </div>

            <ul className="ra-filter-list">
              {availableTypes.map((t) => (
                <li key={t}>
                  <label className="ra-filter-row">
                    <input
                      type="checkbox"
                      checked={checked.has(t)}
                      onChange={() => toggle(t)}
                    />
                    <span>{t}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className="ra-filter-foot">
              <span className="ra-filter-hint">
                {checked.size === 0 || checked.size === availableTypes.length
                  ? "Showing all events"
                  : `Showing: ${Array.from(checked).join(", ")}`}
              </span>
              <button
                type="button"
                className="ra-chip"
                onClick={() => setOpen(false)}
              >
                Done
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}