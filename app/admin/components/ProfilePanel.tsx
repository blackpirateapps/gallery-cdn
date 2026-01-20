'use client';

import type { ChangeEvent } from 'react';
import type { ProfileImage } from '../types';

type ProfilePanelProps = {
  profileImage: ProfileImage | null;
  profileUploading: boolean;
  profileStatus: string;
  onProfileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function ProfilePanel({
  profileImage,
  profileUploading,
  profileStatus,
  onProfileUpload
}: ProfilePanelProps) {
  return (
    <div className="panel profile-panel">
      <div className="upload-header">
        <div>
          <h2 style={{ marginTop: 0 }}>Photographer image</h2>
          <p className="muted">Upload a profile photo for the homepage.</p>
        </div>
        <div className="badge">PROFILE</div>
      </div>
      <div className="profile-preview">
        {profileImage?.url ? (
          <img src={profileImage.url} alt="Photographer profile" />
        ) : (
          <div className="upload-placeholder">
            <div className="badge">Profile</div>
            <p>No profile image yet.</p>
          </div>
        )}
        <input
          className="input"
          type="file"
          name="profile"
          accept="image/*"
          onChange={onProfileUpload}
          disabled={profileUploading}
        />
      </div>
      {profileStatus ? <div className="notice">{profileStatus}</div> : null}
    </div>
  );
}
