'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { adminAPI } from '@/lib/api';
import { ethers } from 'ethers';
import { AMM_ADDRESS, TOKEN_ADDRESS } from '@/lib/web3';
import styles from './page.module.css';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTx, setSelectedTx] = useState(null);
  
  // Blockchain State
  const [blockchainData, setBlockchainData] = useState({
    blockNumber: 0,
    totalSupply: '0',
    ammEth: '0',
    ammTokens: '0',
    status: 'connecting...'
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/auth/login');
      return;
    }
    if (user && isAdmin) fetchData();
  }, [user, authLoading, isAdmin]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, txRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getTransactions()
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setTransactions(txRes.transactions);
      
      // Fetch Blockchain Data
      fetchBlockchainData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchainData = async () => {
    try {
      setBlockchainData(prev => ({ ...prev, status: 'fetching...' }));
      
      const res = await adminAPI.getBlockchainStats();
      if (res.success && res.blockchain) {
        setBlockchainData({
          blockNumber: res.blockchain.blockNumber,
          totalSupply: res.blockchain.totalSupply,
          userTokensMinted: res.blockchain.userTokensMinted,
          ammEth: res.blockchain.ammEth,
          ammTokens: res.blockchain.ammTokens,
          status: res.blockchain.status
        });
      } else {
        throw new Error('Failed to fetch from proxy');
      }
    } catch (error) {
      console.error("Blockchain connection error:", error);
      setBlockchainData(prev => ({ ...prev, status: 'Connection Failed' }));
    }
  };

  if (authLoading || loading) {
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
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Manage platform assets, users, and transactions</p>
          </div>
          <Link href="/admin/add-asset" className="btn btn-gold btn-sm">
            + Add New Asset
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Assets</div>
            <div className="stat-value">{stats?.activeAssets || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{stats?.totalTransactions || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Volume</div>
            <div className="stat-value">₹{((stats?.totalVolume || 0) / 100000).toFixed(1)}L</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`} onClick={() => setActiveTab('overview')}>
            Recent Activity
          </button>
          <button className={`${styles.tab} ${activeTab === 'blockchain' ? styles.tabActive : ''}`} onClick={() => setActiveTab('blockchain')}>
            Blockchain Explorer
          </button>
          <button className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`} onClick={() => setActiveTab('users')}>
            Users ({users.length})
          </button>
          <button className={`${styles.tab} ${activeTab === 'transactions' ? styles.tabActive : ''}`} onClick={() => setActiveTab('transactions')}>
            All Transactions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h3 className={styles.sectionHeading}>Recent Transactions</h3>
            {stats?.recentTransactions?.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Asset</th>
                      <th>Tokens</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTransactions.map((tx, i) => (
                      <tr key={i}>
                        <td>{tx.user?.name || 'N/A'}</td>
                        <td>{tx.asset?.name || 'N/A'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{tx.tokensBought || tx.tokensSold}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>₹{tx.totalCost?.toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.82rem' }}>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No transactions yet</p>
            )}
          </div>
        )}

        {activeTab === 'blockchain' && (
          <div className={styles.blockchainPanel}>
            <div className={styles.blockchainHeader}>
              <h3 className={styles.sectionHeading}>Live Network Status</h3>
              <div className={styles.networkStatus}>
                <span className={blockchainData.status.includes('Connected') ? styles.statusDotGreen : styles.statusDotRed}></span>
                {blockchainData.status}
              </div>
            </div>

            <div className={styles.blockchainGrid}>
              <div className={styles.bcCard}>
                <div className={styles.bcLabel}>Current Block</div>
                <div className={styles.bcValueMono}>#{blockchainData.blockNumber}</div>
              </div>
              <div className={styles.bcCard}>
                <div className={styles.bcLabel}>Tokens Minted By Users (On-Chain)</div>
                <div className={styles.bcValueMono}>{Number(blockchainData.userTokensMinted || 0).toLocaleString()} MPT</div>
              </div>
              <div className={styles.bcCard}>
                <div className={styles.bcLabel}>AMM Liquidity (ETH)</div>
                <div className={styles.bcValueMono}>{Number(blockchainData.ammEth).toLocaleString()} ETH</div>
              </div>
              <div className={styles.bcCard}>
                <div className={styles.bcLabel}>AMM Liquidity (Tokens)</div>
                <div className={styles.bcValueMono}>{Number(blockchainData.ammTokens).toLocaleString()} MPT</div>
              </div>
            </div>

            <h3 className={styles.sectionHeading} style={{ marginTop: '2rem' }}>Smart Contracts</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contract Name</th>
                    <th>Network Address</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>PropertyToken</strong></td>
                    <td><code className={styles.hashText}>{TOKEN_ADDRESS}</code></td>
                    <td><span className="badge badge-cyan">ERC20</span></td>
                  </tr>
                  <tr>
                    <td><strong>BondingCurveAMM</strong></td>
                    <td><code className={styles.hashText}>{AMM_ADDRESS}</code></td>
                    <td><span className="badge badge-gold">DeFi Pool</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn-secondary btn-sm" onClick={fetchBlockchainData}>
                ↻ Refresh On-Chain Data
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Wallet ID</th>
                  <th>Balance</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-cyan'}`}>{u.role}</span></td>
                    <td><code style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{u.walletId?.substring(0, 16)}...</code></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>₹{u.walletBalance?.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Tokens</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>{tx.user?.name}</td>
                    <td>{tx.asset?.name}</td>
                    <td><span className={`badge ${tx.type === 'buy' ? 'badge-green' : 'badge-red'}`}>{tx.type?.toUpperCase()}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{tx.tokensBought || tx.tokensSold}</td>
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>User Details</span>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <div><strong>Name:</strong> {selectedTx.user?.name}</div>
                  <div><strong>Email:</strong> {selectedTx.user?.email}</div>
                  <div style={{ marginTop: '4px' }}><strong>Wallet ID:</strong> <code style={{ color: 'var(--accent-cyan)' }}>{selectedTx.user?.walletId}</code></div>
                </div>
              </div>
              
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
