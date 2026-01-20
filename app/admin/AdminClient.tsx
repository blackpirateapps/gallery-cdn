'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import * as exifr from 'exifr';

type ImageRecord = {
  id: number;
  key: string;
  url: string;
  public_id: string;
  thumb_url: string | null;
  title: string | null;
  description: string | null;
  tag: string | null;
  location: string | null;
  exif_json: string | null;
  visibility: string | null;
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
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const formRef = useRef<HTMLFormElement | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editExifText, setEditExifText] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  const totalCount = images.length;
  const privateCount = images.filter((image) => image.visibility === 'private').length;
  const unlistedCount = images.filter((image) => image.visibility === 'unlisted').length;

  const hasFormData = useMemo(
    () => title || description || tag || location || exifText || visibility !== 'public',
    [title, description, tag, location, exifText, visibility]
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

  const ensureFile = (blob: Blob, name: string, type: string) => {
    return new File([blob], name, { type: blob.type || type });
  };

  const buildUploadFiles = async (file: File) => {
    const targetType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
    const fullBlob = await imageCompression(file, {
      maxSizeMB: 50,
      maxWidthOrHeight: 6000,
      useWebWorker: true,
      fileType: targetType,
      preserveExif: false
    });

    const thumbBlob = await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 520,
      useWebWorker: true,
      fileType: targetType,
      preserveExif: false
    });

    return {
      full: ensureFile(fullBlob, file.name, targetType),
      thumb: ensureFile(thumbBlob, `thumb-${file.name}`, targetType)
    };
  };

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStatus('');
    setDebugLog([]);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
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
    setStatus('Compressing...');
    setDebugLog([]);
    pushDebug(`Selected file: ${selectedFile.name} (${selectedFile.type || 'unknown'})`);

    let uploadFile = selectedFile;
    let thumbFile: File | null = null;
    try {
      const files = await buildUploadFiles(selectedFile);
      uploadFile = files.full;
      thumbFile = files.thumb;
      pushDebug('EXIF stripped and thumbnail generated.');
    } catch (error) {
      pushDebug('Failed to process images, uploading original file.');
    }

    setStatus('Uploading...');
    await new Promise((resolve) => setTimeout(resolve, 150));

    const presignResponse = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadFile.name, contentType: uploadFile.type, variant: 'full' })
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

    pushDebug('Uploaded original to R2.');

    let thumbKey: string | null = null;
    let thumbUrl: string | null = null;
    if (thumbFile) {
      const thumbPresignResponse = await fetch('/api/r2-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: thumbFile.name, contentType: thumbFile.type, variant: 'thumb' })
      });

      if (!thumbPresignResponse.ok) {
        const bodyText = await readBody(thumbPresignResponse);
        setStatus('Failed to get thumbnail upload URL.');
        pushDebug(`Thumb presign failed: ${thumbPresignResponse.status}`);
        if (bodyText) pushDebug(`Thumb presign body: ${bodyText}`);
        setUploading(false);
        return;
      }

      const thumbPresignData = await thumbPresignResponse.json();
      const thumbUploadResponse = await fetch(thumbPresignData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': thumbFile.type || 'application/octet-stream' },
        body: thumbFile
      });

      if (!thumbUploadResponse.ok) {
        const bodyText = await readBody(thumbUploadResponse);
        setStatus('Thumbnail upload failed.');
        pushDebug(`Thumb upload failed: ${thumbUploadResponse.status}`);
        if (bodyText) pushDebug(`Thumb upload body: ${bodyText}`);
        setUploading(false);
        return;
      }

      thumbKey = thumbPresignData.key;
      thumbUrl = thumbPresignData.publicUrl;
      pushDebug('Uploaded thumbnail to R2.');
    }

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
        thumbKey,
        thumbUrl,
        title,
        description,
        tag,
        location,
        exif: exifPayload,
        visibility
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
    setVisibility('public');
    formRef.current?.reset();
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

  function startEdit(image: ImageRecord) {
    setEditingId(image.id);
    setEditTitle(image.title || '');
    setEditDescription(image.description || '');
    setEditTag(image.tag || '');
    setEditLocation(image.location || '');
    setEditExifText(image.exif_json || '');
    setEditVisibility(
      image.visibility === 'private' || image.visibility === 'unlisted' ? image.visibility : 'public'
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditTag('');
    setEditLocation('');
    setEditExifText('');
    setEditVisibility('public');
  }

  async function saveEdit() {
    if (!editingId) return;
    let exifPayload: Record<string, unknown> | null = null;
    if (editExifText) {
      try {
        exifPayload = JSON.parse(editExifText);
      } catch {
        setStatus('Edit EXIF JSON is invalid.');
        return;
      }
    }

    const response = await fetch(`/api/images/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        tag: editTag,
        location: editLocation,
        exif: exifPayload,
        visibility: editVisibility
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus(data.error || 'Update failed.');
      return;
    }

    setStatus('Image updated.');
    cancelEdit();
    await loadImages();
  }

  async function handleCopyLink(publicId: string) {
    const url = `${window.location.origin}/images/${publicId}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus('Share link copied.');
    } catch {
      setStatus('Unable to copy link.');
    }
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
        <div className="panel admin-hero">
          <div>
            <h2 style={{ marginTop: 0 }}>Studio console</h2>
            <p className="muted">
              Curate your portfolio, manage visibility, and share private links with clients.
            </p>
          </div>
          <div className="admin-metrics">
            <div>
              <div className="badge">Total</div>
              <div>{totalCount}</div>
            </div>
            <div>
              <div className="badge">Unlisted</div>
              <div>{unlistedCount}</div>
            </div>
            <div>
              <div className="badge">Private</div>
              <div>{privateCount}</div>
            </div>
          </div>
        </div>
        <div className="panel upload-panel">
          <div className="upload-header">
            <div>
              <h2 style={{ marginTop: 0 }}>Upload new image</h2>
              <p className="muted">Drag in a shot, add metadata, then publish or keep it private.</p>
            </div>
            <div className="badge">{visibility.toUpperCase()}</div>
          </div>
          <form ref={formRef} className="upload-grid" onSubmit={handleUpload}>
            <div className="upload-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" />
              ) : (
                <div className="upload-placeholder">
                  <div className="badge">Preview</div>
                  <p>Drop a photo to see the preview here.</p>
                </div>
              )}
              <input className="input" type="file" name="file" accept="image/*" required onChange={handleFileChange} />
            </div>
            <div className="upload-fields">
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
              <div className="upload-inline">
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
              </div>
              <textarea
                className="input"
                placeholder="EXIF data (JSON)"
                rows={6}
                value={exifText}
                onChange={(event) => setExifText(event.target.value)}
              />
              <div className="upload-inline">
                <select
                  className="input"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as 'public' | 'unlisted' | 'private')}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
                <button className="button primary" type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload image'}
                </button>
              </div>
            </div>
          </form>
          {!selectedFile && !hasFormData ? (
            <div className="notice">Select an image to preview, auto-fill EXIF data, and set visibility.</div>
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
                    <img src={image.thumb_url || image.url} alt="" style={{ width: '90px', borderRadius: '10px' }} />
                  </td>
                  <td>
                    <div>{image.title || 'Untitled'}</div>
                    <div className="badge">{image.tag || 'No tag'}</div>
                    <div>{image.location || new Date(image.created_at).toLocaleString()}</div>
                    <div className="badge">{image.visibility || 'public'}</div>
                  </td>
                  <td>
                    <div className="stack" style={{ gap: '8px' }}>
                      <button className="button" type="button" onClick={() => startEdit(image)}>
                        Edit
                      </button>
                      <button className="button" type="button" onClick={() => handleCopyLink(image.public_id)}>
                        Copy link
                      </button>
                      <button className="button" type="button" onClick={() => handleDelete(image.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {images.length === 0 ? <div className="notice">No uploads yet.</div> : null}
        </div>

        {editingId ? (
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Edit image</h2>
            <div className="stack">
              <input
                className="input"
                type="text"
                placeholder="Title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />
              <textarea
                className="input"
                placeholder="Description"
                rows={3}
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
              <input
                className="input"
                type="text"
                placeholder="Tag"
                value={editTag}
                onChange={(event) => setEditTag(event.target.value)}
              />
              <input
                className="input"
                type="text"
                placeholder="Location"
                value={editLocation}
                onChange={(event) => setEditLocation(event.target.value)}
              />
              <textarea
                className="input"
                placeholder="EXIF data (JSON)"
                rows={6}
                value={editExifText}
                onChange={(event) => setEditExifText(event.target.value)}
              />
              <select
                className="input"
                value={editVisibility}
                onChange={(event) => setEditVisibility(event.target.value as 'public' | 'unlisted' | 'private')}
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
              <div className="stack" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="button" type="button" onClick={saveEdit}>
                  Save changes
                </button>
                <button className="button" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
