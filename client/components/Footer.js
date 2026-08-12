import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Top Section */}
        <div className={styles.footerTop}>
          {/* Brand Column */}
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <img src="/logo.png" alt="Asset Tokenization" className={styles.logoImg} />
              <span className={styles.logoText}>
                Asset<span className={styles.logoAccent}> Tokenization</span>
              </span>
            </Link>
            <p className={styles.brandDesc}>
              Invest in tokenized real estate with fractional ownership. 
              Start building your portfolio with as little as ₹500 per token.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform Column */}
          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>Platform</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/" className={styles.footerLink}>Marketplace</Link></li>
              <li><Link href="/dashboard" className={styles.footerLink}>Dashboard</Link></li>
              <li><Link href="/auth/login" className={styles.footerLink}>Login</Link></li>
              <li><Link href="/auth/signup" className={styles.footerLink}>Sign Up</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>Resources</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#" className={styles.footerLink}>How It Works</a></li>
              <li><a href="#" className={styles.footerLink}>FAQs</a></li>
              <li><a href="#" className={styles.footerLink}>Documentation</a></li>
              <li><a href="#" className={styles.footerLink}>API Reference</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className={styles.footerCol}>
            <h4 className={styles.footerColTitle}>Legal</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#" className={styles.footerLink}>Privacy Policy</a></li>
              <li><a href="#" className={styles.footerLink}>Terms of Service</a></li>
              <li><a href="#" className={styles.footerLink}>Disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.footerDivider} />

        {/* Bottom Section */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {currentYear} Asset Tokenization. All rights reserved.
          </p>
          <p className={styles.disclaimer}>
            This is a testnet platform for educational purposes. Transactions occur on the Sepolia test network using test funds.
          </p>
        </div>
      </div>
    </footer>
  );
}
