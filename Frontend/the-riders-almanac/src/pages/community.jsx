import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Forum/Community.css";

import { useAuthStore } from "../stores/auth";
import {
  feed,
  listTags,
  listDisabledTags,
  listTopTags,
  createTag,
  deleteTag,
  enableTag,
  trending as getTrending,
} from "../lib/forumApi";

import PostListItem from "../components/Forum/PostListItem";
import NewPostModal from "../components/Forum/NewPostModal";

/* ---------- helpers ---------- */

function tagText(tags) {
  if (!Array.isArray(tags)) return "";
  return tags.map(t => (typeof t === "string" ? t : t?.name ?? "")).join(" ");
}

function matches(post, q) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    post.title,
    post.body ?? post.content ?? "",
    post.author?.username ?? post.author?.name ?? "",
    tagText(post.tags),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

function slugify(s = "") {
  return (
    String(s)
      .normalize("NFD")
      .replace(/\p{M}+/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "tag"
  );
}

function showAuthorName(p) {
  return (
    p.authorName ??
    p.authorUsername ??
    p.author?.username ??
    p.author?.displayName ??
    p.createdByUsername ??
    p.createdBy?.username ??
    "user"
  );
}

/* ---------- component ---------- */

export default function Community() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // feed state
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ items: [], page: 0, size: 20, total: 0 });

  // tags / filters
  const [allTags, setAllTags] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [disabledTags, setDisabledTags] = useState([]);
  const [active, setActive] = useState([]); // array of slugs
  const tagSlugs = useMemo(() => active, [active]);

  const topBarTags = useMemo(
    () => (topTags.length ? topTags : allTags.slice(0, 5)),
    [topTags, allTags]
  );

  // ui state
  const [query, setQuery] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // admin create-tag
  const [creating, setCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  // trending sidebar
  const [trends, setTrends] = useState([]);
  const [tLoading, setTLoading] = useState(true);
  const [tError, setTError] = useState(null);

  // roles
  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "MOD" ||
    user?.role === "MODERATOR" ||
    (Array.isArray(user?.roles) &&
      user.roles.some(r => ["ADMIN", "MOD", "MODERATOR"].includes(r)));


  async function reloadTags() {
    try {
      const [enabled, top, disabled] = await Promise.all([
        listTags(),
        listTopTags(5),
        isAdmin ? listDisabledTags() : Promise.resolve([]),
      ]);
      setAllTags(enabled);
      setTopTags(top);
      setDisabledTags(disabled);
    } catch (e) {
      console.error("Failed to reload tags", e);
    }
  }

  // initial load: tags (enabled/disabled/top)
  useEffect(() => {
    reloadTags();
  }, [isAdmin]);

  // trending sidebar
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getTrending({ window: "7d", limit: 5 });
        const items = Array.isArray(data) ? data : data.items ?? data.content ?? [];
        if (alive) setTrends(items);
      } catch (e) {
        if (alive) setTError(e);
      } finally {
        if (alive) setTLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // feed fetch
  async function load(p = page) {
    try {
      const res = await feed({
        page: p,
        size: 20,
        tags: tagSlugs,
        match: "OR",
        // search: query.trim() || undefined, // enable if you want backend search
      });
      setData(res);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load(0);
    setPage(0);
  }, [tagSlugs /*, query*/]);

  function toggleTag(slug) {
    setActive(prev => (prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]));
  }

  function handleCreated(post) {
    setOpenNew(false);
    if (post?.id) navigate(`/forum/${post.id}`, { state: { from: "/forum" } });
    else load(0);
  }

  async function onCreateTag(e) {
    e.preventDefault();
    const label = newTagName.trim();
    if (!label) return;
    try {
      await createTag({ label, slug: slugify(label) });
      setNewTagName("");
      setCreating(false);
      await reloadTags();
    } catch (e) {
      console.error("Failed to create tag", e);
    }
  }

  async function onDeleteTag(tag) {
    if (!window.confirm(`Disable tag “${tag.label}”?`)) return;
    try {
      await deleteTag(tag.id);
      setActive(prev => prev.filter(s => s !== tag.slug));
      await reloadTags();
    } catch (e) {
      console.error("Failed to disable tag", e);
    }
  }

  async function onEnableTag(tag) {
    if (!window.confirm(`Re-enable tag “${tag.label}”?`)) return;
    try {
      await enableTag(tag.id);
      await reloadTags();
    } catch (e) {
      console.error("Failed to re-enable tag", e);
    }
  }

  const trendingPosts = useMemo(() => trends ?? [], [trends]);

  // 🔎 client-side filtering of the current page
  const filteredPosts = useMemo(() => {
    const items = Array.isArray(data?.items) ? data.items : [];
    const q = query.trim();
    if (!q) return items;
    return items.filter(p => matches(p, q));
  }, [data.items, query]);

  return (
    <div className="resources-page community-page">
      <h1 className="page-title">Community</h1>

      <div className="resources-layout">
        {/* LEFT COLUMN: Feed */}
        <section
          className="map-card feed-card ra-calendar-card"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div className="feed-shell">
            {/* ROW 1: Search + Settings (left) | New Post (right) */}
            <div className="toolbar-row">
              <div className="toolbar-left">
                <div className="comm-search" role="search">
                  <span className="map-search__icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="map-search__divider" aria-hidden></span>

                  <input
                    className="map-search__input"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search community posts"
                    autoComplete="off"
                  />

                  {query && (
                    <button
                      type="button"
                      className="map-search__clear"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  className="ra-pillbtn ra-pillbtn--icon"
                  onClick={() => setShowFilters(v => !v)}
                  title="Filters & tag settings"
                  aria-label="Filters & tag settings"
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
              </div>

              <div className="toolbar-right">
                {user && (
                  <button
                    className="ra-pillbtn ra-pillbtn--primary"
                    onClick={() => setOpenNew(true)}
                    title="Create a new post"
                  >
                    + New Post
                  </button>
                )}
              </div>
            </div>

            {/* ROW 2: Tags full width */}
            <div className="filters-row--tagsOnly">
              <div className="tagbar__chips">
                {topBarTags.map((t) => {
                  const slug = t.slug;
                  const label = t.label?.startsWith("#") ? t.label : `# ${t.label || slug}`;
                  const isOn = active.includes(slug);
                  return (
                    <button
                      key={slug}
                      className={`ra-filter-close tagbtn ${isOn ? "is-active" : ""}`}
                      onClick={() => toggleTag(slug)}
                      aria-pressed={isOn}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feed list (filtered) */}
            <ul className="feed-list">
              {filteredPosts.length === 0 ? (
                <li className="comm-empty"><p>Related posts not found.</p></li>
              ) : (
                filteredPosts.map(p => <PostListItem key={p.id} post={p} />)
              )}
            </ul>

            {/* Pager */}
            <div className="feed-pager">
              <button
                className="pager-btn"
                onClick={() => {
                  const n = Math.max(0, page - 1);
                  setPage(n);
                  load(n);
                }}
                disabled={page <= 0}
              >
                Prev
              </button>
              <span className="pager-info">
                Page {data.page + 1} / {Math.max(1, Math.ceil(data.total / data.size))}
              </span>
              <button
                className="pager-btn"
                onClick={() => {
                  const n = page + 1;
                  setPage(n);
                  load(n);
                }}
                disabled={(data.page + 1) * data.size >= data.total}
              >
                Next
              </button>
            </div>
          </div>

          {/* RIGHT SLIDEOUT — expands left */}
          {showFilters && (
            <div role="dialog" aria-label="Forum filters" className="filters-panel">
              <div className="filters-panel__head">
                <h3>Filters</h3>
                <button className="ra-filter-close" onClick={() => setShowFilters(false)}>
                  Close
                </button>
              </div>

              <div className="filters-panel__body">
                <div className="filters-panel__row">
                  <div className="filters-panel__sectionTitle">Tags:</div>
                  <div className="tag-row">
                    {allTags.map((t) => {
                      const slug = t.slug;
                      const label = t.label?.startsWith("#") ? t.label : `# ${t.label || slug}`;
                      const isOn = active.includes(slug);
                      return (
                        <span key={slug} className="tagwrap">
                          <button
                            className={`ra-filter-close tagbtn ${isOn ? "is-active" : ""}`}
                            onClick={() => toggleTag(slug)}
                            aria-pressed={isOn}
                          >
                            {label}
                          </button>
                          {isAdmin && (
                            <button
                              className="delx"
                              title="Delete tag"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTag(t);
                              }}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {isAdmin && (
                  <div className="filters-panel__admin">
                    <div className="filters-panel__adminHeader">
                      <strong>Admin: Create Tag  </strong>
                      {!creating ? (
                        <button className="ra-filter-close" onClick={() => setCreating(true)}>
                          + Create tag
                        </button>
                      ) : (
                        <button className="ra-filter-close" onClick={() => setCreating(false)}>
                          Cancel
                        </button>
                      )}
                    </div>

                    {creating && (
                      <form onSubmit={onCreateTag} className="tag-admin__form">
                        <input
                          className="tag-admin__input"
                          placeholder="Tag name (e.g. rides)"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          autoFocus
                        />
                        <div className="tag-admin__actions">
                          <button type="button" className="ra-filter-close" onClick={() => setCreating(false)}>
                            Cancel
                          </button>
                          <button type="submit" className="ra-filter-primary">
                            Save
                          </button>
                        </div>
                      </form>
                    )}

                    {disabledTags.length > 0 && (
                      <div className="tag-admin__disabled">
                        <div className="tag-admin__disabledTitle">Disabled tags:</div>
                        <div className="tag-admin__disabledList">
                          {disabledTags.map((t) => {
                            const label =
                              t.label?.startsWith("#") ? t.label : `# ${t.label || t.slug}`;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                className="tagbtn tagbtn--disabled"
                                onClick={() => onEnableTag(t)}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

              <div className="filters-panel__footer">
                <button className="ra-filter-close" onClick={() => setActive([])}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Sidebar (Trending only) */}
        <aside className="sidebar">
          <div className="sidebar__inner">
            <div className="sidebar__title">TRENDING TOPICS</div>

            {tLoading && <div className="dim" style={{ padding: "6px 2px" }}>Loading…</div>}
            {tError && <div className="dim" style={{ padding: "6px 2px" }}>Couldn’t load trending.</div>}

            {!tLoading && !tError && (
              <ul className="trend-list" style={{ display: "grid", gap: "12px" }}>
                {trendingPosts.length === 0 && (
                  <li className="trend-empty">No trending topics yet.</li>
                )}
                {trendingPosts.map((p) => {
                  const author = showAuthorName(p);
                  return (
                    <li key={p.id} className="trend-item">
                      <button
                        className="trend-link ra-hoverable"
                        onClick={() => navigate(`/forum/${p.id}`, { state: { from: "/forum" } })}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "56px 1fr",
                          alignItems: "center",
                          gap: "14px",
                          width: "100%",
                          padding: "14px 16px",
                          borderRadius: "16px",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))",
                          border: "1px solid var(--grid)",
                          textAlign: "left",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            display: "grid",
                            placeItems: "center",
                            background: "rgba(166,217,138,.10)",
                            color: "var(--accent)",
                            fontWeight: 800,
                            fontSize: 11,
                          }}
                          aria-hidden
                        >
                          {(author || "U").slice(0, 3).toUpperCase()}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div className="trend-title">{p.title}</div>
                          <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>{author}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <NewPostModal open={openNew} onClose={() => setOpenNew(false)} onCreated={handleCreated} />
      </div>
    </div>
  );
}