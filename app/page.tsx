import HomeGalleryClient from './HomeGalleryClient';
import {
  getProfileImage,
  listAlbumPreviewImages,
  listAlbumsPublic,
  listFeaturedPublic,
  listImagesPublic
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [albums, images, featured, profileImage] = await Promise.all([
    listAlbumsPublic(),
    listImagesPublic(),
    listFeaturedPublic(),
    getProfileImage()
  ]);
  const previews = await Promise.all(albums.map((album) => listAlbumPreviewImages(album.id, 4)));

  return (
    <>
      <div className="container">
        <nav className="nav">
          <div className="logo">Sudip Mandal</div>
          <div className="nav-actions">
            <a className="button ghost" href="https://wa.me/917908897908?text=Hi%20Sudip%20Mandal%2C%20I%27d%20like%20to%20hire%20you%20for%20a%20shoot.">Contact</a>
            <a className="button" href="/login">Admin</a>
          </div>
        </nav>

        <main>
          {/* Hero: Editorial Layout */}
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Portraits / Editorial / Weddings</span>
              <h1>Light-forward frames built for timeless stories.</h1>
              <p>
                Professional photography by Sudip Mandal. Clean compositions, unforced poses, and tactile edits that keep the day&rsquo;s energy intact across India and beyond.
              </p>
              <div className="hero-tags">
                <span className="chip">Natural light</span>
                <span className="chip">Documentary calm</span>
                <span className="chip">Print-ready exports</span>
              </div>
              <div className="hero-cta">
                <a className="button primary" href="#gallery">View Portfolio</a>
                <a className="button ghost" href="https://wa.me/917908897908">Book a Session &rarr;</a>
              </div>
              <div className="hero-meta">
                <div className="meta-card">
                  <span className="meta-label">Base</span>
                  <strong>Kolkata / Across India</strong>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Approach</span>
                  <strong>Editorial, quiet, human</strong>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-frame">
                <div className="hero-portrait">
                  {profileImage?.url ? (
                    <img src={profileImage.url} alt="Sudip Mandal" />
                  ) : (
                    <div className="hero-placeholder">
                      <span>Portrait coming soon</span>
                    </div>
                  )}
                </div>
                <div className="hero-caption">
                  <div>
                    <p>Sudip Mandal</p>
                    <span>Available worldwide</span>
                  </div>
                  <span className="chip subtle">Light-first edits</span>
                </div>
              </div>
              <div className="hero-floating">
                <span className="pulse-dot" aria-hidden="true" />
                <div>
                  <p>Featured sets</p>
                  <strong>Raw, tactile tones</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Featured: Offset Grid */}
          {featured.length > 0 && (
            <section className="featured">
              <div className="section-header featured-header">
                <div>
                  <span className="eyebrow">Signature sets</span>
                  <h2>Featured frames</h2>
                </div>
                <p className="section-lede">A rotating set of images with honest light and restrained color work.</p>
              </div>
              <div className="featured-mosaic">
                {featured.map((image, index) => (
                  <a className="featured-tile" key={image.id} href={`/images/${image.public_id}`}>
                    <img src={image.url} alt={image.title || 'Featured'} loading="lazy" />
                    <div className="featured-tile-overlay">
                      <div>
                        <span className="meta-label">Set {String(index + 1).padStart(2, '0')}</span>
                        <p>{image.title || 'Untitled frame'}</p>
                      </div>
                      <span className="chip subtle">View</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Albums: Clean List View */}
          <section className="albums">
            <div className="section-header albums-header">
              <div>
                <span className="eyebrow">Collections</span>
                <h2>Albums</h2>
                <p className="section-lede">Curated sets with cohesive tones and stories.</p>
              </div>
              <div className="album-card-meta">
                <span className="chip subtle">{albums.length} albums</span>
                <a className="button ghost" href="#gallery">Jump to archive</a>
              </div>
            </div>
            <div className="album-showcase-grid">
              {albums.map((album, index) => {
                const previewImages = previews[index] || [];
                const heroImage = previewImages[0];
                const restImages = previewImages.slice(1, 5);
                const fillers = Array.from({ length: Math.max(0, 4 - restImages.length) });
                return (
                  <a className="album-card" key={album.id} href={`/albums/${album.public_id}`}>
                    <div className="album-card-media">
                      {heroImage ? (
                        <div className="album-thumb primary">
                          <img src={heroImage.thumb_url || heroImage.url} alt="" />
                        </div>
                      ) : (
                        <div className="album-thumb primary placeholder">
                          <span>No preview</span>
                        </div>
                      )}
                      {restImages.map((image) => (
                        <div className="album-thumb" key={image.id}>
                          <img src={image.thumb_url || image.url} alt="" />
                        </div>
                      ))}
                      {fillers.map((_, fillIndex) => (
                        <div className="album-thumb placeholder" key={`fill-${album.id}-${fillIndex}`}>
                          <span>Preview</span>
                        </div>
                      ))}
                    </div>
                    <div className="album-card-body">
                      <h3>{album.title}</h3>
                      <p>{album.description || 'Story-driven images with gentle color work.'}</p>
                      <div className="album-card-meta">
                        <span className="chip subtle">{album.tag || 'Album'}</span>
                        <span className="chip subtle">{album.visibility || 'public'}</span>
                        <span className="chip subtle">{previewImages.length || 0} previews</span>
                      </div>
                    </div>
                    <div className="album-card-footer">
                      <span>View album</span>
                      <span className="chip subtle">Open</span>
                    </div>
                  </a>
                );
              })}
              {albums.length === 0 && <div className="notice">No albums found.</div>}
            </div>
          </section>

          {/* All Images: Masonry */}
          <section id="gallery">
            <div className="section-header">
              <h2>Archive</h2>
            </div>
            <HomeGalleryClient images={images} />
          </section>
        </main>
      </div>
    </>
  );
}
