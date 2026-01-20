'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { AlbumRecord } from '../types';

type AlbumPanelProps = {
  albums: AlbumRecord[];
  showAlbumForm: boolean;
  editingAlbumId: number | null;
  albumTitle: string;
  albumDescription: string;
  albumTag: string;
  albumPublicId: string;
  albumVisibility: 'public' | 'unlisted' | 'private';
  onToggleForm: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onTagChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPublicIdChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onVisibilityChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onStartEdit: (album: AlbumRecord) => void;
  onDelete: (id: number) => void;
};

export default function AlbumPanel({
  albums,
  showAlbumForm,
  editingAlbumId,
  albumTitle,
  albumDescription,
  albumTag,
  albumPublicId,
  albumVisibility,
  onToggleForm,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onTagChange,
  onPublicIdChange,
  onVisibilityChange,
  onStartEdit,
  onDelete
}: AlbumPanelProps) {
  return (
    <div className="panel">
      <div className="album-header">
        <h2 style={{ marginTop: 0 }}>Albums</h2>
        <button className="button ghost" type="button" onClick={onToggleForm}>
          <Plus aria-hidden="true" />
          {showAlbumForm ? 'Close' : 'Create an album'}
        </button>
      </div>
      {showAlbumForm ? (
        <form className="stack" onSubmit={onSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Album title"
            value={albumTitle}
            onChange={onTitleChange}
            required
          />
          <input
            className="input"
            type="text"
            placeholder="Album URL id (optional)"
            value={albumPublicId}
            onChange={onPublicIdChange}
          />
          <textarea
            className="input"
            placeholder="Album description"
            rows={3}
            value={albumDescription}
            onChange={onDescriptionChange}
          />
          <div className="upload-inline">
            <input className="input" type="text" placeholder="Tag" value={albumTag} onChange={onTagChange} />
            <select className="input" value={albumVisibility} onChange={onVisibilityChange}>
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
              <button className="icon-button" type="button" onClick={() => onStartEdit(album)}>
                <Pencil aria-hidden="true" />
              </button>
              <button className="icon-button danger" type="button" onClick={() => onDelete(album.id)}>
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        {albums.length === 0 ? <div className="notice">No albums created yet.</div> : null}
      </div>
    </div>
  );
}
