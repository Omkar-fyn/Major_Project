'use client';
import { useState, useEffect } from 'react';
import { assetAPI } from '@/lib/api';
import AssetCard from '@/components/AssetCard';
import styles from './page.module.css';

export default function Home() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      const data = await assetAPI.getAll(params.toString());
      setAssets(data.assets);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}></span>
              Live Properties
            </div>
            <h1 className={styles.heroTitle}>
              Invest in <span className="gradient-text">Tokenized Real Estate</span>
              <br />with Fractional Ownership
            </h1>
            <p className={styles.heroSub}>
              Own a piece of premium properties across India. 
              Start investing in real estate with as little as ₹500 per token.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>₹6Cr+</span>
                <span className={styles.heroStatLabel}>Property Value</span>
              </div>
              <div className={styles.heroStatDivider}></div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>6+</span>
                <span className={styles.heroStatLabel}>Properties</span>
              </div>
              <div className={styles.heroStatDivider}></div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>9.2%</span>
                <span className={styles.heroStatLabel}>Avg. Yield</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className={styles.marketplace}>
        <div className="container">
          <div className={styles.marketplaceHeader}>
            <div>
              <h2 className={styles.sectionTitle}>🏢 Live Properties</h2>
              <p className={styles.sectionSub}>Browse and invest in tokenized real estate</p>
            </div>
            <form onSubmit={handleSearch} className={styles.searchBar}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </form>
          </div>

          {/* Asset Grid */}
          {loading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={`skeleton ${styles.skeletonImg}`}></div>
                  <div className={styles.skeletonContent}>
                    <div className="skeleton" style={{height: '20px', width: '80%'}}></div>
                    <div className="skeleton" style={{height: '14px', width: '50%', marginTop: '8px'}}></div>
                    <div className="skeleton" style={{height: '30px', width: '100%', marginTop: '16px'}}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🏗️</span>
              <h3>No properties found</h3>
              <p>Try adjusting your search query</p>
            </div>
          ) : (
            <div className={`${styles.grid} stagger-children`}>
              {assets.map(asset => (
                <AssetCard key={asset._id} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className={styles.sectionSub} style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto var(--space-2xl)' }}>
            Start investing in real estate in three simple steps
          </p>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>👤</div>
              <div className={styles.stepNumber}>01</div>
              <h3 className={styles.stepTitle}>Create Account</h3>
              <p className={styles.stepDesc}>Sign up and get a simulated wallet with ₹1,00,000 to start investing</p>
            </div>
            <div className={styles.stepConnector}>
              <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="4 4"/></svg>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>🏢</div>
              <div className={styles.stepNumber}>02</div>
              <h3 className={styles.stepTitle}>Choose Property</h3>
              <p className={styles.stepDesc}>Browse premium real estate properties across India on the live marketplace</p>
            </div>
            <div className={styles.stepConnector}>
              <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="4 4"/></svg>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>🔗</div>
              <div className={styles.stepNumber}>03</div>
              <h3 className={styles.stepTitle}>Buy Tokens</h3>
              <p className={styles.stepDesc}>Purchase fractional tokens and track your portfolio on the dashboard</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
