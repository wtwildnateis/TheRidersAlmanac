export default function TagChips({ tags = [], onRemove }) {
  if (!tags.length) return null;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {tags.map(t => (
        <span
          key={t.slug}
          style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'4px 10px', border:'1px solid #e5e7eb',
            borderRadius:999, background:'#f6f7fb', fontSize:12
          }}
        >
          <span style={{ width:8, height:8, borderRadius:999, background: t.color || '#111827' }} />
          <span>{t.label}</span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(t)}
              aria-label={`Remove ${t.name}`}
              style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:14, lineHeight:1 }}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}