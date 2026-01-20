import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  if (!isAuthed()) {
    redirect('/login');
  }

  return (
    <>
      <nav className="nav">
        <a className="logo" href="/">Sudip's Gallery</a>
        <span className="badge">Admin</span>
      </nav>
      <main>
        <div className="container">
          <AdminClient />
        </div>
      </main>
    </>
  );
}
