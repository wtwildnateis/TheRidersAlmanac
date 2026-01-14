import { useEffect, useMemo, useRef, useState } from 'react';
import { listTags } from '../../lib/forumApi';

export default function TagPicker({ value = [], onChange, placeholder = 'Select tag(s)…', disabled }) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState([]);
  const [q, setQ] = useState('');
  const btnRef = useRef(null);

  useEffect(() => { listTags().then(setAll).catch(console.error); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter(t => t.label.toLowerCase().includes(term));
  }, [all, q]);

  const selectedSlugs = useMemo(() => new Set(value.map(v => v.slug ?? v)), [value]);

  function toggle(tag) {
    const slug = tag.slug;
    if (selectedSlugs.has(slug)) onChange(value.filter(v => (v.slug ?? v) !== slug));
    else onChange([...value, tag]);
  }

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      const menu = btnRef.current?.nextSibling;
      if (btnRef.current && !btnRef.current.contains(e.target) && menu && !menu.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <button
        ref={btnRef}
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        type="button"
        style={{
          width:'100%', display:'inline-flex', justifyContent:'space-between',
          alignItems:'center', gap:8, border:'1px solid #d1d5db', background:'#fff',
          padding:'8px 10px', borderRadius:10, cursor:'pointer'
        }}
      >
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {value.length ? `${value.length} tag${value.length > 1 ? 's' : ''} selected` : placeholder}
        </span>
        <span>▾</span>
      </button>

      {open && (
        <div
          style={{
            position:'absolute', zIndex:20, marginTop:8, width:'100%',
            border:'1px solid #e5e7eb', borderRadius:10, background:'#fff',
            boxShadow:'0 10px 20px rgba(0,0,0,.08)'
          }}
        >
          <div style={{ borderBottom:'1px solid #f1f5f9', padding:8 }}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search tags"
              style={{ width:'100%', padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8 }}
            />
          </div>
          <div style={{ maxHeight:260, overflow:'auto', padding:8 }}>
            {!filtered.length && <div style={{ fontSize:12, color:'#6b7280', padding:10 }}>No tags found</div>}
            {filtered.map(tag => {
              const checked = selectedSlugs.has(tag.slug);
              return (
                <label key={tag.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(tag)} />
                  <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:10, height:10, borderRadius:999, background: tag.color || '#111827' }} />
                    <span style={{ fontSize:14 }}>{tag.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {value.length > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', gap:8, padding:8, borderTop:'1px solid #f1f5f9', background:'#fafafa', borderBottomLeftRadius:10, borderBottomRightRadius:10 }}>
              <button type="button" onClick={() => onChange([])} style={{ fontSize:12, padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer' }}>Clear</button>
              <button type="button" onClick={() => setOpen(false)} style={{ fontSize:12, padding:'6px 10px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}>Done</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}