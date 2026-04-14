'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Welcome Back</h1>
            <p className={styles.authSub}>Log in to access your portfolio</p>
          </div>

          {error && (
            <div className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className={styles.authFooter}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className={styles.authLink}>Sign up</Link>
          </p>

          <div className={styles.demoCredentials}>
            <p className={styles.demoTitle}>Demo Credentials</p>
            <div className={styles.demoRow}>
              <span>User:</span>
              <code>john@example.com / password123</code>
            </div>
            <div className={styles.demoRow}>
              <span>Admin:</span>
              <code>admin@tokenize.com / admin123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
