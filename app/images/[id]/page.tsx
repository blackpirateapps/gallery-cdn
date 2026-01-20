import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getImageById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ImageDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    notFound();
  }
  const image = await getImageById(id);
  if (!image) {
    notFound();
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
