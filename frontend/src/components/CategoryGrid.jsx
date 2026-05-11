import {
  Cable,
  Headphones,
  Laptop,
  MonitorPlay,
  Smartphone,
  Speaker,
  Tablet,
  Watch
} from 'lucide-react';
import SectionHeader from './SectionHeader.jsx';

const icons = {
  smartphone: Smartphone,
  laptop: Laptop,
  watch: Watch,
  headphones: Headphones,
  tablet: Tablet,
  cable: Cable,
  tv: MonitorPlay,
  speaker: Speaker
};

export default function CategoryGrid({ categories }) {
  return (
    <section className="section categories-section" id="categorias">
      <SectionHeader
        label="Categorias"
        title="Encontre o que procura"
        subtitle="Produtos Apple e acessórios selecionados para a sua rotina."
      />

      <div className="category-grid">
        {categories.map((category) => {
          const Icon = icons[category.icon] ?? Smartphone;

          return (
            <a className="category-card" href="#produtos" key={category.id}>
              <Icon size={30} strokeWidth={1.7} aria-hidden="true" />
              <strong>{category.name}</strong>
              <span>{category.description}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
