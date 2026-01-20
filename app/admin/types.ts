export type ImageRecord = {
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
  featured: number | null;
  visibility: string | null;
  created_at: number;
};

export type AlbumRecord = {
  id: number;
  public_id: string;
  title: string;
  description: string | null;
  tag: string | null;
  visibility: string | null;
  created_at: number;
};

export type ProfileImage = {
  key: string;
  url: string;
};
