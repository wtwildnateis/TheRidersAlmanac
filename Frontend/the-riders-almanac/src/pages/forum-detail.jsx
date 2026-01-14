import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../components/Forum/PostDetail.css";
import { showUserName } from "../utils/names"; // <-- fixed path
import { useAuthStore } from "../stores/auth";
import {
    getPost,
    listComments,
    addComment,
    updatePost,
    deleteComment,
    togglePostLock,
    listTags,
    // togglePostHidden // keep if you have it exported in forumApi
} from "../lib/forumApi";

function timeAgo(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
    const m = Math.floor(s / 60), h = Math.floor(s / 3600), day = Math.floor(s / 86400);
    if (day >= 1) return `${day}d ago`;
    if (h >= 1) return `${h}h ago`;
    if (m >= 1) return `${m}m ago`;
    return `${s}s ago`;
}

function byTimeAsc(a, b) {
    const ta = new Date(a.createdAt || a.createdOn || a.created_at || 0).getTime();
    const tb = new Date(b.createdAt || b.createdOn || b.created_at || 0).getTime();
    if (ta !== tb) return ta - tb;
    return (a.id ?? 0) - (b.id ?? 0);
}

function resolveName(x, currentUser) {
    return (
        x.authorUsername ||             // <--
        x.authorName ||
        x.author?.username ||
        x.author?.name ||
        x.user?.username ||
        x.userName ||
        x.username ||
        x.createdByUsername ||
        x.createdBy?.username ||
        // if the API only sends IDs, use the signed-in user as a last-resort match
        ((x.authorId ?? x.userId ?? x.createdById) &&
            (currentUser?.id ?? currentUser?.userId) &&
            (x.authorId ?? x.userId ?? x.createdById) === (currentUser.id ?? currentUser.userId) &&
            (currentUser.username || currentUser.name)) ||
        "admin"
    );
}

export default function ForumDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [body, setBody] = useState("");
    const [busy, setBusy] = useState(false);

    const [showAdmin, setShowAdmin] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    // Edit modal
    const [showEdit, setShowEdit] = useState(false);
    const [editBusy, setEditBusy] = useState(false);
    const [form, setForm] = useState({ title: "", body: "" });
    const [allTags, setAllTags] = useState([]);           // [{id,slug,label}]
    const [selectedTags, setSelectedTags] = useState([]); // ['forSale',...]

    const adminRef = useRef(null);
    const composerRef = useRef(null);
    const endRef = useRef(null);

    const isStaff = useMemo(() => {
        const roles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
        return roles.some(r => ["ADMIN", "MOD", "MODERATOR"].includes(String(r).toUpperCase()));
    }, [user]);

    const isCreator = useMemo(() => {
        if (!user || !post) return false;
        const uName = (user.username || user.name || "").toLowerCase();
        const aName = (post.authorName || post.author?.username || "").toLowerCase();
        const uid = (user.id ?? user.userId);
        return (aName && uName === aName) || (uid && uid === (post.authorId ?? post.author?.id));
    }, [user, post]);

    function autoGrow(el) {
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 240) + "px";
    }

    async function load() {
  const p = await getPost(id);
  setPost(p);

  const c = await listComments(id, { page: 0, size: 200 });
  const items = (c.items ?? c.content ?? []).slice().sort(byTimeAsc);
  const normalized = items.map(cm => ({ ...cm, _displayName: resolveName(cm, user) }));
  setComments(normalized);

  try {
    const tags = await listTags();
    setAllTags(tags);
  } catch { /* ignore */ }

  const slugs = (p.tags ?? []).map(t => t.slug || t.name || t.label).filter(Boolean);
  setSelectedTags(slugs);
}    useEffect(() => { load().catch(console.error); }, [id]);

    // off-click closes admin drawer
    useEffect(() => {
        if (!showAdmin) return;
        function onDocClick(e) {
            if (!adminRef.current) return;
            if (!adminRef.current.contains(e.target)) setShowAdmin(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [showAdmin]);

    async function submitComment(e) {
  e.preventDefault();
  if (!body.trim()) return;
  setBusy(true);
  try {
    await addComment({ postId: Number(id), body: body.trim() });
    setBody("");
    await load(); // refresh comments

    // now scroll to bottom just for this action
    setTimeout(() => {
      endRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 0);
  } finally {
    setBusy(false);
  }
}

    async function onToggleLock() {
        try {
            const next = !post.locked;
            await togglePostLock(post.id, next);
            setPost(p => ({ ...p, locked: next }));
        } catch (e) { console.error(e); }
    }

    async function onToggleHidden() {
        try {
            const next = !post.hidden;
            // If you have togglePostHidden in your API, uncomment the next line and import it above.
            // await togglePostHidden(post.id, next);
            setPost(p => ({ ...p, hidden: next }));
        } catch (e) { console.error(e); }
    }

    function openImage(i) {
        setLightboxIdx(i);
        setLightboxOpen(true);
    }

    function openEdit() {
        if (post.locked && !isStaff) {
            alert("This post is locked by a moderator.");
            return;
        }
        setForm({
            title: post.title || "",
            body: post.body || post.content || ""
        });
        setShowEdit(true);
    }

    async function saveEdit(e) {
        e?.preventDefault();
        setEditBusy(true);
        try {
            const payload = {
                title: form.title.trim(),
                body: form.body.trim(),
                tags: selectedTags, // slugs
            };
            await updatePost(post.id, payload);
            await load();
            setShowEdit(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update post.");
        } finally {
            setEditBusy(false);
        }
    }

    if (!post) return null;

    const author = showUserName(post); // unified post author display
    const ago = timeAgo(post.createdAt || post.createdOn || post.created_at);

    const imgs = (post.images || post.attachments || post.media || [])
        .map(a => {
            if (typeof a === "string") return { url: a, alt: post.title || "Attachment" };
            return {
                url: a.url || a.secureUrl || a.secure_url || a.path || a.src,
                alt: a.alt || a.caption || post.title || "Attachment"
            };
        })
        .filter(x => x.url);

    function canDeleteComment(c) {
        const uid = user?.id ?? user?.userId;
        const cOwnerId = c.authorId ?? c.author?.id;
        const nameMatch = !!user && (user.username || "").toLowerCase() === showUserName(c).toLowerCase();
        return isStaff || (uid && cOwnerId && uid === cOwnerId) || nameMatch;
    }

    return (
        <div className="universalpagecontainer">

            <div className="post-page">
                <div className="post-wrap">

                    <div
                        className="post-header"
                        style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "baseline", gap: 12, marginBottom: 10 }}
                    >
                        <button
                            className="ra-pillbtn ra-pillbtn--icon"
                            onClick={() => navigate(-1)}
                            title="Back"
                            aria-label="Back"
                            style={{ lineHeight: 1, transform: "translateY(-2px)" }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>

                        <h1 className="post-h1" style={{ margin: 0 }}>{post.title}</h1>
                    </div>

                    <div
                        className="post-topRow"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr auto",
                            alignItems: "center",
                            gap: 12,
                            marginTop: 4,
                        }}
                    >
                        <div className="post-metaL" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <div className="post-avatar" aria-hidden>
                                <span>{(author || "A").charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="post-author text-ellipsis">{author}</span>
                            <span className="post-dot">•</span>
                            <time className="post-time" dateTime={post.createdAt}>{ago}</time>
                        </div>

                        <div
                            className="post-tagsRow"
                            style={{ display: "flex", flexWrap: "wrap", gap: 8, minWidth: 0, justifyContent: "flex-start" }}
                        >
                            {(post.tags ?? []).map((t) => (
                                <span key={t.slug || t.id || t.name} className="post-chip">
                                    #{t.label || t.name || t.slug}
                                </span>
                            ))}
                        </div>

                        <div className="post-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {isCreator && (
                                <button className="ra-pillbtn" onClick={openEdit} title="Edit post">
                                    Edit Post
                                </button>
                            )}
                            {isStaff && (
                                <button
                                    className="ra-pillbtn ra-pillbtn--icon"
                                    onClick={() => setShowAdmin(true)}
                                    title="Admin tools"
                                    aria-label="Admin tools"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M3 7h18" />
                                            <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
                                            <path d="M3 17h18" />
                                            <circle cx="15" cy="17" r="2" fill="currentColor" stroke="none" />
                                        </g>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <article className="post-body prose-dark" style={{ marginTop: 12 }}>
                        {(post.body || post.content || "")
                            .split("\n")
                            .map((p, i) => p.trim())
                            .filter(Boolean)
                            .map((p, i) => <p key={i}>{p}</p>)}
                    </article>

                    <div className="section-break" />

                    {!!imgs.length && (
                        <section className="post-media">
                            <h3 className="section-title">Attachments</h3>
                            <div
                                className="media-grid"
                                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 8 }}
                            >
                                {imgs.map((im, i) => (
                                    <button
                                        key={im.url + i}
                                        className="media-tile"
                                        onClick={() => openImage(i)}
                                        aria-label="Open image"
                                        title="Open image"
                                        style={{
                                            aspectRatio: "1 / 1",
                                            overflow: "hidden",
                                            borderRadius: 10,
                                            border: "1px solid var(--grid)",
                                            background: "#0c0f0d",
                                            padding: 0,
                                            cursor: "pointer"
                                        }}
                                    >
                                        <img
                                            src={im.url}
                                            alt={im.alt}
                                            loading="lazy"
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="section-break" />

                    <section className="post-comments">
                        <h3 className="section-title">Comments</h3>

                        <ul className="comment-list">
                            {comments.map(c => {
                                const cAuthor = c._displayName;

                                return (
                                    <li key={c.id} className="comment-item">
                                        <div className="c-avatar" aria-hidden>
                                            <span>{(cAuthor || "U").charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="c-main">
                                            <div className="c-head" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                <span className="c-author">{cAuthor}</span>
                                                <span className="post-dot">•</span>
                                                <time className="c-time">{timeAgo(c.createdAt || c.createdOn || c.created_at)}</time>
                                                {(isStaff || canDeleteComment(c)) && (
                                                    <button
                                                        className="ra-pillbtn ra-pillbtn--icon ra-pillbtn--danger ra-pillbtn--xs"
                                                        onClick={async () => {
                                                            if (!window.confirm("Delete this comment? This can’t be undone.")) return;
                                                            try {
                                                                await deleteComment(c.id);
                                                                setComments(prev => prev.filter(x => x.id !== c.id));
                                                                requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "end" }));
                                                            } catch (e) {
                                                                console.error(e);
                                                                alert("Failed to delete comment.");
                                                            }
                                                        }}
                                                        style={{ marginLeft: "auto" }}
                                                        title="Delete comment"
                                                        aria-label="Delete comment"
                                                    >
                                                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                                            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="c-body">{c.body || c.text}</div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div ref={endRef} />

                        {user && !post.locked ? (
                            <form
                                className="comment-composer"
                                onSubmit={submitComment}
                                style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "stretch" }}
                            >
                                <textarea
                                    ref={composerRef}
                                    className="composer-input"
                                    placeholder="Write a comment…"
                                    rows={1}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    onInput={(e) => autoGrow(e.currentTarget)}
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid var(--grid)",
                                        background: "var(--panel)",
                                        color: "var(--ink)",
                                        padding: "12px 14px",
                                        minHeight: 44,
                                        height: "auto",
                                    }}
                                />
                                <button
                                    className="ra-pillbtn ra-pillbtn--primary"
                                    disabled={busy || !body.trim()}
                                    style={{ minWidth: 140, height: "auto" }}
                                >
                                    Post comment
                                </button>
                            </form>
                        ) : (
                            <div className="locked-note">
                                {post.locked ? "This post is locked by a moderator." : "Sign in to comment."}
                            </div>
                        )}
                    </section>
                </div>

                {isStaff && showAdmin && (
                    <>
                        <div
                            className="drawer-overlay"
                            onClick={() => setShowAdmin(false)}
                            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)", zIndex: 40 }}
                        />
                        <aside
                            className="filters-panel post-admin"
                            role="dialog"
                            aria-label="Admin tools"
                            ref={adminRef}
                            style={{
                                position: "fixed",
                                right: 0, top: 0, bottom: 0,
                                width: "min(420px, 90vw)",
                                background: "var(--panel)",
                                borderLeft: "1px solid var(--grid)",
                                boxShadow: "var(--shadow)",
                                zIndex: 50,
                                display: "grid",
                                gridTemplateRows: "auto 1fr auto"
                            }}
                        >
                            <div className="filters-panel__head" style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
                                <strong>Admin Tools</strong>
                                <button className="ra-pillbtn ra-pillbtn--icon" onClick={() => setShowAdmin(false)} aria-label="Close">
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            <div className="filters-panel__body" style={{ padding: 12, display: "grid", gap: 12 }}>
                                <div className="tool-row" style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Status</span>
                                    <span className={`status-dot ${post.locked ? "is-red" : "is-green"}`}>
                                        {post.locked ? "Locked" : "Open"}
                                    </span>
                                </div>
                                <div className="tool-row">
                                    <span>Visibility</span>
                                    <span className={`status-dot ${post.hidden ? "is-red" : "is-green"}`}>
                                        {post.hidden ? "Hidden" : "Visible"}
                                    </span>
                                </div>

                                <div className="tool-actions" style={{ display: "grid", gap: 10 }}>
                                    <button className="ra-pillbtn" onClick={onToggleLock}>
                                        {post.locked ? "Unlock Post" : "Lock Post"}
                                    </button>
                                    <button className="ra-pillbtn" onClick={onToggleHidden}>
                                        {post.hidden ? "Unhide Post" : "Hide Post"}
                                    </button>
                                </div>
                            </div>

                            <div className="filters-panel__footer" style={{ padding: 12 }}>
                                <button className="ra-pillbtn" onClick={() => setShowAdmin(false)}>Done</button>
                            </div>
                        </aside>
                    </>
                )}

                {showEdit && (
                    <>
                        <div
                            className="drawer-overlay"
                            onClick={() => setShowEdit(false)}
                            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(2px)", zIndex: 60 }}
                        />
                        <aside
                            role="dialog" aria-label="Edit post"
                            style={{
                                position: "fixed", right: 0, top: 0, bottom: 0,
                                width: "min(560px, 96vw)", background: "var(--panel)",
                                borderLeft: "1px solid var(--ring)", boxShadow: "var(--shadow)", zIndex: 70,
                                display: "grid", gridTemplateRows: "auto 1fr auto"
                            }}
                            onKeyDown={(e) => { if (e.key === 'Escape') setShowEdit(false); }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12 }}>
                                <strong>Edit Post</strong>
                                <button className="ra-pillbtn ra-pillbtn--icon" onClick={() => setShowEdit(false)} aria-label="Close">
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={saveEdit} style={{ padding: 12, display: "grid", gap: 12, overflow: "auto" }}>
                                <label className="fld">
                                    <div className="lbl">Title</div>
                                    <input
                                        className="inp"
                                        value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        required
                                    />
                                </label>

                                <label className="fld">
                                    <div className="lbl">Body</div>
                                    <textarea
                                        className="inp"
                                        rows={10}
                                        value={form.body}
                                        onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                                        required
                                    />
                                </label>

                                <div className="fld">
                                    <div className="lbl">Tags</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {allTags.map(t => {
                                            const checked = selectedTags.includes(t.slug);
                                            return (
                                                <label
                                                    key={t.slug}
                                                    className={`post-chip ${checked ? "is-on" : ""}`}
                                                    style={{ cursor: "pointer", userSelect: "none" }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            setSelectedTags(prev =>
                                                                e.target.checked ? [...prev, t.slug] : prev.filter(s => s !== t.slug)
                                                            );
                                                        }}
                                                        style={{ display: "none" }}
                                                    />
                                                    #{t.label || t.slug}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </form>

                            <div style={{ padding: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className="ra-pillbtn" type="button" onClick={() => setShowEdit(false)}>Cancel</button>
                                <button className="ra-pillbtn ra-pillbtn--primary" onClick={saveEdit} disabled={editBusy}>
                                    {editBusy ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </aside>
                    </>
                )}

                {lightboxOpen && typeof ImageLightbox === "function" && (
                    <ImageLightbox images={imgs.map(i => i.url)} index={lightboxIdx} onClose={() => setLightboxOpen(false)} />
                )}
            </div>
        </div>
    );
}






