'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import styles from './page.module.css';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/login');
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
                        <td style={{fontFamily: 'var(--font-mono)'}}>{tx.tokensBought}</td>
                        <td style={{fontFamily: 'var(--font-mono)', color: 'var(--accent-green)'}}>₹{tx.totalCost?.toLocaleString('en-IN')}</td>
                        <td style={{fontSize: '0.82rem'}}>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem'}}>No transactions yet</p>
            )}
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
                    <td><code style={{fontSize: '0.72rem', color: 'var(--accent-cyan)'}}>{u.walletId?.substring(0, 16)}...</code></td>
                    <td style={{fontFamily: 'var(--font-mono)'}}>₹{u.walletBalance?.toLocaleString('en-IN')}</td>
                    <td style={{fontSize: '0.82rem'}}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
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
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td style={{fontSize: '0.82rem'}}>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>{tx.user?.name}</td>
                    <td>{tx.asset?.name}</td>
                    <td><span className={`badge ${tx.type === 'buy' ? 'badge-green' : 'badge-red'}`}>{tx.type?.toUpperCase()}</span></td>
                    <td style={{fontFamily: 'var(--font-mono)'}}>{tx.tokensBought}</td>
                    <td style={{fontFamily: 'var(--font-mono)', fontWeight: 600}}>₹{tx.totalCost?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${tx.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
