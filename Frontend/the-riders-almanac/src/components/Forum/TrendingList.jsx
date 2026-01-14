import { useMemo } from "react";

function TrendingList({ posts = [], onOpen }) {
  const items = useMemo(() => posts.slice(0, 5), [posts]);

  return (
    <div className="sidebar-card">
      <div className="sidebar-title">TRENDING TOPICS</div>
      <ul className="sidebar-list">
        {items.map((p) => (
          <li key={p.id} className="row">
            {/* left badge (initials) – swap to avatar if you have one */}
            <div className="row-badge">
              {(p.authorName || "U").slice(0, 3).toUpperCase()}
            </div>

            {/* main */}
            <button className="row-main" onClick={() => onOpen?.(p.id)}>
              <div className="row-title">{p.title}</div>
              <div className="row-sub">
                <span className="row-author">{p.authorName || "user"}</span>
                {/* hide points entirely */}
                {/* <span className="row-dot">•</span>
                <span className="row-points">{p.points ?? 0} pts</span> */}
              </div>
            </button>

            {/* right icon */}
            <div className="row-cta" aria-hidden>
              {/* checkmark circle to mirror Upcoming; replace with your icon if you have one */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" className="cta-ring"/>
                <path d="M7 12l3 3 7-7" className="cta-tick" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default TrendingList;
