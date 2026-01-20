import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { getAlbumByPublicId, listImagesForAlbum } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AlbumPage({ params }: { params: { id: string } }) {
  const publicId = params.id;
  if (!publicId) {
    notFound();
  }

  const album = await getAlbumByPublicId(publicId);
  if (!album) {
    notFound();
  }

  if (album.visibility === 'private' && !isAuthed()) {
    return (
      <>
        <nav className="nav">
          <a className="logo" href="/">Sudip's Gallery</a>
          <Link className="button" href="/">Back to gallery</Link>
        </nav>
        <main>
          <div className="container">
            <div className="panel">
              <h1>This album is private.</h1>
              <p>Ask an admin to change the privacy settings if you need access.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const images = await listImagesForAlbum(album.id);
  const visibleImages = isAuthed() ? images : images.filter((image) => image.visibility !== 'private');

  return (
    <>
      <nav className="nav">
        <a className="logo" href="/">Sudip's Gallery</a>
        <Link className="button" href="/">Back to gallery</Link>
      </nav>
      <main>
        <div className="container">
          <section className="hero">
            <div>
              <h1>{album.title}</h1>
              <p>{album.description || 'Album collection'}</p>
              <div className="hero-cta">
                <span className="badge">{album.tag || 'Album'}</span>
                <span className="badge">{album.visibility || 'public'}</span>
              </div>
            </div>
          </section>
          <section className="masonry">
            {visibleImages.map((image) => (
              <Link className="card card-button masonry-item" key={image.id} href={`/images/${image.public_id}`}>
                <img src={image.thumb_url || image.url} alt={image.title || `Gallery item ${image.id}`} loading="lazy" />
                <div className="meta">
                  {image.title ? <strong>{image.title}</strong> : null}
                  <div>{image.description || 'View details'}</div>
                </div>
              </Link>
            ))}
            {visibleImages.length === 0 && <div className="notice">No images in this album yet.</div>}
          </section>
        </div>
      </main>
    </>
  );
}
