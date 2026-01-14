import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

export default function ImageLightbox({ images = [], index = 0, onClose }) {
  const [i, setI] = useState(index);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') setI(v => (v + 1) % images.length);
      if (e.key === 'ArrowLeft')  setI(v => (v - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="ImageLightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="ImageLightbox__backdrop" />
      <div className="ImageLightbox__content" onClick={e => e.stopPropagation()}>
        <button
          className="ImageLightbox__close"
          aria-label="Close"
          title="Close"
          onClick={onClose}
        >
          ×
        </button>

        <img
          className="ImageLightbox__img"
          src={images[i]}
          alt=""
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
}