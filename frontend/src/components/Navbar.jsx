import { ShoppingBag } from 'lucide-react';

export default function Navbar({ categories, storeName, status }) {
  return (
    <header className="site-header">
      <div className="top-line" />
      <nav className="nav-shell" aria-label="Navegação principal">
        <a className="brand" href="#top" aria-label={`${storeName} início`}>
          <span>{storeName.slice(0, 1)}</span>
          {storeName.slice(1)}
        </a>

        <div className="nav-links">
          {categories.map((category) => (
            <a href="#categorias" key={category.id}>
              {category.name}
            </a>
          ))}
          <a href="#horarios">Suporte</a>
        </div>

        <a className="nav-action" href="#produtos">
          <ShoppingBag size={16} aria-hidden="true" />
          Comprar
        </a>
      </nav>
      {status === 'offline' ? (
        <div className="api-banner">Usando dados locais até a API responder.</div>
      ) : null}
    </header>
  );
}
