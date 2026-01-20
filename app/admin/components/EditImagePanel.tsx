'use client';

import type { ChangeEvent } from 'react';

type EditImagePanelProps = {
  editTitle: string;
  editDescription: string;
  editTag: string;
  editLocation: string;
  editFeatured: boolean;
  editExifMake: string;
  editExifModel: string;
  editExifLens: string;
  editExifFNumber: string;
  editExifExposure: string;
  editExifIso: string;
  editExifFocal: string;
  editExifTakenAt: string;
  editExifLat: string;
  editExifLng: string;
  editVisibility: 'public' | 'unlisted' | 'private';
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onTagChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFeaturedChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
  onSave: () => void;
  onCancel: () => void;
};

export default function EditImagePanel({
  editTitle,
  editDescription,
  editTag,
  editLocation,
  editFeatured,
  editExifMake,
  editExifModel,
  editExifLens,
  editExifFNumber,
  editExifExposure,
  editExifIso,
  editExifFocal,
  editExifTakenAt,
  editExifLat,
  editExifLng,
  editVisibility,
  onTitleChange,
  onDescriptionChange,
  onTagChange,
  onLocationChange,
  onFeaturedChange,
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
  onSave,
  onCancel
}: EditImagePanelProps) {
  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Edit image</h2>
      <div className="stack">
        <input className="input" type="text" placeholder="Title" value={editTitle} onChange={onTitleChange} />
        <textarea
          className="input"
          placeholder="Description"
          rows={3}
          value={editDescription}
          onChange={onDescriptionChange}
        />
        <input className="input" type="text" placeholder="Tag" value={editTag} onChange={onTagChange} />
        <input className="input" type="text" placeholder="Location" value={editLocation} onChange={onLocationChange} />
        <label className="check">
          <input type="checkbox" checked={editFeatured} onChange={onFeaturedChange} />
          Featured
        </label>
        <div className="upload-exif">
          <input className="input" type="text" placeholder="Camera make" value={editExifMake} onChange={onExifMakeChange} />
          <input
            className="input"
            type="text"
            placeholder="Camera model"
            value={editExifModel}
            onChange={onExifModelChange}
          />
          <input className="input" type="text" placeholder="Lens" value={editExifLens} onChange={onExifLensChange} />
          <input
            className="input"
            type="text"
            placeholder="F-number"
            value={editExifFNumber}
            onChange={onExifFNumberChange}
          />
          <input
            className="input"
            type="text"
            placeholder="Exposure"
            value={editExifExposure}
            onChange={onExifExposureChange}
          />
          <input className="input" type="text" placeholder="ISO" value={editExifIso} onChange={onExifIsoChange} />
          <input
            className="input"
            type="text"
            placeholder="Focal length"
            value={editExifFocal}
            onChange={onExifFocalChange}
          />
          <input
            className="input"
            type="text"
            placeholder="Taken at"
            value={editExifTakenAt}
            onChange={onExifTakenAtChange}
          />
          <input className="input" type="text" placeholder="Latitude" value={editExifLat} onChange={onExifLatChange} />
          <input className="input" type="text" placeholder="Longitude" value={editExifLng} onChange={onExifLngChange} />
        </div>
        <select className="input" value={editVisibility} onChange={onVisibilityChange}>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
        <div className="stack" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button className="button" type="button" onClick={onSave}>
            Save changes
          </button>
          <button className="button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
