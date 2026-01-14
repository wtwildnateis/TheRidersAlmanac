import { useState, useMemo } from 'react';
import ImageLightbox from './ImageLightbox';

export function PostImagesPreview({ urls = [], variant = 'default' }) {
    const [lightbox, setLightbox] = useState({ open: false, index: 0 });

    const { thumbs, extra, gridStyle, cellStyle } = useMemo(() => {
        const maxThumbs = variant === 'compact' ? Math.min(6, urls.length) : Math.min(3, urls.length);
        const thumbs = urls.slice(0, maxThumbs);
        const extra = urls.length - thumbs.length;
        const thumbSize = variant === 'compact' ? 96 : undefined; // px (fixed squares for compact)
        const gridStyle =
            variant === 'compact'
                ? { display: 'grid', gap: 6, gridAutoFlow: 'column', alignItems: 'start' }
                : { display: 'grid', gap: 6, gridTemplateColumns: thumbs.length >= 2 ? '1fr 1fr 1fr' : '1fr' };
        const cellStyle =
            variant === 'compact'
                ? {
                    width: thumbSize, height: thumbSize, borderRadius: 8, overflow: 'hidden',
                    border: '1px solid #e5e7eb', cursor: 'zoom-in', position: 'relative', flex: '0 0 auto'
                }
                : {
                    position: 'relative', borderRadius: 8, overflow: 'hidden',
                    border: '1px solid #e5e7eb', cursor: 'zoom-in', aspectRatio: '1 / 1'
                };
        return { thumbs, extra, gridStyle, cellStyle };
    }, [urls, variant]);


    return (
        <div style={{ marginTop: 8 }}>
            <div style={gridStyle}>
                {thumbs.map((u, idx) => (
                    <div
                        key={u}
                        onClick={() => setLightbox({ open: true, index: idx })}
                        style={cellStyle}
                    >
                        <img src={u} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {idx === thumbs.length - 1 && extra > 0 && (
                            <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700
                            }}>+{extra}</div>
                        )}
                    </div>
                ))}
            </div>

            {lightbox.open && (
                <ImageLightbox
                    images={urls}
                    index={lightbox.index}
                    onClose={() => setLightbox({ open: false, index: 0 })}
                />
            )}
        </div>
    );
}