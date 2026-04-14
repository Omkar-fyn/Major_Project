'use client';
import Link from 'next/link';
import styles from './AssetCard.module.css';

export default function AssetCard({ asset }) {
  const soldPercentage = ((asset.totalTokens - asset.availableTokens) / asset.totalTokens * 100).toFixed(0);
  const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <Link href={`/asset/${asset._id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {asset.image ? (
          <img src={`${SERVER_URL}${asset.image}`} alt={asset.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>🏢</span>
          </div>
        )}
        <div className={styles.categoryBadge}>
          🏢 Real Estate
        </div>
        {asset.annualYield > 0 && (
          <div className={styles.yieldBadge}>
            {asset.annualYield}% APY
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{asset.name}</h3>

        {asset.location && (
          <p className={styles.location}>📍 {asset.location}</p>
        )}

        <div className={styles.priceRow}>
          <div>
            <span className={styles.priceLabel}>Price/Token</span>
            <span className={styles.priceValue}>₹{asset.pricePerToken?.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className={styles.priceLabel}>Total Value</span>
            <span className={styles.priceValue}>₹{(asset.totalValue / 100000).toFixed(1)}L</span>
          </div>
        </div>

        <div className={styles.tokenInfo}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
          <div className={styles.tokenRow}>
            <span className={styles.tokenText}>{soldPercentage}% sold</span>
            <span className={styles.tokenText}>{asset.availableTokens?.toLocaleString()} left</span>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.statusBadge} data-status={asset.status}>
            {asset.status === 'active' ? '● Live' : asset.status === 'sold-out' ? '● Sold Out' : '● Delisted'}
          </span>
          <span className={styles.viewBtn}>View Details →</span>
        </div>
      </div>
    </Link>
  );
}
