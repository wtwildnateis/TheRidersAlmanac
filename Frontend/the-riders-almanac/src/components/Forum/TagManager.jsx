import { useEffect, useState } from 'react';
import { listTags, createTag, deleteTag } from '../../lib/forumApi';
import { extractApiMessage } from '../../lib/errors';
import { userIsStaff } from './ForumAuth';
import { slugify } from '../../lib/slugify';

export default function TagManager({ hasAnyRole }) {
    const [tags, setTags] = useState([]);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#111827');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    const staff = userIsStaff(hasAnyRole);

    async function load() { try { setTags(await listTags()); } catch (e) { console.error(e); } }
    useEffect(() => { if (staff) load(); }, [staff]);

    async function onCreate(e) {
        e.preventDefault();
        setBusy(true); setErr('');
        try {
            const label = name.trim();
            await createTag({ label, slug: slugify(label) }); setName('');
            await load();
        } catch (e) {
            setErr(extractApiMessage(e));
        } finally {
            setBusy(false);
        }
    }

    async function onDelete(id) {
        if (!confirm('Delete this tag?')) return;
        try { await deleteTag(id); await load(); } catch (e) {
            setErr(extractApiMessage(e));
        }

        if (!staff) return null;

        return (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
                <h3 style={{ marginTop: 0 }}>Tag Manager</h3>
                <form onSubmit={onCreate} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="New tag name"
                        required
                        style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8 }}
                    />
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                    <button disabled={busy} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', cursor: 'pointer' }}>
                        {busy ? 'Creating…' : 'Create'}
                    </button>
                    {err && <span style={{ color: 'crimson' }}>{err}</span>}
                </form>

                <ul style={{ marginTop: 12, display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    {tags.map(t => (
                        <li key={t.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 999, background: t.color || '#111827' }} />
                                <span>{t.name}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => onDelete(t.id)}
                                style={{ border: '1px solid #ef4444', color: '#ef4444', background: '#fff', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}