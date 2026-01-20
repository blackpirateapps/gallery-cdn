import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import LoginForm from './LoginForm';

export default function LoginPage() {
  if (isAuthed()) {
    redirect('/admin');
  }
  return (
    <>
      <nav className="nav">
        <a className="logo" href="/">Gallery CDN</a>
      </nav>
      <main>
        <div className="container">
          <section className="hero">
            <div>
              <h1>Admin access.</h1>
              <p>Use the master password to manage the gallery.</p>
            </div>
          </section>
          <div style={{ marginTop: '24px', maxWidth: '420px' }}>
            <LoginForm />
          </div>
        </div>
      </main>
    </>
  );
}
