'use client';

import type { ChangeEvent, FormEvent, RefObject } from 'react';
import type { AlbumRecord } from '../types';

type UploadPanelProps = {
  formRef: RefObject<HTMLFormElement>;
  previewUrl: string;
  selectedFile: File | null;
  hasFormData: boolean;
  uploading: boolean;
  visibility: 'public' | 'unlisted' | 'private';
  featured: boolean;
  title: string;
  description: string;
  tag: string;
  location: string;
  exifMake: string;
  exifModel: string;
  exifLens: string;
  exifFNumber: string;
  exifExposure: string;
  exifIso: string;
  exifFocal: string;
  exifTakenAt: string;
  exifLat: string;
  exifLng: string;
  albumId: number | '';
  albums: AlbumRecord[];
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onTagChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifMakeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifModelChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifLensChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifFNumberChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifExposureChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifIsoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifFocalChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifTakenAtChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifLatChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExifLngChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onVisibilityChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onFeaturedChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAlbumChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export default function UploadPanel({
  formRef,
  previewUrl,
  selectedFile,
  hasFormData,
  uploading,
  visibility,
  featured,
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
  albumId,
  albums,
  onFileChange,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onTagChange,
  onLocationChange,
  onExifMakeChange,
  onExifModelChange,
  onExifLensChange,
  onExifFNumberChange,
  onExifExposureChange,
  onExifIsoChange,
  onExifFocalChange,
  onExifTakenAtChange,
  onExifLatChange,
  onExifLngChange,
  onVisibilityChange,
  onFeaturedChange,
  onAlbumChange
}: UploadPanelProps) {
  return (
    <div className="panel upload-panel">
      <div className="upload-header">
        <div>
          <h2 style={{ marginTop: 0 }}>Upload new image</h2>
          <p className="muted">Drag in a shot, add metadata, then publish or keep it private.</p>
        </div>
        <div className="badge">{visibility.toUpperCase()}</div>
      </div>
      <form ref={formRef} className="upload-grid" onSubmit={onSubmit}>
        <div className="upload-preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" />
          ) : (
            <div className="upload-placeholder">
              <div className="badge">Preview</div>
              <p>Drop a photo to see the preview here.</p>
            </div>
          )}
          <input className="input" type="file" name="file" accept="image/*" required onChange={onFileChange} />
        </div>
        <div className="upload-fields">
          <input className="input" type="text" placeholder="Title" value={title} onChange={onTitleChange} required />
          <textarea
            className="input"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={onDescriptionChange}
          />
          <div className="upload-inline">
            <input className="input" type="text" placeholder="Tag" value={tag} onChange={onTagChange} />
            <input className="input" type="text" placeholder="Location" value={location} onChange={onLocationChange} />
          </div>
          <div className="upload-exif">
            <input className="input" type="text" placeholder="Camera make" value={exifMake} onChange={onExifMakeChange} />
            <input
              className="input"
              type="text"
              placeholder="Camera model"
              value={exifModel}
              onChange={onExifModelChange}
            />
            <input className="input" type="text" placeholder="Lens" value={exifLens} onChange={onExifLensChange} />
            <input
              className="input"
              type="text"
              placeholder="F-number"
              value={exifFNumber}
              onChange={onExifFNumberChange}
            />
            <input
              className="input"
              type="text"
              placeholder="Exposure"
              value={exifExposure}
              onChange={onExifExposureChange}
            />
            <input className="input" type="text" placeholder="ISO" value={exifIso} onChange={onExifIsoChange} />
            <input
              className="input"
              type="text"
              placeholder="Focal length"
              value={exifFocal}
              onChange={onExifFocalChange}
            />
            <input
              className="input"
              type="text"
              placeholder="Taken at"
              value={exifTakenAt}
              onChange={onExifTakenAtChange}
            />
            <input className="input" type="text" placeholder="Latitude" value={exifLat} onChange={onExifLatChange} />
            <input className="input" type="text" placeholder="Longitude" value={exifLng} onChange={onExifLngChange} />
          </div>
          <div className="upload-inline">
            <select className="input" value={visibility} onChange={onVisibilityChange}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            <label className="check">
              <input type="checkbox" checked={featured} onChange={onFeaturedChange} />
              Featured
            </label>
          </div>
          <button className="button primary" type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload image'}
          </button>
          <select className="input" value={albumId} onChange={onAlbumChange}>
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
  );
}
