import { ShoppingCart } from 'lucide-react';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export default function ProductCard({ product, onProductInterest }) {
  return (
    <article className="product-card">
      <div className={`product-visual ${product.color}`}>
        <span className={`device-shape ${product.visual}`} />
      </div>
      <span className="product-badge">{product.badge}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <strong className="price">{currency.format(product.priceCents / 100)}</strong>
      <button type="button" onClick={() => onProductInterest(product)}>
        <ShoppingCart size={16} aria-hidden="true" />
        Comprar agora
      </button>
    </article>
  );
}
