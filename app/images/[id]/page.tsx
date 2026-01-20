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
          <a className="logo" href="/">Gallery CDN</a>
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

  let exif: Record<string, unknown> | null = null;
  if (image.exif_json) {
    try {
      exif = JSON.parse(image.exif_json) as Record<string, unknown>;
    } catch {
      exif = null;
    }
  }

  return (
    <>
      <nav className="nav">
        <a className="logo" href="/">Gallery CDN</a>
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
              {exif ? <pre>{JSON.stringify(exif, null, 2)}</pre> : <div>No EXIF stored.</div>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
