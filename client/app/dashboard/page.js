'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { transactionAPI } from '@/lib/api';
import InvestmentChart from '@/components/charts/InvestmentChart';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
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
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }}></div>
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

        {/* Investment Distribution Chart */}
        {!loading && (
          <div className={styles.chartSection}>
            <InvestmentChart holdings={portfolio?.holdings || []} />
          </div>
        )}

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
              <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12, borderRadius: 10 }}></div>
            ))}
          </div>
        ) : activeTab === 'portfolio' ? (
          <div className={styles.portfolioSection}>
            {portfolio?.holdings?.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <h3>No assets yet</h3>
                <p>Start investing in the marketplace to build your portfolio</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Assets</Link>
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
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{h.tokensOwned}</td>
                        <td>
                          <div className={styles.miniBar}>
                            <div className={styles.miniBarFill} style={{ width: `${h.percentageOwned}%` }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{h.percentageOwned}%</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>₹{h.totalInvested?.toLocaleString('en-IN')}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>₹{h.currentValue?.toLocaleString('en-IN')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Link href={`/asset/${h.asset?._id}`} className={styles.viewLink}>View</Link>
                            <Link href={`/asset/${h.asset?._id}?action=sell`} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Exit</Link>
                          </div>
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
                        <td style={{ fontSize: '0.82rem' }}>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td><strong>{tx.asset?.name}</strong></td>
                        <td><span className={`badge ${tx.type === 'buy' ? 'badge-green' : 'badge-red'}`}>{tx.type?.toUpperCase()}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{tx.tokensBought || tx.tokensSold}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>₹{tx.pricePerToken?.toLocaleString('en-IN')}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{tx.totalCost?.toLocaleString('en-IN')}</td>
                        <td><span className={`badge ${tx.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{tx.status}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setSelectedTx(tx)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', maxWidth: '600px', width: '100%', border: '1px solid var(--border-color)', position: 'relative' }}>
            <button onClick={() => setSelectedTx(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Transaction Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Transaction ID</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedTx._id}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date & Time</span>
                <div style={{ color: 'var(--text-primary)' }}>{new Date(selectedTx.createdAt).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Type</span>
                <span className={`badge ${selectedTx.type === 'buy' ? 'badge-green' : 'badge-red'}`} style={{ marginTop: '5px' }}>{selectedTx.type?.toUpperCase()}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Tokens</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedTx.tokensBought || selectedTx.tokensSold}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Total Value</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹{selectedTx.totalCost?.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Asset Details</span>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <div><strong>Property Name:</strong> {selectedTx.asset?.name}</div>
                  <div><strong>Price Per Token:</strong> ₹{selectedTx.pricePerToken?.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Blockchain Record</span>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {selectedTx.blockchainTxHash ? (
                    <div>
                      <strong>Tx Hash: </strong> 
                      <code style={{ color: 'var(--accent-gold)', wordBreak: 'break-all' }}>{selectedTx.blockchainTxHash}</code>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Off-chain transaction (No hash available)</span>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
