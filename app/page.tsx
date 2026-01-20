import HomeGalleryClient from './HomeGalleryClient';
import { listAlbumPreviewImages, listAlbumsPublic, listFeaturedPublic, listImagesPublic } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [albums, images, featured] = await Promise.all([
    listAlbumsPublic(),
    listImagesPublic(),
    listFeaturedPublic()
  ]);
  const previews = await Promise.all(albums.map((album) => listAlbumPreviewImages(album.id, 3)));

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
            {albums.map((album, index) => (
              <a className="album-card" key={album.id} href={`/albums/${album.public_id}`}>
                <div className="album-badge">{album.tag || 'Album'}</div>
                <h3>{album.title}</h3>
                <p>{album.description || 'View album'}</p>
                <div className="album-preview">
                  {previews[index]?.map((image) => (
                    <img
                      key={image.id}
                      src={image.thumb_url || image.url}
                      alt={image.title || 'Album preview'}
                      loading="lazy"
                    />
                  ))}
                </div>
                <div className="button ghost">View more</div>
              </a>
            ))}
            {albums.length === 0 && (
              <div className="notice">No public albums yet. Create one from the admin dashboard.</div>
            )}
          </section>
          {featured.length ? (
            <section className="featured">
              <div className="featured-header">
                <h2>Featured</h2>
                <p className="muted">Selected highlights from recent sessions.</p>
              </div>
              <div className="featured-grid">
                {featured.map((image) => (
                  <a className="featured-card" key={image.id} href={`/images/${image.public_id}`}>
                    <img src={image.url} alt={image.title || `Featured image ${image.id}`} loading="lazy" />
                    <div className="featured-meta">
                      <h3>{image.title || 'Untitled'}</h3>
                      <p>{image.description || 'View details'}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
          <HomeGalleryClient images={images} />
        </div>
      </main>
    </>
  );
}
