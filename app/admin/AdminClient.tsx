'use client';

import { useEffect, useMemo, useState } from 'react';
import * as exifr from 'exifr';

type ImageRecord = {
  id: number;
  key: string;
  url: string;
  title: string | null;
  description: string | null;
  tag: string | null;
  location: string | null;
  exif_json: string | null;
  created_at: number;
};

export default function AdminClient() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [status, setStatus] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [location, setLocation] = useState('');
  const [exifText, setExifText] = useState('');

  const hasFormData = useMemo(
    () => title || description || tag || location || exifText,
    [title, description, tag, location, exifText]
  );

  async function loadImages() {
    const response = await fetch('/api/images');
    const data = await response.json();
    setImages(data.images || []);
  }

  useEffect(() => {
    loadImages().catch(() => setStatus('Failed to load images.'));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const pushDebug = (line: string) => {
    setDebugLog((prev) => [...prev, line]);
  };

  const readBody = async (response: Response) => {
    try {
      return await response.text();
    } catch {
      return '';
    }
  };

  const stripExif = async (file: File) => {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not supported');
    }
    ctx.drawImage(imageBitmap, 0, 0);
    const targetType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Failed to encode image'));
        },
        targetType,
        0.92
      );
    });
    return new File([blob], file.name, { type: blob.type || targetType });
  };

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStatus('');
    setDebugLog([]);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const defaultTitle = file.name.replace(/\.[^/.]+$/, '');
    setTitle(defaultTitle);

    try {
      const exifData = (await exifr.parse(file, { gps: true })) as Record<string, unknown> | null;
      if (exifData) {
        const payload: Record<string, unknown> = {
          make: exifData.Make || exifData.make || null,
          model: exifData.Model || exifData.model || null,
          lensModel: exifData.LensModel || exifData.lensModel || null,
          fNumber: exifData.FNumber || exifData.fNumber || null,
          exposureTime: exifData.ExposureTime || exifData.exposureTime || null,
          iso: exifData.ISO || exifData.iso || null,
          focalLength: exifData.FocalLength || exifData.focalLength || null,
          takenAt:
            exifData.DateTimeOriginal ||
            exifData.CreateDate ||
            exifData.dateTimeOriginal ||
            exifData.createDate ||
            null,
          latitude: exifData.latitude ?? null,
          longitude: exifData.longitude ?? null
        };
        Object.keys(payload).forEach((key) => {
          if (payload[key] === null) delete payload[key];
        });
        setExifText(JSON.stringify(payload, null, 2));
        if (typeof exifData.latitude === 'number' && typeof exifData.longitude === 'number') {
          setLocation(`${exifData.latitude.toFixed(6)}, ${exifData.longitude.toFixed(6)}`);
        }
        pushDebug('EXIF parsed and autofilled.');
      } else {
        setExifText('');
        pushDebug('No EXIF detected.');
      }
    } catch (error) {
      pushDebug('Failed to read EXIF data.');
      setExifText('');
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setStatus('Uploading...');
    setDebugLog([]);
    pushDebug(`Selected file: ${selectedFile.name} (${selectedFile.type || 'unknown'})`);

    let uploadFile = selectedFile;
    try {
      uploadFile = await stripExif(selectedFile);
      pushDebug('EXIF stripped before upload.');
    } catch (error) {
      pushDebug('Failed to strip EXIF, uploading original file.');
    }

    const presignResponse = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadFile.name, contentType: uploadFile.type })
    });

    if (!presignResponse.ok) {
      const bodyText = await readBody(presignResponse);
      let data: { error?: string } = {};
      try {
        data = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        data = {};
      }
      setStatus(data.error || 'Failed to get upload URL.');
      pushDebug(`Presign failed: ${presignResponse.status}`);
      if (bodyText) pushDebug(`Presign body: ${bodyText}`);
      setUploading(false);
      return;
    }

    const presignData = await presignResponse.json();
    pushDebug('Received signed URL from server.');

    const uploadResponse = await fetch(presignData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': uploadFile.type || 'application/octet-stream' },
      body: uploadFile
    });

    if (!uploadResponse.ok) {
      const bodyText = await readBody(uploadResponse);
      setStatus('Upload to R2 failed.');
      pushDebug(`R2 upload failed: ${uploadResponse.status}`);
      if (bodyText) pushDebug(`R2 body: ${bodyText}`);
      setUploading(false);
      return;
    }

    pushDebug('Uploaded directly to R2.');

    let exifPayload: Record<string, unknown> | null = null;
    if (exifText) {
      try {
        exifPayload = JSON.parse(exifText);
      } catch {
        setStatus('EXIF JSON is invalid.');
        pushDebug('EXIF JSON parse failed.');
        setUploading(false);
        return;
      }
    }

    const recordResponse = await fetch('/api/images/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: presignData.key,
        url: presignData.publicUrl,
        title,
        description,
        tag,
        location,
        exif: exifPayload
      })
    });

    if (!recordResponse.ok) {
      const bodyText = await readBody(recordResponse);
      let data: { error?: string } = {};
      try {
        data = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        data = {};
      }
      setStatus(data.error || 'Failed to save metadata.');
      pushDebug(`DB record failed: ${recordResponse.status}`);
      if (bodyText) pushDebug(`DB body: ${bodyText}`);
      setUploading(false);
      return;
    }

    setStatus('Upload complete.');
    setSelectedFile(null);
    setPreviewUrl('');
    setTitle('');
    setDescription('');
    setTag('');
    setLocation('');
    setExifText('');
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
            <input className="input" type="file" name="file" accept="image/*" required onChange={handleFileChange} />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ width: '100%', borderRadius: '12px' }} />
            ) : null}
            <input
              className="input"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <textarea
              className="input"
              placeholder="Description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <input
              className="input"
              type="text"
              placeholder="Tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            />
            <input
              className="input"
              type="text"
              placeholder="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
            <textarea
              className="input"
              placeholder="EXIF data (JSON)"
              rows={6}
              value={exifText}
              onChange={(event) => setExifText(event.target.value)}
            />
            <button className="button" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload image'}
            </button>
          </form>
          {!selectedFile && !hasFormData ? (
            <div className="notice">Select an image to preview, auto-fill EXIF data, and add metadata.</div>
          ) : null}
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
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr key={image.id}>
                  <td>
                    <img src={image.url} alt="" style={{ width: '90px', borderRadius: '10px' }} />
                  </td>
                  <td>
                    <div>{image.title || 'Untitled'}</div>
                    <div className="badge">{image.tag || 'No tag'}</div>
                    <div>{image.location || new Date(image.created_at).toLocaleString()}</div>
                  </td>
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
