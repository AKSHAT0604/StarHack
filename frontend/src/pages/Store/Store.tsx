import React, { useState, useEffect } from 'react';
import './Store.css';
import { usePoints } from '../../contexts/PointsContext';

interface StoreProduct {
  product_id: number;
  product_name: string;
  product_description: string;
  product_category: string;
  base_price: number;
  discounted_price: number;
  discount_percentage: number;
  product_icon: string;
}

interface TierInfo {
  tier_name: string;
  min_streak: number;
  max_streak: number | null;
  discount_percentage: number;
  tier_color: string;
  tier_icon: string;
  current_streak: number;
  next_tier: string | null;
  streaks_to_next_tier: number | null;
}

interface Purchase {
  purchase_id: number;
  product_name: string;
  product_category: string;
  original_price: number;
  discount_applied: number;
  final_price: number;
  user_tier: string;
  purchase_date: string;
}

const Store: React.FC = () => {
  const { user } = usePoints();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchStoreData();
  }, [user]);

  const fetchStoreData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await fetch(`http://localhost:8000/store/products/${user.user_id}`);
      const productsData = await productsRes.json();
      setProducts(productsData);

      // Fetch tier info
      const tierRes = await fetch(`http://localhost:8000/user/${user.user_id}/tier`);
      const tierData = await tierRes.json();
      setTierInfo(tierData);

      // Fetch purchase history
      const purchasesRes = await fetch(`http://localhost:8000/user/${user.user_id}/purchases`);
      const purchasesData = await purchasesRes.json();
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: number, productName: string) => {
    if (!user) return;

    // Confirm purchase
    const product = products.find(p => p.product_id === productId);
    if (!product) return;

    const confirmMsg = `Purchase ${productName} for ₹${product.discounted_price.toFixed(2)}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setPurchasing(productId);
      
      const response = await fetch(`http://localhost:8000/store/purchase/${user.user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\n\nYou saved ₹${(data.original_price - data.final_price).toFixed(2)} with your ${tierInfo?.tier_name} tier discount!`);
        fetchStoreData(); // Refresh data
      } else {
        alert(`❌ ${data.detail || 'Purchase failed'}`);
      }
    } catch (error) {
      console.error('Error purchasing product:', error);
      alert('❌ Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryProducts = () => {
    if (selectedCategory === 'all') return products;
    return products.filter(p => p.product_category === selectedCategory);
  };

  const categoryNames: { [key: string]: string } = {
    'all': 'All Products',
    'wellness': 'Wellness Services',
    'insurance': 'Insurance Products',
    'premium_feature': 'Premium Features'
  };

  if (loading) {
    return (
      <div className="store">
        <div className="loading">Loading store...</div>
      </div>
    );
  }

  return (
    <div className="store">
      {/* Tier Banner */}
      {tierInfo && (
        <div className="tier-banner" style={{ borderColor: tierInfo.tier_color }}>
          <div className="tier-badge" style={{ background: tierInfo.tier_color }}>
            <span className="tier-icon">{tierInfo.tier_icon}</span>
            <span className="tier-name">{tierInfo.tier_name} Tier</span>
          </div>
          <div className="tier-info">
            <div className="tier-stat">
              <span className="tier-label">Your Streak</span>
              <span className="tier-value">🔥 {tierInfo.current_streak} days</span>
            </div>
            <div className="tier-stat">
              <span className="tier-label">Your Discount</span>
              <span className="tier-value">{tierInfo.discount_percentage}% OFF</span>
            </div>
            {tierInfo.next_tier && (
              <div className="tier-stat">
                <span className="tier-label">Next Tier</span>
                <span className="tier-value">
                  {tierInfo.next_tier} in {tierInfo.streaks_to_next_tier} days
                </span>
              </div>
            )}
            {user?.streak_freeze_available && (
              <div className="tier-stat">
                <span className="tier-label">Streak Freeze</span>
                <span className="tier-value streak-freeze-active">✅ Active</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Store Header */}
      <div className="store-header">
        <h1>💎 Premium Store</h1>
        <p className="store-subtitle">Unlock wellness services, insurance, and premium features</p>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {['all', 'wellness', 'insurance', 'premium_feature'].map(category => (
          <button
            key={category}
            className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {categoryNames[category]}
          </button>
        ))}
      </div>

      {/* Tier Benefits Info */}
      <div className="tier-benefits-section">
        <h2>🎯 Tier Benefits</h2>
        <div className="tier-benefits-grid">
          <div className="tier-benefit-card bronze">
            <div className="tier-benefit-icon">🥉</div>
            <h3>Bronze</h3>
            <p>0-6 day streak</p>
            <div className="tier-benefit-discount">0% discount</div>
          </div>
          <div className="tier-benefit-card silver">
            <div className="tier-benefit-icon">🥈</div>
            <h3>Silver</h3>
            <p>7-29 day streak</p>
            <div className="tier-benefit-discount">5% discount</div>
          </div>
          <div className="tier-benefit-card gold">
            <div className="tier-benefit-icon">🥇</div>
            <h3>Gold</h3>
            <p>30-89 day streak</p>
            <div className="tier-benefit-discount">10% discount</div>
          </div>
          <div className="tier-benefit-card platinum">
            <div className="tier-benefit-icon">💎</div>
            <h3>Platinum</h3>
            <p>90-179 day streak</p>
            <div className="tier-benefit-discount">15% discount</div>
          </div>
          <div className="tier-benefit-card diamond">
            <div className="tier-benefit-icon">💠</div>
            <h3>Diamond</h3>
            <p>180+ day streak</p>
            <div className="tier-benefit-discount">20% discount</div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        <h2>{categoryNames[selectedCategory]}</h2>
        <div className="products-grid">
          {getCategoryProducts().map(product => (
            <div key={product.product_id} className={`product-card ${product.product_category}`}>
              <div className="product-icon">{product.product_icon}</div>
              <h3>{product.product_name}</h3>
              <p className="product-description">{product.product_description}</p>
              
              <div className="product-pricing">
                {product.discount_percentage > 0 && (
                  <div className="original-price">₹{product.base_price.toFixed(2)}</div>
                )}
                <div className="discounted-price">₹{product.discounted_price.toFixed(2)}</div>
                {product.discount_percentage > 0 && (
                  <div className="discount-badge">{product.discount_percentage}% OFF</div>
                )}
              </div>

              {product.discount_percentage > 0 && (
                <div className="savings-info">
                  You save ₹{(product.base_price - product.discounted_price).toFixed(2)}
                </div>
              )}

              <button
                className="purchase-button"
                onClick={() => handlePurchase(product.product_id, product.product_name)}
                disabled={purchasing === product.product_id}
              >
                {purchasing === product.product_id ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase History */}
      {purchases.length > 0 && (
        <div className="purchase-history-section">
          <h2>📜 Purchase History</h2>
          <div className="purchase-history-list">
            {purchases.map(purchase => (
              <div key={purchase.purchase_id} className="purchase-item">
                <div className="purchase-details">
                  <h4>{purchase.product_name}</h4>
                  <p className="purchase-date">
                    {new Date(purchase.purchase_date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="purchase-pricing">
                  <div className="purchase-tier">{purchase.user_tier} Tier</div>
                  <div className="purchase-final-price">₹{purchase.final_price.toFixed(2)}</div>
                  {purchase.discount_applied > 0 && (
                    <div className="purchase-savings">
                      Saved ₹{(purchase.original_price - purchase.final_price).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
