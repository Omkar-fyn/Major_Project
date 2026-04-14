'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { assetAPI, transactionAPI } from '@/lib/api';
import styles from './page.module.css';

export default function AssetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [asset, setAsset] = useState(null);
  const [ownership, setOwnership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenCount, setTokenCount] = useState(1);
  const [buying, setBuying] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const data = await assetAPI.getOne(id);
      setAsset(data.asset);
      setOwnership(data.ownership);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = asset ? tokenCount * asset.pricePerToken : 0;

  const handleBuy = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setErrorMsg('');
    setBuying(true);
    try {
      const data = await transactionAPI.buy(id, parseInt(tokenCount));
      setSuccessMsg(data.transaction);
      await refreshUser();
      fetchAsset();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className={styles.loadingState}>
            <div className="skeleton" style={{height: '300px', borderRadius: '12px'}}></div>
            <div className="skeleton" style={{height: '24px', width: '60%', marginTop: '24px'}}></div>
            <div className="skeleton" style={{height: '16px', width: '40%', marginTop: '12px'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{textAlign: 'center', padding: '4rem'}}>
          <h2>Property not found</h2>
          <Link href="/" className="btn btn-primary" style={{marginTop: '1rem'}}>Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const soldPercentage = ((asset.totalTokens - asset.availableTokens) / asset.totalTokens * 100).toFixed(1);

  return (
    <div className="page-wrapper">
      {/* Success Modal */}
      {successMsg && (
        <div className="modal-overlay" onClick={() => setSuccessMsg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSuccessMsg(null)}>✕</button>
            <div className={styles.successModal}>
              <div className={styles.successIcon}>✓</div>
              <h2>Transaction Successful!</h2>
              <p className={styles.successSub}>Your tokens have been added to your portfolio</p>
              <div className={styles.successDetails}>
                <div className={styles.successRow}>
                  <span>Property</span>
                  <strong>{successMsg.assetName}</strong>
                </div>
                <div className={styles.successRow}>
                  <span>Tokens Bought</span>
                  <strong>{successMsg.tokensBought}</strong>
                </div>
                <div className={styles.successRow}>
                  <span>Total Cost</span>
                  <strong>₹{successMsg.totalCost?.toLocaleString('en-IN')}</strong>
                </div>
                <div className={styles.successRow}>
                  <span>Tx Hash</span>
                  <code className={styles.txHash}>{successMsg.txHash?.substring(0, 20)}...</code>
                </div>
                <div className={styles.successRow}>
                  <span>New Balance</span>
                  <strong className={styles.balanceGreen}>₹{successMsg.newBalance?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <div className={styles.successActions}>
                <Link href="/dashboard" className="btn btn-primary">View Portfolio</Link>
                <button className="btn btn-secondary" onClick={() => setSuccessMsg(null)}>Continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <Link href="/" className={styles.backLink}>← Back to Marketplace</Link>

        <div className={styles.layout}>
          {/* Left: Asset Info */}
          <div className={styles.assetInfo}>
            <div className={styles.imageSection}>
              {asset.image ? (
                <img src={`${SERVER_URL}${asset.image}`} alt={asset.name} className={styles.assetImage}/>
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span style={{fontSize: '4rem'}}>🏢</span>
                </div>
              )}
            </div>

            <div className={styles.infoHeader}>
              <span className="badge badge-cyan">🏢 Real Estate</span>
              {asset.annualYield > 0 && (
                <span className="badge badge-green">{asset.annualYield}% APY</span>
              )}
              <span className={`badge ${asset.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                {asset.status === 'active' ? '● Live' : '● Sold Out'}
              </span>
            </div>

            <h1 className={styles.assetName}>{asset.name}</h1>
            {asset.location && <p className={styles.assetLocation}>📍 {asset.location}</p>}

            <p className={styles.assetDesc}>{asset.description}</p>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className="stat-card">
                <div className="stat-label">Total Value</div>
                <div className="stat-value">₹{(asset.totalValue / 100000).toFixed(1)}L</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Price / Token</div>
                <div className="stat-value">₹{asset.pricePerToken?.toLocaleString('en-IN')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Tokens</div>
                <div className="stat-value">{asset.totalTokens?.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Available</div>
                <div className="stat-value">{asset.availableTokens?.toLocaleString()}</div>
              </div>
            </div>

            {/* Ownership Distribution */}
            {ownership && (
              <div className={styles.ownershipSection}>
                <h3 className={styles.subHeading}>Ownership Distribution</h3>
                <div className={styles.ownershipBarWrap}>
                  <div className="ownership-bar">
                    <div className="ownership-bar-fill" style={{width: `${soldPercentage}%`}}></div>
                  </div>
                  <div className={styles.ownershipStats}>
                    <span>{soldPercentage}% Sold</span>
                    <span>{ownership.totalOwners} Holders</span>
                  </div>
                </div>

                {ownership.topHolders?.length > 0 && (
                  <div className={styles.holdersTable}>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Holder</th>
                            <th>Wallet</th>
                            <th>Tokens</th>
                            <th>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ownership.topHolders.map((h, i) => (
                            <tr key={i}>
                              <td>{h.name}</td>
                              <td><code style={{fontSize: '0.72rem', color: 'var(--accent-primary)'}}>{h.walletId?.substring(0, 12)}...</code></td>
                              <td>{h.tokensOwned?.toLocaleString()}</td>
                              <td>{h.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Buy Panel */}
          <div className={styles.buyPanel}>
            <div className={styles.buyCard}>
              <h3 className={styles.buyTitle}>Buy Tokens</h3>
              <p className={styles.buySubtitle}>Invest in fractional ownership</p>

              {user && (
                <div className={styles.balanceInfo}>
                  <span>Your Balance</span>
                  <strong>₹{user.walletBalance?.toLocaleString('en-IN')}</strong>
                </div>
              )}

              <div className={styles.tokenInput}>
                <label className="form-label">Number of Tokens</label>
                <div className={styles.inputRow}>
                  <button
                    className={styles.inputBtn}
                    onClick={() => setTokenCount(Math.max(1, tokenCount - 1))}
                    disabled={tokenCount <= 1}
                  >−</button>
                  <input
                    type="number"
                    className="form-input"
                    style={{textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem'}}
                    value={tokenCount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 1;
                      setTokenCount(Math.min(Math.max(1, v), asset.availableTokens));
                    }}
                    min={1}
                    max={asset.availableTokens}
                  />
                  <button
                    className={styles.inputBtn}
                    onClick={() => setTokenCount(Math.min(asset.availableTokens, tokenCount + 1))}
                    disabled={tokenCount >= asset.availableTokens}
                  >+</button>
                </div>
                <div className={styles.quickBtns}>
                  {[1, 5, 10, 50, 100].map(n => (
                    <button
                      key={n}
                      className={styles.quickBtn}
                      onClick={() => setTokenCount(Math.min(n, asset.availableTokens))}
                    >{n}</button>
                  ))}
                </div>
              </div>

              <div className={styles.costBreakdown}>
                <div className={styles.costRow}>
                  <span>Price per Token</span>
                  <span>₹{asset.pricePerToken?.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.costRow}>
                  <span>Quantity</span>
                  <span>×{tokenCount}</span>
                </div>
                <div className={styles.costDivider}></div>
                <div className={`${styles.costRow} ${styles.costTotal}`}>
                  <span>Total Cost</span>
                  <span>₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {errorMsg && (
                <div className={styles.errorBox}>⚠️ {errorMsg}</div>
              )}

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleBuy}
                disabled={buying || asset.status !== 'active' || (user && user.walletBalance < totalCost)}
              >
                {buying ? (
                  <span style={{display: 'inline-block', width: 20, height: 20, border: '2px solid transparent', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite'}}></span>
                ) : !user ? (
                  'Login to Buy'
                ) : asset.status !== 'active' ? (
                  'Sold Out'
                ) : user.walletBalance < totalCost ? (
                  'Insufficient Balance'
                ) : (
                  `Buy ${tokenCount} Token${tokenCount > 1 ? 's' : ''}`
                )}
              </button>

              <p className={styles.disclaimer}>
                🔗 Transaction will be recorded on-chain once blockchain integration is live
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
