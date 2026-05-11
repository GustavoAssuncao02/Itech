import { useEffect, useMemo, useState } from 'react';
import { createLead, getHome } from './api.js';
import { fallbackHome } from './data/fallbackHome.js';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import CategoryGrid from './components/CategoryGrid.jsx';
import FeaturedProducts from './components/FeaturedProducts.jsx';
import StoreHours from './components/StoreHours.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [home, setHome] = useState(fallbackHome);
  const [status, setStatus] = useState('loading');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    getHome()
      .then((data) => {
        if (!active) return;
        setHome(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('offline');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const navigationCategories = useMemo(
    () => home.categories.slice(0, 4),
    [home.categories]
  );

  async function handleProductInterest(product) {
    setNotice(`Reservando interesse em ${product.name}...`);

    try {
      await createLead({
        productId: product.id,
        customerName: 'Visitante do site',
        phone: '',
        message: `Interesse gerado pela home para ${product.name}`
      });
      setNotice(`Interesse em ${product.name} registrado.`);
    } catch {
      setNotice('Não consegui registrar agora, mas a vitrine continua disponível.');
    }
  }

  return (
    <>
      <Navbar
        categories={navigationCategories}
        storeName={home.store.name}
        status={status}
      />
      <main>
        <Hero hero={home.hero} />
        <CategoryGrid categories={home.categories} />
        <FeaturedProducts
          products={home.featuredProducts}
          onProductInterest={handleProductInterest}
        />
        <StoreHours
          hours={home.businessHours}
          location={home.store.location}
          locations={home.locations}
        />
      </main>
      <Footer store={home.store} categories={navigationCategories} />
      {notice ? <div className="toast" role="status">{notice}</div> : null}
    </>
  );
}
