'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import * as exifr from 'exifr';
import { LogOut } from 'lucide-react';
import type { AlbumRecord, ImageRecord, ProfileImage } from './types';
import UploadPanel from './components/UploadPanel';
import ProfilePanel from './components/ProfilePanel';
import MetricsRow from './components/MetricsRow';
import GalleryTable from './components/GalleryTable';
import AlbumPanel from './components/AlbumPanel';
import EditImagePanel from './components/EditImagePanel';

export default function AdminClient() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [albums, setAlbums] = useState<AlbumRecord[]>([]);
  const [profileImage, setProfileImage] = useState<ProfileImage | null>(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');
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
  const [featured, setFeatured] = useState(false);
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
  const [editFeatured, setEditFeatured] = useState(false);
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
      Boolean(
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
          featured ||
          visibility !== 'public'
      ),
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
      featured,
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

  async function loadProfileImage() {
    const response = await fetch('/api/profile-image');
    const data = await response.json().catch(() => ({}));
    setProfileImage(data.profileImage || null);
  }

  useEffect(() => {
    loadImages().catch(() => setStatus('Failed to load images.'));
    loadAlbums().catch(() => setStatus('Failed to load albums.'));
    loadProfileImage().catch(() => setProfileStatus('Failed to load profile image.'));
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

  const buildProfileFile = async (file: File) => {
    const targetType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
    const blob = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: targetType,
      preserveExif: false
    });
    return ensureFile(blob, file.name, targetType);
  };

  async function handleProfileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileUploading(true);
    setProfileStatus('Uploading profile image...');

    let uploadFile = file;
    try {
      uploadFile = await buildProfileFile(file);
    } catch {
      // fall back to original file
    }

    const presignResponse = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadFile.name, contentType: uploadFile.type, variant: 'profile' })
    });

    if (!presignResponse.ok) {
      setProfileStatus('Failed to get upload URL.');
      setProfileUploading(false);
      return;
    }

    const presignData = await presignResponse.json();
    const uploadResponse = await fetch(presignData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': uploadFile.type || 'application/octet-stream' },
      body: uploadFile
    });

    if (!uploadResponse.ok) {
      setProfileStatus('Upload to R2 failed.');
      setProfileUploading(false);
      return;
    }

    const recordResponse = await fetch('/api/profile-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: presignData.key,
        url: presignData.publicUrl
      })
    });

    if (!recordResponse.ok) {
      setProfileStatus('Failed to save profile image.');
      setProfileUploading(false);
      return;
    }

    setProfileStatus('Profile image updated.');
    setProfileImage({ key: presignData.key, url: presignData.publicUrl });
    setProfileUploading(false);
    event.target.value = '';
  }

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
        featured,
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
    setFeatured(false);
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
    setEditFeatured(Boolean(image.featured));
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
    setEditFeatured(false);
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
        featured: editFeatured,
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
        <UploadPanel
          formRef={formRef}
          previewUrl={previewUrl}
          selectedFile={selectedFile}
          hasFormData={hasFormData}
          uploading={uploading}
          visibility={visibility}
          featured={featured}
          title={title}
          description={description}
          tag={tag}
          location={location}
          exifMake={exifMake}
          exifModel={exifModel}
          exifLens={exifLens}
          exifFNumber={exifFNumber}
          exifExposure={exifExposure}
          exifIso={exifIso}
          exifFocal={exifFocal}
          exifTakenAt={exifTakenAt}
          exifLat={exifLat}
          exifLng={exifLng}
          albumId={albumId}
          albums={albums}
          onFileChange={handleFileChange}
          onSubmit={handleUpload}
          onTitleChange={(event) => setTitle(event.target.value)}
          onDescriptionChange={(event) => setDescription(event.target.value)}
          onTagChange={(event) => setTag(event.target.value)}
          onLocationChange={(event) => setLocation(event.target.value)}
          onExifMakeChange={(event) => setExifMake(event.target.value)}
          onExifModelChange={(event) => setExifModel(event.target.value)}
          onExifLensChange={(event) => setExifLens(event.target.value)}
          onExifFNumberChange={(event) => setExifFNumber(event.target.value)}
          onExifExposureChange={(event) => setExifExposure(event.target.value)}
          onExifIsoChange={(event) => setExifIso(event.target.value)}
          onExifFocalChange={(event) => setExifFocal(event.target.value)}
          onExifTakenAtChange={(event) => setExifTakenAt(event.target.value)}
          onExifLatChange={(event) => setExifLat(event.target.value)}
          onExifLngChange={(event) => setExifLng(event.target.value)}
          onVisibilityChange={(event) => setVisibility(event.target.value as 'public' | 'unlisted' | 'private')}
          onFeaturedChange={(event) => setFeatured(event.target.checked)}
          onAlbumChange={(event) => setAlbumId(event.target.value ? Number(event.target.value) : '')}
        />
        <ProfilePanel
          profileImage={profileImage}
          profileUploading={profileUploading}
          profileStatus={profileStatus}
          onProfileUpload={handleProfileUpload}
        />
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

        <MetricsRow totalCount={totalCount} unlistedCount={unlistedCount} privateCount={privateCount} />

        <GalleryTable
          status={status}
          debugLog={debugLog}
          images={images}
          albums={albums}
          selectedIds={selectedIds}
          batchAlbumId={batchAlbumId}
          onBatchAlbumChange={(event) => setBatchAlbumId(event.target.value ? Number(event.target.value) : '')}
          onAssignBatch={assignBatch}
          onToggleSelect={toggleSelect}
          onStartEdit={startEdit}
          onCopyLink={handleCopyLink}
          onDelete={handleDelete}
        />

        <AlbumPanel
          albums={albums}
          showAlbumForm={showAlbumForm}
          editingAlbumId={editingAlbumId}
          albumTitle={albumTitle}
          albumDescription={albumDescription}
          albumTag={albumTag}
          albumPublicId={albumPublicId}
          albumVisibility={albumVisibility}
          onToggleForm={() => setShowAlbumForm((prev) => !prev)}
          onSubmit={handleAlbumSubmit}
          onTitleChange={(event) => setAlbumTitle(event.target.value)}
          onDescriptionChange={(event) => setAlbumDescription(event.target.value)}
          onTagChange={(event) => setAlbumTag(event.target.value)}
          onPublicIdChange={(event) => setAlbumPublicId(sanitizePublicId(event.target.value))}
          onVisibilityChange={(event) => setAlbumVisibility(event.target.value as 'public' | 'unlisted' | 'private')}
          onStartEdit={startAlbumEdit}
          onDelete={deleteAlbum}
        />

        {editingId ? (
          <EditImagePanel
            editTitle={editTitle}
            editDescription={editDescription}
            editTag={editTag}
            editLocation={editLocation}
            editFeatured={editFeatured}
            editExifMake={editExifMake}
            editExifModel={editExifModel}
            editExifLens={editExifLens}
            editExifFNumber={editExifFNumber}
            editExifExposure={editExifExposure}
            editExifIso={editExifIso}
            editExifFocal={editExifFocal}
            editExifTakenAt={editExifTakenAt}
            editExifLat={editExifLat}
            editExifLng={editExifLng}
            editVisibility={editVisibility}
            onTitleChange={(event) => setEditTitle(event.target.value)}
            onDescriptionChange={(event) => setEditDescription(event.target.value)}
            onTagChange={(event) => setEditTag(event.target.value)}
            onLocationChange={(event) => setEditLocation(event.target.value)}
            onFeaturedChange={(event) => setEditFeatured(event.target.checked)}
            onExifMakeChange={(event) => setEditExifMake(event.target.value)}
            onExifModelChange={(event) => setEditExifModel(event.target.value)}
            onExifLensChange={(event) => setEditExifLens(event.target.value)}
            onExifFNumberChange={(event) => setEditExifFNumber(event.target.value)}
            onExifExposureChange={(event) => setEditExifExposure(event.target.value)}
            onExifIsoChange={(event) => setEditExifIso(event.target.value)}
            onExifFocalChange={(event) => setEditExifFocal(event.target.value)}
            onExifTakenAtChange={(event) => setEditExifTakenAt(event.target.value)}
            onExifLatChange={(event) => setEditExifLat(event.target.value)}
            onExifLngChange={(event) => setEditExifLng(event.target.value)}
            onVisibilityChange={(event) => setEditVisibility(event.target.value as 'public' | 'unlisted' | 'private')}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        ) : null}
      </section>
    </div>
  );
}
