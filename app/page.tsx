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
            <div className="hero-content">
              <h1>Visual storytelling<br/> with honest light.</h1>
              <p>
                Professional photography by Sudip Mandal. Capturing portraits, events, and editorial stories across India with a focus on clean aesthetics and raw emotion.
              </p>
              <div className="hero-cta">
                <a className="button primary" href="#gallery">View Portfolio</a>
                <a className="button ghost" href="https://wa.me/917908897908">Book a Session &rarr;</a>
              </div>
            </div>
            <div className="hero-image-frame">
              {profileImage?.url ? (
                <img src={profileImage.url} alt="Sudip Mandal" />
              ) : (
                <div style={{width: '100%', height: '100%', background: '#f4f4f4', display: 'grid', placeItems: 'center', color: '#888'}}>
                  Profile Image
                </div>
              )}
            </div>
          </section>

          {/* Featured: Offset Grid */}
          {featured.length > 0 && (
            <section className="featured">
              <div className="section-header">
                <h2>Selected Works</h2>
              </div>
              <div className="featured-grid">
                {featured.map((image) => (
                  <a className="featured-item" key={image.id} href={`/images/${image.public_id}`}>
                    <img src={image.url} alt={image.title || 'Featured'} loading="lazy" />
                    <div className="featured-overlay">
                      <h3>{image.title}</h3>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Albums: Clean List View */}
          <section className="albums">
            <div className="section-header">
              <h2>Collections</h2>
              <span className="muted">{albums.length} Albums</span>
            </div>
            <div className="album-list-view">
              {albums.map((album, index) => (
                <a className="album-row-item" key={album.id} href={`/albums/${album.public_id}`}>
                  <div className="album-info">
                    <h3>{album.title}</h3>
                    <p>{album.description || 'No description'}</p>
                  </div>
                  <div className="album-preview-thumbs">
                    {previews[index]?.map((image) => (
                      <img key={image.id} src={image.thumb_url || image.url} alt="" />
                    ))}
                  </div>
                </a>
              ))}
              {albums.length === 0 && (
                <div className="notice">No albums found.</div>
              )}
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