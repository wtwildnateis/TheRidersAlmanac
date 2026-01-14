import { useState } from 'react';
import { createPost } from '../../lib/forumApi';
import TagPicker from './TagPicker';
import TagChips from './TagChips';
import { extractApiMessage } from '../../lib/errors';
import { uploadImage } from '../../lib/uploads';

export default function PostComposer({ onCreated }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState([]);
    const [images, setImages] = useState([]); // array of URLs
    const [uploading, setUploading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    async function onPickImages(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        try {
            const urls = [];
            for (const f of files) {
                const url = await uploadImage(f); // post /api/uploads/image
                urls.push(url);
            }
            setImages(prev => [...prev, ...urls]);
        } catch (err) {
            alert(extractApiMessage(err));
        } finally {
            setUploading(false);
            e.target.value = ''; 
        }
    }

    function removeImage(url) {
        setImages(prev => prev.filter(u => u !== url));
    }

    async function submit(e) {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        setBusy(true); setErr('');
        try {
            const created = await createPost({ title, body, tags: tags.map(t => t.slug ?? t), imageUrls: images });
            setTitle(''); setBody(''); setTags([]); setImages([]);
            onCreated?.(created);
        } catch (e) {
            setErr(extractApiMessage(e));
        } finally { setBusy(false); }
    }

    return (
        <form onSubmit={submit} style={{ margin: '16px 0', padding: 12, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>Create Post</h3>
            <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: 8 }}
                required
            />
            <textarea
                placeholder="Say something…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                style={{ display: 'block', width: '100%' }}
                required
            />

            <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Tags</label>
                <TagPicker value={tags} onChange={setTags} />
                <div style={{ marginTop: 8 }}>
                    <TagChips
                        tags={tags}
                        onRemove={(t) => setTags(tags.filter(x => (x.id ?? x) !== (t.id ?? t)))}
                    />
                </div>
            </div>

            {/* Images */}
            <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Photos</label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPickImages}
                    disabled={uploading}
                />
                {uploading && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Uploading…</div>}

                {!!images.length && (
                    <div style={{
                        marginTop: 10,
                        display: 'grid',
                        gap: 8,
                        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))'
                    }}>
                        {images.map(url => (
                            <div key={url} style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                                <img src={url} alt="" style={{ width: '100%', height: 96, objectFit: 'cover', display: 'block' }} />
                                <button
                                    type="button"
                                    onClick={() => removeImage(url)}
                                    title="Remove"
                                    style={{
                                        position: 'absolute', top: 4, right: 4, border: 'none',
                                        background: 'rgba(0,0,0,.6)', color: '#fff', borderRadius: 6, padding: '2px 6px', cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {err && <div style={{ color: 'crimson', marginTop: 8 }}>{err}</div>}
            <button type="submit" disabled={busy} style={{ marginTop: 8 }}>
                {busy ? 'Posting…' : 'Create Post'}
            </button>
        </form>
    );
}