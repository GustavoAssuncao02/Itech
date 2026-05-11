export const fallbackHome = {
  store: {
    name: 'íTech',
    tagline: 'A Loja do Seu iPhone',
    location: 'Catu-BA e Alagoinhas-BA'
  },
  hero: {
    badge: 'Novo · iPhone 16 Pro disponível',
    title: 'A Loja do Seu iPhone',
    accent: 'iPhone',
    subtitle:
      'Produtos Apple originais e certificados, garantia oficial, atendimento especializado e parcelamento facilitado.',
    primaryActionLabel: 'Ver produtos',
    secondaryActionLabel: 'Horários e endereço'
  },
  categories: [
    {
      id: 1,
      name: 'iPhone',
      slug: 'iphone',
      description: 'iPhone 16, 15, SE e modelos certificados',
      icon: 'smartphone'
    },
    {
      id: 2,
      name: 'Mac',
      slug: 'mac',
      description: 'MacBook Air, MacBook Pro e iMac',
      icon: 'laptop'
    },
    {
      id: 3,
      name: 'Apple Watch',
      slug: 'apple-watch',
      description: 'Série 10, Ultra 2 e SE',
      icon: 'watch'
    },
    {
      id: 4,
      name: 'AirPods',
      slug: 'airpods',
      description: 'AirPods Pro, AirPods 4 e Max',
      icon: 'headphones'
    }
  ],
  featuredProducts: [
    {
      id: 1,
      name: 'iPhone 16 Pro',
      description: 'Chip A18 Pro, câmera de 48 MP e tela ProMotion de 6,3 polegadas.',
      priceCents: 929900,
      badge: 'iPhone',
      color: 'blue',
      visual: 'phone'
    },
    {
      id: 2,
      name: 'iPhone 15',
      description: 'Dynamic Island, câmera principal de 48 MP e acabamento resistente.',
      priceCents: 529900,
      badge: 'Mais vendido',
      color: 'green',
      visual: 'phone'
    },
    {
      id: 3,
      name: 'MacBook Air M3',
      description: 'Chip M3, 8 GB de memória unificada e tela Liquid Retina de 13,6 polegadas.',
      priceCents: 1249900,
      badge: 'Mac',
      color: 'silver',
      visual: 'laptop'
    }
  ],
  businessHours: [
    {
      id: 1,
      label: 'Segunda a sexta',
      displayTime: '8h às 17h30',
      weekdayStart: 1,
      weekdayEnd: 5,
      openMinutes: 480,
      closeMinutes: 1050
    },
    {
      id: 2,
      label: 'Sábado',
      displayTime: '8h às 12h',
      weekdayStart: 6,
      weekdayEnd: 6,
      openMinutes: 480,
      closeMinutes: 720
    }
  ],
  locations: [
    {
      id: 1,
      city: 'Catu',
      state: 'BA',
      label: 'Unidade Catu-BA',
      mapsUrl: 'https://maps.app.goo.gl/GtTJUAoFMqrtMWay6'
    },
    {
      id: 2,
      city: 'Alagoinhas',
      state: 'BA',
      label: 'Unidade Alagoinhas-BA',
      mapsUrl: null
    }
  ]
};
