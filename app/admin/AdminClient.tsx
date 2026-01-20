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
  const [debugLog, setDebugLog] = useState<string[]>([]);
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
    setDebugLog([]);

    const pushDebug = (line: string) => {
      setDebugLog((prev) => [...prev, line]);
    };

    pushDebug(`Selected file: ${file.name} (${file.type || 'unknown'})`);

    const presignResponse = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type })
    });

    if (!presignResponse.ok) {
      const data = await presignResponse.json().catch(() => ({}));
      setStatus(data.error || 'Failed to get upload URL.');
      pushDebug(`Presign failed: ${presignResponse.status}`);
      setUploading(false);
      return;
    }

    const presignData = await presignResponse.json();
    pushDebug('Received signed URL from server.');

    const uploadResponse = await fetch(presignData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });

    if (!uploadResponse.ok) {
      setStatus('Upload to R2 failed.');
      pushDebug(`R2 upload failed: ${uploadResponse.status}`);
      setUploading(false);
      return;
    }

    pushDebug('Uploaded directly to R2.');

    const recordResponse = await fetch('/api/images/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: presignData.key, url: presignData.publicUrl })
    });

    if (!recordResponse.ok) {
      const data = await recordResponse.json().catch(() => ({}));
      setStatus(data.error || 'Failed to save metadata.');
      pushDebug(`DB record failed: ${recordResponse.status}`);
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
        <div className="notice">R2 must allow PUT from your domain (CORS) for direct uploads.</div>
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
          {debugLog.length ? (
            <div className="notice">
              <strong>Debug</strong>
              <div>{debugLog.join(' | ')}</div>
            </div>
          ) : null}
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
