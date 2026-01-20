'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import * as exifr from 'exifr';
import {
  Clipboard,
  Filter,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Upload,
  GalleryHorizontalEnd,
  Lock
} from 'lucide-react';

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
  exif_make: string | null;
  exif_model: string | null;
  exif_lens: string | null;
  exif_fnumber: string | null;
  exif_exposure: string | null;
  exif_iso: string | null;
  exif_focal: string | null;
  exif_taken_at: string | null;
  exif_lat: string | null;
  exif_lng: string | null;
  visibility: string | null;
  created_at: number;
};

type AlbumRecord = {
  id: number;
  public_id: string;
  title: string;
  description: string | null;
  tag: string | null;
  visibility: string | null;
  created_at: number;
};

export default function AdminClient() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [albums, setAlbums] = useState<AlbumRecord[]>([]);
  const [status, setStatus] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [location, setLocation] = useState('');
  const [exifMake, setExifMake] = useState('');
  const [exifModel, setExifModel] = useState('');
  const [exifLens, setExifLens] = useState('');
  const [exifFNumber, setExifFNumber] = useState('');
  const [exifExposure, setExifExposure] = useState('');
  const [exifIso, setExifIso] = useState('');
  const [exifFocal, setExifFocal] = useState('');
  const [exifTakenAt, setExifTakenAt] = useState('');
  const [exifLat, setExifLat] = useState('');
  const [exifLng, setExifLng] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [albumId, setAlbumId] = useState<number | ''>('');
  const formRef = useRef<HTMLFormElement | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editExifMake, setEditExifMake] = useState('');
  const [editExifModel, setEditExifModel] = useState('');
  const [editExifLens, setEditExifLens] = useState('');
  const [editExifFNumber, setEditExifFNumber] = useState('');
  const [editExifExposure, setEditExifExposure] = useState('');
  const [editExifIso, setEditExifIso] = useState('');
  const [editExifFocal, setEditExifFocal] = useState('');
  const [editExifTakenAt, setEditExifTakenAt] = useState('');
  const [editExifLat, setEditExifLat] = useState('');
  const [editExifLng, setEditExifLng] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumTag, setAlbumTag] = useState('');
  const [albumPublicId, setAlbumPublicId] = useState('');
  const [albumVisibility, setAlbumVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchAlbumId, setBatchAlbumId] = useState<number | ''>('');
  const [showAlbumForm, setShowAlbumForm] = useState(false);

  const totalCount = images.length;
  const privateCount = images.filter((image) => image.visibility === 'private').length;
  const unlistedCount = images.filter((image) => image.visibility === 'unlisted').length;

  const hasFormData = useMemo(
    () =>
      title ||
      description ||
      tag ||
      location ||
      exifMake ||
      exifModel ||
      exifLens ||
      exifFNumber ||
      exifExposure ||
      exifIso ||
      exifFocal ||
      exifTakenAt ||
      exifLat ||
      exifLng ||
      visibility !== 'public',
    [
      title,
      description,
      tag,
      location,
      exifMake,
      exifModel,
      exifLens,
      exifFNumber,
      exifExposure,
      exifIso,
      exifFocal,
      exifTakenAt,
      exifLat,
      exifLng,
      visibility
    ]
  );

  async function loadImages() {
    const response = await fetch('/api/images');
    const data = await response.json();
    setImages(data.images || []);
  }

  async function loadAlbums() {
    const response = await fetch('/api/albums');
    const data = await response.json();
    setAlbums(data.albums || []);
  }

  useEffect(() => {
    loadImages().catch(() => setStatus('Failed to load images.'));
    loadAlbums().catch(() => setStatus('Failed to load albums.'));
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
        const latitude = typeof exifData.latitude === 'number' ? exifData.latitude : null;
        const longitude = typeof exifData.longitude === 'number' ? exifData.longitude : null;
        setExifMake(String(exifData.Make || exifData.make || ''));
        setExifModel(String(exifData.Model || exifData.model || ''));
        setExifLens(String(exifData.LensModel || exifData.lensModel || ''));
        setExifFNumber(String(exifData.FNumber || exifData.fNumber || ''));
        setExifExposure(String(exifData.ExposureTime || exifData.exposureTime || ''));
        setExifIso(String(exifData.ISO || exifData.iso || ''));
        setExifFocal(String(exifData.FocalLength || exifData.focalLength || ''));
        setExifTakenAt(
          String(
            exifData.DateTimeOriginal ||
              exifData.CreateDate ||
              exifData.dateTimeOriginal ||
              exifData.createDate ||
              ''
          )
        );
        setExifLat(latitude !== null ? latitude.toFixed(6) : '');
        setExifLng(longitude !== null ? longitude.toFixed(6) : '');
        if (latitude !== null && longitude !== null) {
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        pushDebug('EXIF parsed and autofilled.');
      } else {
        setExifMake('');
        setExifModel('');
        setExifLens('');
        setExifFNumber('');
        setExifExposure('');
        setExifIso('');
        setExifFocal('');
        setExifTakenAt('');
        setExifLat('');
        setExifLng('');
        pushDebug('No EXIF detected.');
      }
    } catch (error) {
      pushDebug('Failed to read EXIF data.');
      setExifMake('');
      setExifModel('');
      setExifLens('');
      setExifFNumber('');
      setExifExposure('');
      setExifIso('');
      setExifFocal('');
      setExifTakenAt('');
      setExifLat('');
      setExifLng('');
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
        exifMake,
        exifModel,
        exifLens,
        exifFNumber,
        exifExposure,
        exifIso,
        exifFocal,
        exifTakenAt,
        exifLat,
        exifLng,
        visibility,
        albumId: albumId === '' ? null : albumId
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
    setExifMake('');
    setExifModel('');
    setExifLens('');
    setExifFNumber('');
    setExifExposure('');
    setExifIso('');
    setExifFocal('');
    setExifTakenAt('');
    setExifLat('');
    setExifLng('');
    setVisibility('public');
    setAlbumId('');
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

  async function handleAlbumSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!albumTitle.trim()) return;

    if (editingAlbumId) {
      const response = await fetch(`/api/albums/${editingAlbumId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: albumTitle,
          description: albumDescription,
          tag: albumTag,
          publicId: albumPublicId || null,
          visibility: albumVisibility
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus(data.error || 'Failed to update album.');
        return;
      }
      setStatus('Album updated.');
    } else {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: albumTitle,
          description: albumDescription,
          tag: albumTag,
          publicId: albumPublicId || null,
          visibility: albumVisibility
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus(data.error || 'Failed to create album.');
        return;
      }
      setStatus('Album created.');
    }

    setAlbumTitle('');
    setAlbumDescription('');
    setAlbumTag('');
    setAlbumPublicId('');
    setAlbumVisibility('public');
    setEditingAlbumId(null);
    await loadAlbums();
  }

  function startAlbumEdit(album: AlbumRecord) {
    setEditingAlbumId(album.id);
    setAlbumTitle(album.title);
    setAlbumDescription(album.description || '');
    setAlbumTag(album.tag || '');
    setAlbumPublicId(album.public_id || '');
    setAlbumVisibility(
      album.visibility === 'private' || album.visibility === 'unlisted' ? album.visibility : 'public'
    );
  }

  async function deleteAlbum(id: number) {
    const response = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setStatus('Failed to delete album.');
      return;
    }
    setStatus('Album deleted.');
    await loadAlbums();
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function assignBatch() {
    if (batchAlbumId === '' || selectedIds.length === 0) return;
    const response = await fetch('/api/albums/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumId: batchAlbumId, imageIds: selectedIds })
    });
    if (!response.ok) {
      setStatus('Batch assign failed.');
      return;
    }
    setStatus('Images added to album.');
    setSelectedIds([]);
  }

  function sanitizePublicId(value: string) {
    return value.trim().replace(/\s+/g, '-');
  }

  function startEdit(image: ImageRecord) {
    setEditingId(image.id);
    setEditTitle(image.title || '');
    setEditDescription(image.description || '');
    setEditTag(image.tag || '');
    setEditLocation(image.location || '');
    setEditExifMake(image.exif_make || '');
    setEditExifModel(image.exif_model || '');
    setEditExifLens(image.exif_lens || '');
    setEditExifFNumber(image.exif_fnumber || '');
    setEditExifExposure(image.exif_exposure || '');
    setEditExifIso(image.exif_iso || '');
    setEditExifFocal(image.exif_focal || '');
    setEditExifTakenAt(image.exif_taken_at || '');
    setEditExifLat(image.exif_lat || '');
    setEditExifLng(image.exif_lng || '');
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
    setEditExifMake('');
    setEditExifModel('');
    setEditExifLens('');
    setEditExifFNumber('');
    setEditExifExposure('');
    setEditExifIso('');
    setEditExifFocal('');
    setEditExifTakenAt('');
    setEditExifLat('');
    setEditExifLng('');
    setEditVisibility('public');
  }

  async function saveEdit() {
    if (!editingId) return;
    const response = await fetch(`/api/images/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        tag: editTag,
        location: editLocation,
        exifMake: editExifMake,
        exifModel: editExifModel,
        exifLens: editExifLens,
        exifFNumber: editExifFNumber,
        exifExposure: editExifExposure,
        exifIso: editExifIso,
        exifFocal: editExifFocal,
        exifTakenAt: editExifTakenAt,
        exifLat: editExifLat,
        exifLng: editExifLng,
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
              <div className="upload-exif">
                <input
                  className="input"
                  type="text"
                  placeholder="Camera make"
                  value={exifMake}
                  onChange={(event) => setExifMake(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Camera model"
                  value={exifModel}
                  onChange={(event) => setExifModel(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Lens"
                  value={exifLens}
                  onChange={(event) => setExifLens(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="F-number"
                  value={exifFNumber}
                  onChange={(event) => setExifFNumber(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Exposure"
                  value={exifExposure}
                  onChange={(event) => setExifExposure(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="ISO"
                  value={exifIso}
                  onChange={(event) => setExifIso(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Focal length"
                  value={exifFocal}
                  onChange={(event) => setExifFocal(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Taken at"
                  value={exifTakenAt}
                  onChange={(event) => setExifTakenAt(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Latitude"
                  value={exifLat}
                  onChange={(event) => setExifLat(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Longitude"
                  value={exifLng}
                  onChange={(event) => setExifLng(event.target.value)}
                />
              </div>
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
              <select
                className="input"
                value={albumId}
                onChange={(event) => setAlbumId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">No album</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </select>
            </div>
          </form>
          {!selectedFile && !hasFormData ? (
            <div className="notice">Select an image to preview, auto-fill EXIF data, and set visibility.</div>
          ) : null}
        </div>
        <div className="notice">Keep uploads lightweight for faster delivery on the public gallery.</div>
        <div className="notice">R2 must allow PUT from your domain (CORS) for direct uploads.</div>
      </aside>

      <section className="stack">
        <div className="panel admin-header">
          <div>
            <h2 style={{ marginTop: 0 }}>Studio console</h2>
            <p className="muted">
              Curate your portfolio, manage visibility, and share private links with clients.
            </p>
          </div>
          <div className="admin-session">
            <span className="badge">Admin session</span>
            <button className="button ghost" type="button" onClick={handleLogout}>
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>

        <div className="admin-metrics-row">
          <div className="metric-card">
            <GalleryHorizontalEnd aria-hidden="true" />
            <div>
              <div className="badge">Total</div>
              <div>{totalCount}</div>
            </div>
          </div>
          <div className="metric-card">
            <Upload aria-hidden="true" />
            <div>
              <div className="badge">Unlisted</div>
              <div>{unlistedCount}</div>
            </div>
          </div>
          <div className="metric-card">
            <Lock aria-hidden="true" />
            <div>
              <div className="badge">Private</div>
              <div>{privateCount}</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="table-header">
            <h2 style={{ marginTop: 0 }}>Gallery items</h2>
            <div className="table-tools">
              <select
                className="input"
                value={batchAlbumId}
                onChange={(event) => setBatchAlbumId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">Add selected to album</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </select>
              <button className="button ghost" type="button" onClick={assignBatch} disabled={!selectedIds.length}>
                Add
              </button>
              <button className="button ghost" type="button">
                <Filter aria-hidden="true" />
                Filter
              </button>
              <button className="button ghost" type="button">
                Sort
              </button>
            </div>
          </div>
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
                <th />
                <th>Preview</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr key={image.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(image.id)}
                      onChange={() => toggleSelect(image.id)}
                    />
                  </td>
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
                    <div className="action-row">
                      <button className="icon-button" type="button" onClick={() => startEdit(image)}>
                        <Pencil aria-hidden="true" />
                      </button>
                      <button className="icon-button" type="button" onClick={() => handleCopyLink(image.public_id)}>
                        <Clipboard aria-hidden="true" />
                      </button>
                      <button className="icon-button danger" type="button" onClick={() => handleDelete(image.id)}>
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {images.length === 0 ? <div className="notice">No uploads yet.</div> : null}
        </div>

        <div className="panel">
          <div className="album-header">
            <h2 style={{ marginTop: 0 }}>Albums</h2>
            <button className="button ghost" type="button" onClick={() => setShowAlbumForm((prev) => !prev)}>
              <Plus aria-hidden="true" />
              {showAlbumForm ? 'Close' : 'Create an album'}
            </button>
          </div>
          {showAlbumForm ? (
            <form className="stack" onSubmit={handleAlbumSubmit}>
              <input
                className="input"
                type="text"
                placeholder="Album title"
                value={albumTitle}
                onChange={(event) => setAlbumTitle(event.target.value)}
                required
              />
              <input
                className="input"
                type="text"
                placeholder="Album URL id (optional)"
                value={albumPublicId}
                onChange={(event) => setAlbumPublicId(sanitizePublicId(event.target.value))}
              />
              <textarea
                className="input"
                placeholder="Album description"
                rows={3}
                value={albumDescription}
                onChange={(event) => setAlbumDescription(event.target.value)}
              />
              <div className="upload-inline">
                <input
                  className="input"
                  type="text"
                  placeholder="Tag"
                  value={albumTag}
                  onChange={(event) => setAlbumTag(event.target.value)}
                />
                <select
                  className="input"
                  value={albumVisibility}
                  onChange={(event) => setAlbumVisibility(event.target.value as 'public' | 'unlisted' | 'private')}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <button className="button primary" type="submit">
                {editingAlbumId ? 'Save album' : 'Create album'}
              </button>
            </form>
          ) : null}
          <div className="album-list">
            {albums.map((album) => (
              <div key={album.id} className="album-row">
                <div>
                  <div className="badge">{album.visibility || 'public'}</div>
                  <div>{album.title}</div>
                  <div className="muted">{album.description || 'No description'}</div>
                </div>
                <div className="action-row">
                  <button className="icon-button" type="button" onClick={() => startAlbumEdit(album)}>
                    <Pencil aria-hidden="true" />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => deleteAlbum(album.id)}>
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
            {albums.length === 0 ? <div className="notice">No albums created yet.</div> : null}
          </div>
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
              <div className="upload-exif">
                <input
                  className="input"
                  type="text"
                  placeholder="Camera make"
                  value={editExifMake}
                  onChange={(event) => setEditExifMake(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Camera model"
                  value={editExifModel}
                  onChange={(event) => setEditExifModel(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Lens"
                  value={editExifLens}
                  onChange={(event) => setEditExifLens(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="F-number"
                  value={editExifFNumber}
                  onChange={(event) => setEditExifFNumber(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Exposure"
                  value={editExifExposure}
                  onChange={(event) => setEditExifExposure(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="ISO"
                  value={editExifIso}
                  onChange={(event) => setEditExifIso(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Focal length"
                  value={editExifFocal}
                  onChange={(event) => setEditExifFocal(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Taken at"
                  value={editExifTakenAt}
                  onChange={(event) => setEditExifTakenAt(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Latitude"
                  value={editExifLat}
                  onChange={(event) => setEditExifLat(event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Longitude"
                  value={editExifLng}
                  onChange={(event) => setEditExifLng(event.target.value)}
                />
              </div>
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
