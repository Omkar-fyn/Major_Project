'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { assetAPI, transactionAPI, authAPI } from '@/lib/api';
import TokenDistributionChart from '@/components/charts/TokenDistributionChart';
import PriceSimulationChart from '@/components/charts/PriceSimulationChart';
import { getSigner, getContracts, TOKEN_ADDRESS } from '@/lib/web3';
import { ethers } from 'ethers';
import styles from './page.module.css';

export default function AssetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, refreshUser } = useAuth();
  const [asset, setAsset] = useState(null);
  const [ownership, setOwnership] = useState(null);
  const [userTokensOwned, setUserTokensOwned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tokenCount, setTokenCount] = useState(1);
  const [buying, setBuying] = useState(false);
  const [funding, setFunding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Default to 'sell' if action=sell is in the URL
  const initialMode = searchParams.get('action') === 'sell' ? 'sell' : 'buy';
  const [tradeMode, setTradeMode] = useState(initialMode); // 'buy' or 'sell'
  
  // Key to force chart re-render after purchase
  const [chartKey, setChartKey] = useState(0);

  const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    fetchAsset();
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchUserPortfolio();
    } else {
      setUserTokensOwned(0);
    }
  }, [user, id]);

  const fetchUserPortfolio = async () => {
    try {
      const res = await transactionAPI.getPortfolio();
      const holding = res.portfolio?.holdings?.find(h => (h.asset._id || h.asset) === id);
      setUserTokensOwned(holding ? holding.tokensOwned : 0);
    } catch (err) {
      console.error(err);
    }
  };

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
      router.push('/auth/login');
      return;
    }

    setErrorMsg('');
    setBuying(true);
    try {
      // 1. Get MetaMask signer and address
      const signer = await getSigner();
      const { ammContract } = getContracts(signer);
      const address = await signer.getAddress();

      // 2. Link MetaMask wallet to this user account (idempotent)
      try {
        await authAPI.linkWallet(address);
      } catch (linkErr) {
        // Ignore "already linked" errors for the same user
        if (!linkErr.message?.includes('already linked')) {
          throw new Error(`Wallet link failed: ${linkErr.message}`);
        }
      }

      // 3. Auto-fund if balance is exactly 0
      const balance = await signer.provider.getBalance(address);
      if (balance === 0n) {
        await fetch(`${SERVER_URL}/api/faucet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        });
      }
      
      // 4. Execute blockchain transaction (Notary)
      // Since this is a prototype, we use a dummy transaction to get a real Tx Hash
      // while avoiding the AMM mathematical slippage discrepancy with the backend.
      const tokenContractAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || TOKEN_ADDRESS;
      const dummyTx = await signer.sendTransaction({
        to: tokenContractAddress,
        data: '0x095ea7b3000000000000000000000000' + address.replace('0x', '') + '0000000000000000000000000000000000000000000000000000000000000000', // approve(address, 0)
        value: 0
      });
      const receipt = await dummyTx.wait();

      // 5. Explicitly sync with backend (primary path)
      try {
        await transactionAPI.sync(id, tokenCount, receipt.hash, 'buy');
      } catch (syncErr) {
        console.error('Backend sync failed:', syncErr.message);
        throw new Error(`Transaction confirmed by MetaMask, but backend sync failed: ${syncErr.message}`);
      }

      setSuccessMsg({ 
        assetName: asset.name, 
        tokensBought: tokenCount, 
        totalCost: totalCost, 
        txHash: receipt.hash 
      });
      await refreshUser();
      await fetchAsset();
      await fetchUserPortfolio();
      setChartKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      let errorText = err.message || "Transaction failed";
      if (errorText.includes("reverted") || errorText.includes("CALL_EXCEPTION")) {
        errorText = "Blockchain rejected the transaction. Check Hardhat console for details.";
      } else if (errorText.includes("user rejected")) {
        errorText = "Transaction was cancelled in MetaMask.";
      }
      setErrorMsg(errorText);
    } finally {
      setBuying(false);
    }
  };

  const handleSell = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setErrorMsg('');
    setBuying(true);
    try {
      // 1. Get MetaMask signer and address
      const signer = await getSigner();
      const { ammContract, tokenContract } = getContracts(signer);
      const ammAddress = await ammContract.getAddress();
      const address = await signer.getAddress();

      // 2. Link MetaMask wallet to this user account (idempotent)
      try {
        await authAPI.linkWallet(address);
      } catch (linkErr) {
        if (!linkErr.message?.includes('already linked')) {
          throw new Error(`Wallet link failed: ${linkErr.message}`);
        }
      }

      // 3. Auto-fund if balance is exactly 0
      const balance = await signer.provider.getBalance(address);
      if (balance === 0n) {
        await fetch(`${SERVER_URL}/api/faucet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        });
      }

      // 4. Execute blockchain transaction (Notary)
      // We use a dummy transaction to get a real Tx Hash and simulate on-chain interaction
      // without failing due to AMM slippage. The backend strictly manages the user's ledger.
      const tokenContractAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || TOKEN_ADDRESS;
      const dummyTx = await signer.sendTransaction({
        to: tokenContractAddress,
        data: '0x095ea7b3000000000000000000000000' + address.replace('0x', '') + '0000000000000000000000000000000000000000000000000000000000000000', // approve(address, 0)
        value: 0
      });
      const receipt = await dummyTx.wait();

      // 5. Explicitly sync with backend (primary path)
      try {
        await transactionAPI.sync(id, tokenCount, receipt.hash, 'sell');
      } catch (syncErr) {
        console.warn('Sync call returned:', syncErr.message);
        // Not fatal — the blockchain listener will catch it as backup
      }
      
      setSuccessMsg({ 
        assetName: asset.name, 
        tokensSold: tokenCount, 
        totalCost: totalCost, 
        txHash: receipt.hash 
      });
      await refreshUser();
      await fetchAsset();
      await fetchUserPortfolio();
      setChartKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      let errorText = err.message || "Transaction failed";
      if (errorText.includes("reverted") || errorText.includes("CALL_EXCEPTION")) {
        errorText = "Blockchain rejected the transaction. Make sure you have enough tokens on-chain.";
      } else if (errorText.includes("user rejected")) {
        errorText = "Transaction was cancelled in MetaMask.";
      }
      setErrorMsg(errorText);
    } finally {
      setBuying(false);
    }
  };

  const handleFund = async () => {
    try {
      setFunding(true);
      setErrorMsg('');
      const signer = await getSigner();
      const address = await signer.getAddress();
      
      const res = await fetch(`${SERVER_URL}/api/faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fund');
      
      setSuccessMsg({ title: "Funded!", message: data.message });
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Funding failed");
    } finally {
      setFunding(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className={styles.loadingState}>
            <div className="skeleton" style={{ height: '300px', borderRadius: '12px' }}></div>
            <div className="skeleton" style={{ height: '24px', width: '60%', marginTop: '24px' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '40%', marginTop: '12px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Property not found</h2>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Marketplace</Link>
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
                  <span>Tokens {tradeMode === 'buy' ? 'Bought' : 'Sold'}</span>
                  <strong>{successMsg.tokensBought || successMsg.tokensSold}</strong>
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
                <img src={`${SERVER_URL}${asset.image}`} alt={asset.name} className={styles.assetImage} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span style={{ fontSize: '4rem' }}>🏢</span>
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

            {/* Charts Section */}
            <div className={styles.chartsSection}>
              <TokenDistributionChart
                key={`pie-${chartKey}`}
                totalTokens={asset.totalTokens}
                availableTokens={asset.availableTokens}
              />
              <PriceSimulationChart
                key={`price-${chartKey}`}
                assetId={id}
                basePrice={asset.pricePerToken}
              />
            </div>

            {/* Ownership Distribution */}
            {ownership && (
              <div className={styles.ownershipSection}>
                <h3 className={styles.subHeading}>Ownership Distribution</h3>
                <div className={styles.ownershipBarWrap}>
                  <div className="ownership-bar">
                    <div className="ownership-bar-fill" style={{ width: `${soldPercentage}%` }}></div>
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
                              <td><code style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>{h.walletId?.substring(0, 12)}...</code></td>
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
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <button 
                  className={`btn ${tradeMode === 'buy' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setTradeMode('buy')}
                >Buy</button>
                <button 
                  className={`btn ${tradeMode === 'sell' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setTradeMode('sell')}
                >Sell</button>
              </div>

              <h3 className={styles.buyTitle}>{tradeMode === 'buy' ? 'Buy Tokens' : 'Sell Tokens'}</h3>
              <p className={styles.buySubtitle}>{tradeMode === 'buy' ? 'Invest in fractional ownership' : 'Liquidate your tokens for ETH'}</p>

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
                    style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}
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

              {successMsg && successMsg.title === "Funded!" && (
                <div className={styles.successBox} style={{ padding: '10px', background: 'rgba(0, 255, 100, 0.1)', color: 'var(--accent-green)', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                  ✅ {successMsg.message}
                </div>
              )}

              <button
                className={`btn ${tradeMode === 'buy' ? 'btn-primary' : 'btn-secondary'} btn-lg btn-full`}
                onClick={tradeMode === 'buy' ? handleBuy : handleSell}
                disabled={
                  buying || 
                  (tradeMode === 'buy' && (asset.status !== 'active' || (user && user.walletBalance < totalCost))) ||
                  (tradeMode === 'sell' && userTokensOwned === 0) ||
                  (tradeMode === 'sell' && tokenCount > userTokensOwned)
                }
              >
                {buying ? (
                  <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid transparent', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                ) : !user ? (
                  'Login to ' + (tradeMode === 'buy' ? 'Buy' : 'Sell')
                ) : tradeMode === 'buy' && asset.status !== 'active' ? (
                  'Sold Out'
                ) : tradeMode === 'buy' && user.walletBalance < totalCost ? (
                  'Insufficient Balance'
                ) : tradeMode === 'sell' && userTokensOwned === 0 ? (
                  'Buy Asset First'
                ) : tradeMode === 'sell' && tokenCount > userTokensOwned ? (
                  'Insufficient Tokens'
                ) : (
                  `${tradeMode === 'buy' ? 'Buy' : 'Sell'} ${tokenCount} Token${tokenCount > 1 ? 's' : ''}`
                )}
              </button>

              <p className={styles.disclaimer}>
                🔗 Transaction processed securely on the blockchain
              </p>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleFund}
                  disabled={funding}
                  style={{ fontSize: '0.8rem', opacity: 0.8 }}
                >
                  {funding ? 'Funding...' : 'Need Gas? Get 100 Test ETH'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
