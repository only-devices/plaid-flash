import React from 'react';
import { ProductConfig } from '@/lib/productConfig';

interface ProductSelectorProps {
  products: ProductConfig[];
  onSelect: (productId: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ products, onSelect, onBack, showBackButton }) => {
  return (
    <div className="product-selector">
      {showBackButton && onBack && (
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7L7 17M7 17V7M7 17H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <h2 className="product-selector-title">Choose Your Own Adventure</h2>
      <p className="product-selector-subtitle"></p>
      <div className="product-grid">
        {products.map((product) => (
          <button
            key={product.id}
            className="product-card"
            onClick={() => onSelect(product.id)}
            style={{ background: product.gradient }}
          >
            <div className="product-card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="product-card-name">{product.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;

