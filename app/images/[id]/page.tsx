import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { getImageByPublicId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ImageDetailPage({ params }: { params: { id: string } }) {
  const publicId = params.id;
  if (!publicId) {
    notFound();
  }
  const image = await getImageByPublicId(publicId);
  if (!image) {
    notFound();
  }

  if (image.visibility === 'private' && !isAuthed()) {
    return (
      <>
        <nav className="nav">
          <a className="logo" href="/">Sudip Mandal</a>
          <Link className="button" href="/">Back to gallery</Link>
        </nav>
        <main>
          <div className="container">
            <div className="panel">
              <h1>This image is private.</h1>
              <p>Ask an admin to change the privacy settings if you need access.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const exifRows = [
    ['Camera', [image.exif_make, image.exif_model].filter(Boolean).join(' ')],
    ['Lens', image.exif_lens],
    ['Aperture', image.exif_fnumber],
    ['Exposure', image.exif_exposure],
    ['ISO', image.exif_iso],
    ['Focal length', image.exif_focal],
    ['Taken at', image.exif_taken_at],
    ['Latitude', image.exif_lat],
    ['Longitude', image.exif_lng]
  ].filter(([, value]) => value);

  return (
    <>
      <nav className="nav">
        <a className="logo" href="/">Sudip Mandal</a>
        <Link className="button" href="/">Back to gallery</Link>
      </nav>
      <main>
        <div className="container detail">
          <img className="detail-image" src={image.url} alt={image.title || 'Gallery image'} />
          <div className="detail-panel">
            <h1>{image.title || 'Untitled'}</h1>
            {image.description ? <p>{image.description}</p> : null}
            <div className="detail-meta">
              <div>
                <div className="badge">Tag</div>
                <div>{image.tag || '—'}</div>
              </div>
              <div>
                <div className="badge">Location</div>
                <div>{image.location || '—'}</div>
              </div>
              <div>
                <div className="badge">Visibility</div>
                <div>{image.visibility || 'public'}</div>
              </div>
              <div>
                <div className="badge">Uploaded</div>
                <div>{new Date(image.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="detail-exif">
              <div className="badge">EXIF</div>
              {exifRows.length ? (
                <div className="exif-grid">
                  {exifRows.map(([label, value]) => (
                    <div key={label}>
                      <div className="badge">{label}</div>
                      <div>{value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No EXIF stored.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
