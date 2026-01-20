import Link from 'next/link';
import { listImages } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const images = await listImages();

  return (
    <>
      <nav className="nav">
        <div className="logo">Gallery CDN</div>
        <a className="button" href="/login">Admin</a>
      </nav>
      <main>
        <div className="container">
          <section className="hero">
            <div>
              <h1>Quiet frames, loud stories.</h1>
              <p>Minimal gallery backed by Turso and Cloudflare R2 for fast, durable image delivery.</p>
            </div>
            <div className="notice">
              Uploads are managed from the admin dashboard. Public visitors see a curated feed.
            </div>
          </section>
          <section className="grid">
            {images.map((image) => (
              <Link className="card" key={image.id} href={`/images/${image.id}`}>
                <img src={image.thumb_url || image.url} alt={`Gallery item ${image.id}`} loading="lazy" />
                <div className="meta">
                  {image.title ? <strong>{image.title}</strong> : null}
                  <div>{image.description || new Date(image.created_at).toLocaleDateString()}</div>
                </div>
              </Link>
            ))}
            {images.length === 0 && (
              <div className="notice">No images yet. Use the admin dashboard to upload the first set.</div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
