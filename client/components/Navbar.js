'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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
          <div className={styles.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="1.5" y="1.5" width="23" height="23" rx="6" stroke="#387ed1" strokeWidth="2"/>
              <path d="M8 13h10" stroke="#387ed1" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9.5" cy="9" r="2" stroke="#0ab39c" strokeWidth="1.5"/>
              <circle cx="16.5" cy="17" r="2" stroke="#0ab39c" strokeWidth="1.5"/>
              <path d="M11 10l4 6" stroke="#387ed1" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>
            Asset<span className={styles.logoAccent}>-Tokenization</span>
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
                    <hr className={styles.dropdownDivider}/>
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
              <Link href="/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
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
