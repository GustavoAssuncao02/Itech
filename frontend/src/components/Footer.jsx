export default function Footer({ store, categories }) {
  return (
    <footer className="footer">
      <div>
        <a className="brand footer-brand" href="#top">
          <span>{store.name.slice(0, 1)}</span>
          {store.name.slice(1)}
        </a>
        <p>{store.tagline} · Produtos Apple originais</p>
      </div>

      <div className="footer-links">
        {categories.map((category) => (
          <a href="#categorias" key={category.id}>
            {category.name}
          </a>
        ))}
        <a href="#horarios">Contato</a>
      </div>

      <small>
        Copyright © 2026 {store.name}. Garantia oficial e parcelamento em até 12x no cartão.
      </small>
    </footer>
  );
}
