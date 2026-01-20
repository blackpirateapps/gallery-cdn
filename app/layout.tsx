import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: "Sudip's Gallery",
  description: "Professional photography portfolio powered by Turso and Cloudflare R2."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
