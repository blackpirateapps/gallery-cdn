'use client';

import { useEffect, useState } from 'react';

type ImageRecord = {
  id: number;
  key: string;
  url: string;
  created_at: number;
};

export default function AdminClient() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  async function loadImages() {
    const response = await fetch('/api/images');
    const data = await response.json();
    setImages(data.images || []);
  }

  useEffect(() => {
    loadImages().catch(() => setStatus('Failed to load images.'));
  }, []);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/images', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus(data.error || 'Upload failed.');
      setUploading(false);
      return;
    }

    setStatus('Upload complete.');
    form.reset();
    await loadImages();
    setUploading(false);
  }

  async function handleDelete(id: number) {
    const response = await fetch(`/api/images/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus(data.error || 'Delete failed.');
      return;
    }
    setStatus('Image removed.');
    await loadImages();
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar stack">
        <div>
          <div className="badge">Session</div>
          <p style={{ margin: '8px 0 0' }}>Logged in as admin.</p>
        </div>
        <button className="button" onClick={handleLogout}>
          Sign out
        </button>
        <div className="notice">Keep uploads lightweight for faster delivery on the public gallery.</div>
      </aside>

      <section className="stack">
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Upload new image</h2>
          <form className="stack" onSubmit={handleUpload}>
            <input className="input" type="file" name="file" accept="image/*" required />
            <button className="button" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload image'}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Gallery items</h2>
          {status ? <div className="notice">{status}</div> : null}
          <table className="table" style={{ marginTop: '12px' }}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr key={image.id}>
                  <td>
                    <img src={image.url} alt="" style={{ width: '90px', borderRadius: '10px' }} />
                  </td>
                  <td>{new Date(image.created_at).toLocaleString()}</td>
                  <td>
                    <button className="button" type="button" onClick={() => handleDelete(image.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {images.length === 0 ? <div className="notice">No uploads yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
