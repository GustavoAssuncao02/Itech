import { ArrowRight, MapPin } from 'lucide-react';
import PhoneMockup from './PhoneMockup.jsx';

export default function Hero({ hero }) {
  const [beforeAccent, ...afterAccentParts] = hero.title.includes(hero.accent)
    ? hero.title.split(hero.accent)
    : [hero.title, ''];
  const afterAccent = afterAccentParts.join(hero.accent);

  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <p className="eyebrow">{hero.badge}</p>
        <h1>
          {beforeAccent}
          <span>{hero.accent}</span>
          {afterAccent}
        </h1>
        <p className="hero-subtitle">{hero.subtitle}</p>
        <div className="hero-actions">
          <a className="button primary" href="#produtos">
            {hero.primaryActionLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary" href="#horarios">
            <MapPin size={18} aria-hidden="true" />
            {hero.secondaryActionLabel}
          </a>
        </div>
      </div>

      <div className="hero-display" aria-hidden="true">
        <PhoneMockup />
        <div className="device-note">
          <strong>iPhone 16 Pro</strong>
          <span>Garantia oficial · 12x no cartão</span>
        </div>
      </div>
    </section>
  );
}
