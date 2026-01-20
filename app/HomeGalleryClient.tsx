'use client';

import { ChevronLeft, ChevronRight, Eye, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ImageRecord = {
  id: number;
  url: string;
  thumb_url: string | null;
  title: string | null;
  description: string | null;
  public_id: string;
};

export default function HomeGalleryClient({ images }: { images: ImageRecord[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const activeImage = useMemo(() => {
    if (activeIndex === null) return null;
    return images[activeIndex] || null;
  }, [activeIndex, images]);

  const openAt = (index: number) => {
    setActiveIndex(index);
    setImageLoading(true);
  };
  const close = () => setActiveIndex(null);
  const next = () => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % images.length);
    setImageLoading(true);
  };
  const prev = () => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
    setImageLoading(true);
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex]);

  return (
    <>
      <section className="justified">
        {images.map((image, index) => (
          <button
            className="card card-button justified-item"
            key={image.id}
            type="button"
            onClick={() => openAt(index)}
          >
            <img src={image.thumb_url || image.url} alt={image.title || `Gallery item ${image.id}`} loading="lazy" />
            <div className="meta">
              {image.title ? <strong>{image.title}</strong> : null}
              <div>{image.description || 'View details'}</div>
            </div>
          </button>
        ))}
        {images.length === 0 && (
          <div className="notice">No images yet. Use the admin dashboard to upload the first set.</div>
        )}
      </section>

      {activeImage ? (
        <div className="lightbox" role="dialog" aria-modal="true">
          <div className="lightbox-backdrop" onClick={close} />
          <div className="lightbox-card">
            <button className="lightbox-nav prev" type="button" onClick={prev} aria-label="Previous image">
              <ChevronLeft aria-hidden="true" />
            </button>
            <div className="lightbox-image-wrap">
              {imageLoading ? (
                <div className="lightbox-loading">
                  <Loader2 aria-hidden="true" />
                  <span>Loading image</span>
                </div>
              ) : null}
              <img
                className="lightbox-image"
                src={activeImage.url}
                alt={activeImage.title || 'Gallery image'}
                onLoad={() => setImageLoading(false)}
              />
            </div>
            <button className="lightbox-nav next" type="button" onClick={next} aria-label="Next image">
              <ChevronRight aria-hidden="true" />
            </button>
            <div className="lightbox-meta">
              <div>
                <h3>{activeImage.title || 'Untitled'}</h3>
                <p>{activeImage.description || 'No description provided.'}</p>
              </div>
              <div className="lightbox-actions">
                <a className="button primary" href={`/images/${activeImage.public_id}`}>
                  <Eye aria-hidden="true" />
                  View details
                </a>
                <button className="button" type="button" onClick={close}>
                  <X aria-hidden="true" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
