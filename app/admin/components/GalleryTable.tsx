'use client';

import type { ChangeEvent } from 'react';
import { Clipboard, Filter, Pencil, Trash2 } from 'lucide-react';
import type { AlbumRecord, ImageRecord } from '../types';

type GalleryTableProps = {
  status: string;
  debugLog: string[];
  images: ImageRecord[];
  albums: AlbumRecord[];
  selectedIds: number[];
  batchAlbumId: number | '';
  onBatchAlbumChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onAssignBatch: () => void;
  onToggleSelect: (id: number) => void;
  onStartEdit: (image: ImageRecord) => void;
  onCopyLink: (publicId: string) => void;
  onDelete: (id: number) => void;
};

export default function GalleryTable({
  status,
  debugLog,
  images,
  albums,
  selectedIds,
  batchAlbumId,
  onBatchAlbumChange,
  onAssignBatch,
  onToggleSelect,
  onStartEdit,
  onCopyLink,
  onDelete
}: GalleryTableProps) {
  return (
    <div className="panel">
      <div className="table-header">
        <h2 style={{ marginTop: 0 }}>Gallery items</h2>
        <div className="table-tools">
          <select className="input" value={batchAlbumId} onChange={onBatchAlbumChange}>
            <option value="">Add selected to album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
          <button className="button ghost" type="button" onClick={onAssignBatch} disabled={!selectedIds.length}>
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
                <input type="checkbox" checked={selectedIds.includes(image.id)} onChange={() => onToggleSelect(image.id)} />
              </td>
              <td>
                <img src={image.thumb_url || image.url} alt="" style={{ width: '90px', borderRadius: '10px' }} />
              </td>
              <td>
                <div>{image.title || 'Untitled'}</div>
                <div className="badge">{image.tag || 'No tag'}</div>
                <div>{image.location || new Date(image.created_at).toLocaleString()}</div>
                <div className="badge">{image.visibility || 'public'}</div>
                {image.featured ? <div className="badge">Featured</div> : null}
              </td>
              <td>
                <div className="action-row">
                  <button className="icon-button" type="button" onClick={() => onStartEdit(image)}>
                    <Pencil aria-hidden="true" />
                  </button>
                  <button className="icon-button" type="button" onClick={() => onCopyLink(image.public_id)}>
                    <Clipboard aria-hidden="true" />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(image.id)}>
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
  );
}
