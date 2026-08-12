'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { assetAPI } from '@/lib/api';
import styles from './page.module.css';

export default function AddAssetPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'commercial',
    totalValue: '',
    totalTokens: '',
    location: '',
    annualYield: '',
    image: null
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, authLoading, isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const pricePerToken = form.totalValue && form.totalTokens
    ? (Number(form.totalValue) / Number(form.totalTokens)).toFixed(2)
    : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });
      // Backend requires propertyAddress, so use the location field for it
      if (form.location) {
        formData.append('propertyAddress', form.location);
      }

      await assetAPI.create(formData);
      setSuccess(true);
      setTimeout(() => router.push('/admin'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link href="/admin" className={styles.backLink}>← Back to Admin</Link>

        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Add New Property</h1>
          <p className={styles.formSub}>List a new real estate property for tokenized investment</p>

          {success && (
            <div className={styles.successMsg}>
              ✅ Property created successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formLeft}>
                <div className="form-group">
                  <label className="form-label">Property Name</label>
                  <input type="text" name="name" className="form-input" placeholder="e.g. Marina Bay Towers — Unit 42A" value={form.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-input" placeholder="Detailed description of the property..." value={form.description} onChange={handleChange} required rows={5} />
                </div>

                <div className={styles.twoCol}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <div className={styles.computedField}>🏢 Real Estate</div>
                    <input type="hidden" name="category" value="commercial" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" name="location" className="form-input" placeholder="Mumbai, India" value={form.location} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.twoCol}>
                  <div className="form-group">
                    <label className="form-label">Total Value (₹)</label>
                    <input type="number" name="totalValue" className="form-input" placeholder="15000000" value={form.totalValue} onChange={handleChange} required min="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Tokens</label>
                    <input type="number" name="totalTokens" className="form-input" placeholder="15000" value={form.totalTokens} onChange={handleChange} required min="1" />
                  </div>
                </div>

                <div className={styles.twoCol}>
                  <div className="form-group">
                    <label className="form-label">Annual Yield (%)</label>
                    <input type="number" name="annualYield" className="form-input" placeholder="8.5" value={form.annualYield} onChange={handleChange} step="0.1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Per Token (Auto)</label>
                    <div className={styles.computedField}>₹{pricePerToken}</div>
                  </div>
                </div>
              </div>

              <div className={styles.formRight}>
                <div className="form-group">
                  <label className="form-label">Asset Image</label>
                  <div className={styles.uploadZone} onClick={() => document.getElementById('imageUpload').click()}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className={styles.uploadPreview} />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <span style={{ fontSize: '2.5rem' }}>📷</span>
                        <p>Click to upload image</p>
                        <span className={styles.uploadHint}>JPEG, PNG, WebP (max 5MB)</span>
                      </div>
                    )}
                    <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-gold btn-lg btn-full" disabled={loading || success} style={{ marginTop: 'var(--space-xl)' }}>
              {loading ? 'Creating...' : success ? 'Created ✓' : 'Create Asset'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
