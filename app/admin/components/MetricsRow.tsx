'use client';

import { GalleryHorizontalEnd, Lock, Upload } from 'lucide-react';

type MetricsRowProps = {
  totalCount: number;
  unlistedCount: number;
  privateCount: number;
};

export default function MetricsRow({ totalCount, unlistedCount, privateCount }: MetricsRowProps) {
  return (
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
  );
}
