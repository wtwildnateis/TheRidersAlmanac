import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./EventModal.css";

const ViewEventModal = ({
  event,
  onClose,
  onDelete,
  onEditRequest,
  canEdit = false,
  canDelete = false,
}) => {
  if (!event) return null;

  const modalRef = useRef(null);
  const [showFullFlyer, setShowFullFlyer] = useState(false);

  const [portalEl, setPortalEl] = useState(null);
  useEffect(() => {
    let el = document.getElementById("modal-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "modal-root";
      document.body.appendChild(el);
    }
    setPortalEl(el);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape 
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showFullFlyer) setShowFullFlyer(false);
        else onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, showFullFlyer]);

  const fmt = (d) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

  const hasDescription =
    typeof event.description === "string" && event.description.trim().length > 0;

  // Build address string + maps link
  const addressText =
    event.location ||
    [event.street, event.city, event.state, event.zip].filter(Boolean).join(", ");
  const mapsHref = addressText
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`
    : null;

  if (!portalEl) return null;

  return createPortal(
    <>
      {/* Backdrop + modal */}
      <div
        className="ra-modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
        role="dialog"
        aria-modal="true"
      >
        <div ref={modalRef} className="ra-modal-card">
          <div className="ra-modal-header" style={{ padding: "16px 20px 8px" }}>
            <h2 className="ra-modal-title">{event.title}</h2>

            <button
              type="button"
              className="custom-button"
              aria-label="Close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="ra-modal-body" role="document">
            {/* Flyer banner (click to open fullscreen) */}
            {event.flyer && (
              <button
                type="button"
                className="block w-full"
                onClick={() => setShowFullFlyer(true)}
                aria-label="Open flyer"
                style={{ background: "transparent", border: 0, padding: 0 }}
              >
                <img
                  src={event.flyer}
                  alt="Event flyer"
                  className="modal-flyer"
                  style={{ height: 420, width: "100%", objectFit: "cover", borderRadius: 12 }}
                />
              </button>
            )}

            <div className="ev-card" style={{ marginTop: 14 }}>
              <div className="ev-grid">
                <div className="ev-label" style={{ textTransform: "uppercase" }}>Type of Event</div>
                <div className="ev-value">
                  <span className="ev-chip">{event.type || "—"}</span>
                </div>

                <div className="ev-label" style={{ textTransform: "uppercase" }}>Start Time</div>
                <div className="ev-value">{fmt(event.start)}</div>

                <div className="ev-label" style={{ textTransform: "uppercase" }}>End Time</div>
                <div className="ev-value">{fmt(event.end)}</div>

                <div className="ev-label" style={{ textTransform: "uppercase" }}>Address</div>
                <div className="ev-value">
                  {mapsHref ? (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ra-link"
                      title="Open in Google Maps"
                    >
                      {addressText}
                    </a>
                  ) : (
                    addressText || "—"
                  )}
                </div>

                {hasDescription && (
                  <>
                    <div className="ev-label" style={{ textTransform: "uppercase" }}>Description</div>
                    <div className="ev-value" style={{ whiteSpace: "pre-line" }}>
                      {event.description}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="ra-modal-footer" style={{ justifyContent: "flex-end" }}>
              {canEdit && (
                <button
                  type="button"
                  className="custom-button" 
                  onClick={() => onEditRequest?.(event)}
                >
                  Edit
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  className="custom-button custom-button--danger"
                  onClick={() => onDelete?.(event.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen flyer lightbox */}
      {showFullFlyer && event.flyer && (
        <div className="flyer-fullscreen" onClick={() => setShowFullFlyer(false)}>
          <img src={event.flyer} alt="Flyer full screen" className="flyer-expanded" />
        </div>
      )}
    </>,
    portalEl
  );
};

export default ViewEventModal;