import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feed } from '../lib/forumApi';
import { useAuthStore } from '../stores/auth';
import { useAuthStoreRoles } from '../stores/auth';

import TagPicker from '../components/Forum/TagPicker';
import TagChips from '../components/Forum/TagChips';
import TagManager from '../components/Forum/TagManager';
import PostListItem from '../components/Forum/PostListItem';
import NewPostModal from '../components/Forum/NewPostModal';

export default function ForumList() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ items: [], page: 0, size: 20, total: 0 });
  const [filterTags, setFilterTags] = useState([]);
  const [openNew, setOpenNew] = useState(false);

  const { user } = useAuthStore();
  const { hasAnyRole } = useAuthStoreRoles();
  const navigate = useNavigate();

  async function load(p = page) {
    try {
      setData(await feed({ page: p, size: 20, tags: filterTags.map(t => t.slug ?? t), match: 'OR' }));
    } catch (e) { console.error(e); }
  }
  useEffect(() => { load(0); setPage(0); }, [filterTags]);

  function handleCreated(post) {
    setOpenNew(false);
    // navigate directly to the new post
    if (post?.id) navigate(`/community/${post.id}`);
    else load(0); // fallback
  }

  return (
    <div className="universalpagecontainer" style={{ color:'#e5e7eb' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <h1 style={{ margin:'8px 0' }}>Community</h1>

        {user && (
          <button
            onClick={() => setOpenNew(true)}
            style={{
              background:'#10b981', color:'#06251a', border:'1px solid #065f46',
              borderRadius:10, padding:'8px 12px', cursor:'pointer', fontWeight:700
            }}
          >
            + New Post
          </button>
        )}
      </div>

      {/* Filter bar (tags + search placeholder) */}
      <div style={{ margin:'12px 0', padding:12, border:'1px solid #111827', borderRadius:12, background:'#0b0f14' }}>
        <div style={{ display:'grid', gap:8 }}>
          <div style={{ display:'grid', gap:8, gridTemplateColumns:'1fr 220px' }}>
            <TagPicker value={filterTags} onChange={setFilterTags} placeholder="Filter by tag(s)..." />
            <input
              placeholder="Search (coming soon)…"
              disabled
              style={{ padding:'8px 10px', border:'1px solid #1f2937', borderRadius:10, background:'#0b0f14', color:'#6b7280' }}
            />
          </div>
          <TagChips
            tags={filterTags}
            onRemove={(t) => setFilterTags(filterTags.filter(x => (x.slug ?? x) !== (t.slug ?? t)))}
          />
        </div>
      </div>

      {/* Post list */}
      <ul style={{ padding:0, margin:0, display:'grid', gap:10 }}>
        {data.items.map(p => <PostListItem key={p.id} post={p} />)}
      </ul>

      {/* Pager */}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
        <button onClick={() => { const n = Math.max(0, page - 1); setPage(n); load(n); }} disabled={page <= 0}>Prev</button>
        <span style={{ fontSize:12, opacity:.7 }}>Page {data.page + 1} / {Math.max(1, Math.ceil(data.total / data.size))}</span>
        <button
          onClick={() => { const n = page + 1; setPage(n); load(n); }}
          disabled={((data.page + 1) * data.size) >= data.total}
        >
          Next
        </button>
      </div>

      {/* Staff-only Tag Manager (keep it for now; you can later move to an Admin page) */}
      {user && <div style={{ marginTop:16 }}><TagManager hasAnyRole={hasAnyRole} /></div>}

      {/* Composer modal */}
      <NewPostModal open={openNew} onClose={() => setOpenNew(false)} onCreated={handleCreated} />
    </div>
  );
}