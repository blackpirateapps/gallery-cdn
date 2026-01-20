import HomeGalleryClient from './HomeGalleryClient';
import { listAlbumsPublic, listImagesPublic } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [albums, images] = await Promise.all([listAlbumsPublic(), listImagesPublic()]);

  return (
    <>
      <nav className="nav">
        <div className="logo">Sudip's Gallery</div>
        <div className="nav-actions">
          <a className="button ghost" href="https://wa.me/917908897908?text=Hi%20Sudip%2C%20I%27d%20like%20to%20hire%20you%20for%20a%20shoot.">Hire me</a>
          <a className="button" href="/login">Admin</a>
        </div>
      </nav>
      <main>
        <div className="container">
          <section className="hero">
            <div>
              <h1>Sudip's Gallery</h1>
              <p>Professional photography for portraits, events, and editorial stories. Clean visuals, honest light, and a modern gallery experience.</p>
              <div className="hero-cta">
                <a className="button primary" href="https://wa.me/917908897908?text=Hi%20Sudip%2C%20I%27d%20like%20to%20hire%20you%20for%20a%20shoot.">Hire me on WhatsApp</a>
                <span className="badge">Available for bookings</span>
              </div>
            </div>
            <div className="notice">
              Curated highlights from recent shoots. For bookings and collaborations, reach out directly.
            </div>
          </section>
          <section className="album-grid">
            {albums.map((album) => (
              <a className="album-card" key={album.id} href={`/albums/${album.public_id}`}>
                <div className="album-badge">{album.tag || 'Album'}</div>
                <h3>{album.title}</h3>
                <p>{album.description || 'View album'}</p>
              </a>
            ))}
            {albums.length === 0 && (
              <div className="notice">No public albums yet. Create one from the admin dashboard.</div>
            )}
          </section>
          <HomeGalleryClient images={images} />
        </div>
      </main>
    </>
  );
}
