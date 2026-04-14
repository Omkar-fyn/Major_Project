'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { transactionAPI } from '@/lib/api';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [portfolioRes, txRes] = await Promise.all([
        transactionAPI.getPortfolio(),
        transactionAPI.getMy()
      ]);
      setPortfolio(portfolioRes.portfolio);
      setTransactions(txRes.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="skeleton" style={{height: 200, borderRadius: 16}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Welcome back, {user.name}</p>
          </div>
          <Link href="/" className="btn btn-primary btn-sm">
            Browse Marketplace
          </Link>
        </div>

        {/* Wallet Card */}
        <div className={styles.walletCard}>
          <div className={styles.walletLeft}>
            <span className={styles.walletLabel}>Wallet ID</span>
            <code className={styles.walletId}>{user.walletId}</code>
          </div>
          <div className={styles.walletRight}>
            <span className={styles.walletLabel}>Balance</span>
            <span className={styles.walletBalance}>₹{user.walletBalance?.toLocaleString('en-IN')}</span>
          </div>
          <div className={styles.walletGlow}></div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className="stat-card">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value">₹{(portfolio?.totalInvested || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Value</div>
            <div className="stat-value">₹{(portfolio?.currentValue || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Tokens</div>
            <div className="stat-value">{portfolio?.totalTokens || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Assets Owned</div>
            <div className="stat-value">{portfolio?.assetCount || 0}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'portfolio' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'transactions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transaction History
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{height: 60, marginBottom: 12, borderRadius: 10}}></div>
            ))}
          </div>
        ) : activeTab === 'portfolio' ? (
          <div className={styles.portfolioSection}>
            {portfolio?.holdings?.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <h3>No assets yet</h3>
                <p>Start investing in the marketplace to build your portfolio</p>
                <Link href="/" className="btn btn-primary" style={{marginTop: '1rem'}}>Browse Assets</Link>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Category</th>
                      <th>Tokens</th>
                      <th>Ownership</th>
                      <th>Invested</th>
                      <th>Current Value</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio?.holdings?.map((h, i) => (
                      <tr key={i}>
                        <td>
                          <div className={styles.assetCell}>
                            <strong>{h.asset?.name}</strong>
                          </div>
                        </td>
                        <td><span className="badge badge-cyan">{h.asset?.category}</span></td>
                        <td style={{fontFamily: 'var(--font-mono)', fontWeight: 600}}>{h.tokensOwned}</td>
                        <td>
                          <div className={styles.miniBar}>
                            <div className={styles.miniBarFill} style={{width: `${h.percentageOwned}%`}}></div>
                          </div>
                          <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{h.percentageOwned}%</span>
                        </td>
                        <td style={{fontFamily: 'var(--font-mono)'}}>₹{h.totalInvested?.toLocaleString('en-IN')}</td>
                        <td style={{fontFamily: 'var(--font-mono)', color: 'var(--accent-green)'}}>₹{h.currentValue?.toLocaleString('en-IN')}</td>
                        <td>
                          <Link href={`/asset/${h.asset?._id}`} className={styles.viewLink}>View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.txSection}>
            {transactions.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📋</span>
                <h3>No transactions yet</h3>
                <p>Your purchase history will appear here</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Asset</th>
                      <th>Type</th>
                      <th>Tokens</th>
                      <th>Price/Token</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr key={i}>
                        <td style={{fontSize: '0.82rem'}}>{new Date(tx.createdAt).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
                        <td><strong>{tx.asset?.name}</strong></td>
                        <td><span className={`badge ${tx.type === 'buy' ? 'badge-green' : 'badge-red'}`}>{tx.type?.toUpperCase()}</span></td>
                        <td style={{fontFamily: 'var(--font-mono)'}}>{tx.tokensBought}</td>
                        <td style={{fontFamily: 'var(--font-mono)'}}>₹{tx.pricePerToken?.toLocaleString('en-IN')}</td>
                        <td style={{fontFamily: 'var(--font-mono)', fontWeight: 600}}>₹{tx.totalCost?.toLocaleString('en-IN')}</td>
                        <td><span className={`badge ${tx.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{tx.status}</span></td>
                        <td><code style={{fontSize: '0.7rem', color: 'var(--accent-cyan)'}}>{tx.blockchainTxHash?.substring(0, 14)}...</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
