import SectionHeader from './SectionHeader.jsx';
import ProductCard from './ProductCard.jsx';

export default function FeaturedProducts({ products, onProductInterest }) {
  const carouselProducts = [...products, ...products];

  return (
    <section className="section products-section" id="produtos">
      <SectionHeader
        label="Destaques"
        title="Produtos em destaque"
        subtitle="Mais vendidos, lançamentos e escolhas para sair da loja pronto."
      />

      <div className="product-rail" aria-label="Produtos em destaque">
        <div className="product-track">
          {carouselProducts.map((product, index) => (
            <ProductCard
              key={`${product.id}-${index}`}
              product={product}
              onProductInterest={onProductInterest}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
