'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="Asset Tokenization" className={styles.logoImg} />
          <span className={styles.logoText}>
            Asset<span className={styles.logoAccent}> Tokenization</span>
          </span>
        </Link>

        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Marketplace
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`${styles.navLink} ${pathname === '/dashboard' ? styles.navLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${styles.navLink} ${pathname.startsWith('/admin') ? styles.navLinkActive : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className={styles.navUser}>
                <div className={styles.walletBadge}>
                  <span className={styles.walletDot}></span>
                  <span className={styles.walletAmount}>₹{user.walletBalance?.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.userMenu}>
                  <button className={styles.avatarBtn}>
                    {user.name?.charAt(0).toUpperCase()}
                  </button>
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{user.name}</p>
                      <p className={styles.dropdownEmail}>{user.email}</p>
                    </div>
                    <hr className={styles.dropdownDivider} />
                    <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      📊 Dashboard
                    </Link>
                    <button className={styles.dropdownItem} onClick={() => { logout(); setMenuOpen(false); }}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/auth/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen1 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen2 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen3 : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}
