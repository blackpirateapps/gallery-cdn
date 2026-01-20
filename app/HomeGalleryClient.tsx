'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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

  const activeImage = useMemo(() => {
    if (activeIndex === null) return null;
    return images[activeIndex] || null;
  }, [activeIndex, images]);

  const openAt = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);
  
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % images.length);
  };
  
  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
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
      <section className="masonry">
        {images.map((image, index) => (
          <button
            className="masonry-item"
            key={image.id}
            type="button"
            onClick={() => openAt(index)}
          >
            <img 
              src={image.thumb_url || image.url} 
              alt={image.title || ''} 
              loading="lazy" 
            />
            {(image.title || image.description) && (
              <div className="meta">
                {image.title || 'View image'}
              </div>
            )}
          </button>
        ))}
        {images.length === 0 && (
          <div className="notice">No images available in the archive yet.</div>
        )}
      </section>

      {activeImage && (
        <div className="lightbox" role="dialog">
          <div className="lightbox-backdrop" onClick={close} />
          
          <div className="lightbox-card">
            <div className="lightbox-image-wrap" onClick={close}>
               <button className="lightbox-nav prev" onClick={prev}>
                <ChevronLeft size={32} />
              </button>

              <img
                className="lightbox-image"
                src={activeImage.url}
                alt={activeImage.title || ''}
                onClick={(e) => e.stopPropagation()} 
              />
              
              <button className="lightbox-nav next" onClick={next}>
                <ChevronRight size={32} />
              </button>

               <div className="lightbox-meta" onClick={(e) => e.stopPropagation()}>
                <strong>{activeImage.title || 'Untitled'}</strong>
              </div>
            </div>
            
            <button 
              className="lightbox-nav" 
              style={{position: 'absolute', top: 20, right: 20}} 
              onClick={close}
            >
              <X size={32} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}