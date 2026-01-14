import { useEffect, useRef, useState } from "react";
import { createPost, listTags } from "../../lib/forumApi";

export default function NewPostModal({ open, onClose, onCreated }) {
  const panelRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const MAX_FILES = 5;



  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    (async () => {
      try {
        const tags = await listTags();
        setAllTags(tags || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const overlayClick = (e) => {
    if (!panelRef.current) return;
    if (!panelRef.current.contains(e.target)) onClose?.();
  };

  const toggleTag = (slug) =>
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const onPickFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles((prev) => {
      const next = [...prev, ...list];
      return next.slice(0, MAX_FILES);
    });
    e.currentTarget.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const list = Array.from(e.dataTransfer?.files || []);
    if (!list.length) return;
    setFiles((prev) => {
      const next = [...prev, ...list];
      return next.slice(0, MAX_FILES);
    });
  };

  async function submit(e) {
    e?.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("body", body.trim());
      selected.forEach((slug) => form.append("tags", slug));
      files.forEach((f) => form.append("images", f));
      const created = await createPost(form);
      onCreated?.(created);
      setTitle(""); setBody(""); setFiles([]); setSelected([]);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Couldn't create post.");
    } finally {
      setBusy(false);
    }
  }

  return (

    <div
      role="dialog"
      aria-label="Create Post"
      onMouseDown={overlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(2px)",
        padding: 16,
      }}
    >
      <div
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 96vw)",                 // slimmer
          maxHeight: "88vh",                          // prevents huge panel
          background: "var(--panel)",
          color: "var(--ink)",
          border: "1px solid var(--ring)",
          borderRadius: 24,
          boxShadow: "0 24px 70px rgba(0,0,0,.55)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",         // header | scroller | footer
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid var(--grid)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 26, letterSpacing: .4 }}>Create Post</h2>
          <button
            type="button"
            className="ra-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body (single inner scroller) */}
        <form
          onSubmit={submit}
          style={{
            overflow: "auto",                       // only this scrolls
            padding: 18,
            display: "grid",
            gap: 14,
            overflowX: "hidden",

          }}
        >
          <label className="fld">
            <div className="lbl">Title</div>
            <input
              className="inp"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="fld">
            <div className="lbl">Body</div>
            <textarea
              className="inp"
              placeholder="Say something…"
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </label>

          {/* Tags */}
          <div className="fld">
            <div className="lbl">Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allTags.map((t) => {
                const slug = t.slug || t.name || t.label;
                const on = selected.includes(slug);
                return (
                  <button
                    type="button"
                    key={slug}
                    onClick={() => toggleTag(slug)}
                    className={`post-chip ${on ? "is-on" : ""}`}
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      border: "1px solid var(--grid)",
                      background: on ? "rgba(166,217,138,.12)" : "transparent",
                      color: "var(--ink)",
                    }}
                    aria-pressed={on}
                    title={`#${t.label || slug}`}
                  >
                    #{t.label || slug}
                  </button>
                );
              })}
              {!allTags.length && <div className="dim">No tags yet.</div>}
            </div>
          </div>

          {/* Photos */}
          <div className="fld">
            <div className="lbl">Photos</div>

            {/* Row: dropzone + square preview, same layout as flyer */}
            <div className="flyer-upload-row">
              {/* Left: button + drag/drop text */}
              <div
                className={`flyer-upload-controls ${dragOver ? "is-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
              >
                <button
                  type="button"
                  className="flyer-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </button>
                <p className="flyer-upload-text">
                  or drag &amp; drop up to {MAX_FILES} photos here
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={onPickFiles}
                />
              </div>

              {/* Right: small square – "NO PHOTOS YET" or first photo */}
              <div className="flyer-thumb-slot">
                {files.length === 0 ? (
                  <div className="flyer-empty-square">
                    <span className="flyer-empty-icon">📷</span>
                    <span className="flyer-empty-text">NO PHOTOS YET</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={URL.createObjectURL(files[0])}
                      alt=""
                      className="flyer-thumb-image"
                    />
                    {files.length > 1 && (
                      <span className="np-thumb-count">
                        +{files.length - 1}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Full preview grid underneath */}
            {files.length > 0 && (
              <div className="np-previews">
                {files.map((f, i) => (
                  <div key={i} className="np-thumb">
                    <img src={URL.createObjectURL(f)} alt="" />
                    <button
                      type="button"
                      className="np-thumb-x"
                      aria-label="Remove image"
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: 12,                         // breathing room bottom
            borderTop: "1px solid var(--grid)",
          }}
        >
          <button className="ra-pillbtn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ra-pillbtn ra-pillbtn--primary"
            onClick={submit}
            disabled={busy || !title.trim() || !body.trim()}
          >
            {busy ? "Posting…" : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}