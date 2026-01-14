import { Link } from "react-router-dom";
import { showUserName } from "../../utils/names";


function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  const mins = Math.floor(s / 60), hrs = Math.floor(s / 3600), days = Math.floor(s / 86400);
  if (days >= 1) return `${days}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return `${s}s ago`;
}

export default function PostListItem({ post }) {
  if (!post || !post.id) return null;

  const author = showUserName(post);
  const when = post.relativeTime || post.age || timeAgo(post.createdAt);

  return (
    <li className="post-item">
      <Link
        to={`/community/${post.id}`}
        className="clickable"
        title={post.title}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "56px 1fr",
            gap: 14,
            padding: "18px 18px 14px 26px",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              background: "#1a2120",
              display: "grid",
              placeItems: "center",
              border: "1px solid var(--ring)",
              flex: "0 0 56px",
            }}
            aria-hidden
          >
            <span style={{ color: "var(--ink)", fontWeight: 800 }}>
              {(author || "A").charAt(0).toUpperCase()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="post-title" style={{ fontSize: 22, marginBottom: 8 }}>
              {post.title}
            </div>

            {/* tags left + meta right, single row */}
            <div className="post-row">
              <div className="post-tags">
                {(post.tags ?? []).map((t) => {
                  const label = t.label || t.name || t.slug || "";
                  const key = t.slug || label || String(Math.random());
                  return (
                    <span key={key} className="post-chip">
                      #{label}
                    </span>
                  );
                })}
              </div>

              <div className="post-meta">
                <span>{author}</span>
                {when && (
                  <>
                    <span>·</span>
                    <time dateTime={post.createdAt || ""}>{when}</time>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}