import { useEffect } from "react";

export default function MapInfoWindow({
  marker,
  placeDetails,
  placeId,
  onClose,
}) {
  const open = !!marker;

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const name = placeDetails?.name || marker.name || "Location";
  const hasAddress = !!placeDetails?.formatted_address;
  const hasHours = !!placeDetails?.opening_hours?.weekday_text;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 md:px-0"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* CARD WRAPPER – narrower on desktop */}
      <div
        className="relative w-full max-w-[320px] md:max-w-[380px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CARD */}
        <div className="relative w-full rounded-[22px] border-[8px] border-[#1a221f] bg-[#0e1311] text-[#e8ebea] shadow-[0_22px_60px_rgba(0,0,0,0.9)] overflow-hidden font-sans">
          {/* Photo banner */}
          {placeDetails?.photos?.[0] && (
            <img
              src={placeDetails.photos[0].getUrl({ maxWidth: 600 })}
              alt={name}
              className="h-40 w-full object-cover border-b border-[rgba(255,255,255,0.08)]"
            />
          )}

          {/* HEADER */}
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.08)] bg-gradient-to-r from-[rgba(134,239,172,0.08)] to-[#0a0d0a] px-4 pt-2 pb-2">
            <h2 className="m-0 text-[13px] font-black uppercase tracking-[0.18em] text-[#e7fbe9]">
              {name}
            </h2>

            {placeDetails?.rating && (
              <div className="inline-flex items-center gap-1 rounded-full border border-[#fbbf24] bg-transparent px-2 py-0.5 text-[11px] font-bold text-[#fbbf24]">
                <span className="text-[11px]">★</span>
                <span>{placeDetails.rating}</span>
              </div>
            )}
          </div>

          {/* BODY – scrollable area */}
          <div className="px-4 pb-3 pt-1 max-h-[60vh] overflow-y-auto hide-scroll">
            {hasAddress && (
              <Row label="Address">
                {placeDetails.formatted_address}
              </Row>
            )}

            {hasHours && (
              <Row label="Hours">
                <details className="group">
                  <summary className="flex cursor-pointer items-center gap-1 text-[#a6d98a]">
                    <span className="transition-transform group-open:rotate-90">
                      ▸
                    </span>
                    <span>View weekly hours</span>
                  </summary>
                  <ul className="mt-1.5 list-none pl-4 text-[12px] opacity-90">
                    {placeDetails.opening_hours.weekday_text.map((line, idx) => (
                      <li key={idx} className="mt-[1px] first:mt-0">
                        {line}
                      </li>
                    ))}
                  </ul>
                </details>
              </Row>
            )}

            <Row label="Directions" last>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${marker.position.lat},${marker.position.lng}&query_place_id=${placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a6d98a] underline-offset-2 hover:underline"
              >
                Open in Google Maps
              </a>
            </Row>
          </div>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2.5 top-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(166,217,138,0.45)] bg-[rgba(0,0,0,0.55)] text-[#a6d98a] hover:bg-[rgba(166,217,138,0.18)] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, last = false }) {
  return (
    <div
      className={[
        "flex gap-4 py-2",
        !last && "border-b border-dashed border-[rgba(183,243,200,0.18)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-[120px] flex-none shrink-0 pl-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#a6d98a]">
        {label}
      </div>
      <div className="flex-1 text-[12.5px] font-semibold leading-snug text-[#e8f9ee]">
        {children}
      </div>
    </div>
  );
}