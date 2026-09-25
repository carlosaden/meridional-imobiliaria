/**
 * Imobiliária Meridional - Dataset de Imóveis e Empreendimentos de Uberaba/MG
 * Base de dados rica com imóveis reais baseados no acervo da Meridional
 */

const PROPERTIES_DATA = [
  {
    id: "3277",
    code: "ME-3277",
    title: "Mansão de Alto Padrão no Damha II",
    type: "casa",
    category: "condominio",
    purpose: "venda",
    price: 3650000,
    rentalPrice: 28000,
    condoFee: 980,
    iptu: 3400,
    neighborhood: "Damha II",
    city: "Uberaba",
    state: "MG",
    address: "Condomínio Residencial Damha II",
    area: 480,
    builtArea: 420,
    bedrooms: 4,
    suites: 4,
    bathrooms: 6,
    parkingSpots: 4,
    featured: true,
    badge: "Exclusividade",
    description: "Espetacular residência térrea em um dos condomínios mais nobres de Uberaba. Projeto arquitetônico contemporâneo com pé-direito duplo, integração total entre living e área gourmet, acabamentos em mármore travertino e porcelanato de grande formato. Conta com 4 suítes plenas (master com closet e hidromassagem), home cinema, escritório privativo, piscina aquecida com borda infinita, hidromassagem e paisagismo completo assinado.",
    features: [
      "Piscina Aquecida",
      "Espaço Gourmet com Churrasqueira",
      "Energia Solar Fotovoltaica",
      "Pé-direito Duplo",
      "4 Suítes com Closet",
      "Home Cinema",
      "Automação Residencial",
      "Condomínio Fechado com Segurança 24h",
      "Quadras de Tênis e Beach Tennis no Condomínio"
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3234",
    code: "ME-3234",
    title: "Casa Moderna no Condomínio Flamboyant",
    type: "casa",
    category: "condominio",
    purpose: "venda",
    price: 2100000,
    rentalPrice: 12000,
    condoFee: 750,
    iptu: 2100,
    neighborhood: "Flamboyant",
    city: "Uberaba",
    state: "MG",
    address: "Residencial Flamboyant II",
    area: 390,
    builtArea: 310,
    bedrooms: 3,
    suites: 3,
    bathrooms: 5,
    parkingSpots: 4,
    featured: true,
    badge: "Destaque",
    description: "Excelente imóvel com design arrojado e ótima luminosidade natural. Composto por 3 amplas suítes com persianas automatizadas, lavabo elegante, sala em 2 ambientes, cozinha planejada com ilha central e despensa, varanda gourmet completa com churrasqueira e piscina com cascata.",
    features: [
      "Piscina com Cascata",
      "Área Gourmet Completa",
      "Móveis Planejados",
      "Ar Condicionado Instalado",
      "Segurança 24h com Ronda",
      "Garagem para 4 Veículos"
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3334",
    code: "ME-3334",
    title: "Apartamento Elegante no Centro",
    type: "apartamento",
    category: "apartamento",
    purpose: "venda",
    price: 360000,
    rentalPrice: 2200,
    condoFee: 420,
    iptu: 750,
    neighborhood: "Centro",
    city: "Uberaba",
    state: "MG",
    address: "Rua Vigário Silva, Centro",
    area: 94,
    builtArea: 94,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parkingSpots: 1,
    featured: true,
    badge: "Oportunidade",
    description: "Apartamento totalmente reformado no coração de Uberaba, próximo aos principais comércios, bancos, colégios e clínicas. Sala ampla para dois ambientes com sacada e vista panorâmica da cidade. 2 dormitórios confortáveis sendo 1 suíte, armários embutidos de alta qualidade e cozinha com bancadas em granito.",
    features: [
      "Excelente Localização",
      "Armários Embutidos",
      "Sacada Panorâmica",
      "Portaria com Acesso Digital",
      "Elevador Social e de Serviço"
    ],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3318",
    code: "ME-3318",
    title: "Apartamento de Alto Luxo - Edifício Évros",
    type: "apartamento",
    category: "apartamento",
    purpose: "aluguel",
    price: 980000,
    rentalPrice: 4500,
    condoFee: 850,
    iptu: 1400,
    neighborhood: "Mercês",
    city: "Uberaba",
    state: "MG",
    address: "Próximo à Praça Dom Eduardo, Mercês",
    area: 168,
    builtArea: 168,
    bedrooms: 3,
    suites: 3,
    bathrooms: 5,
    parkingSpots: 2,
    featured: true,
    badge: "Locação Nobre",
    description: "Magnífico apartamento no Edifício Évros, no tradicional e charmoso bairro Mercês. Unidade exclusiva com 3 suítes, varanda gourmet envidraçada com churrasqueira a carvão, sala de estar e jantar integradas, lavabo e dependência completa para colaboradores.",
    features: [
      "Varanda Gourmet Envidraçada",
      "Piscina e Academia no Prédio",
      "Salão de Festas Climatizado",
      "3 Suítes Climatizadas",
      "Portaria 24h Blindada",
      "2 Vagas Cobertas e Paralelas"
    ],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3226",
    code: "ME-3226",
    title: "Apartamento Aconchegante no Residencial Turim",
    type: "apartamento",
    category: "apartamento",
    purpose: "venda",
    price: 155000,
    rentalPrice: 1100,
    condoFee: 220,
    iptu: 350,
    neighborhood: "Parque das Américas",
    city: "Uberaba",
    state: "MG",
    address: "Residencial Turim",
    area: 52,
    builtArea: 52,
    bedrooms: 2,
    suites: 0,
    bathrooms: 1,
    parkingSpots: 1,
    featured: false,
    badge: "Minha Casa Minha Vida",
    description: "Excelente oportunidade para o primeiro imóvel ou investimento para renda de aluguel. Apartamento funcional com 2 quartos, sala, cozinha americana com área de serviço conjugada, banheiro social e 1 vaga de garagem privativa. Financiamento facilitado com subsídio Caixa.",
    features: [
      "Financiamento Caixa / MCMV",
      "Condomínio Econômico",
      "Playground e Espaço Pet",
      "Portaria e Interfonia",
      "Água e Gás Inclusos no Condomínio"
    ],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3273",
    code: "ME-3273",
    title: "Casa Ampla e Moderna no Jardim Nenê Gomes",
    type: "casa",
    category: "casa",
    purpose: "venda",
    price: 890000,
    rentalPrice: 4200,
    condoFee: 0,
    iptu: 1100,
    neighborhood: "Jardim Nenê Gomes",
    city: "Uberaba",
    state: "MG",
    address: "Jardim Nenê Gomes",
    area: 280,
    builtArea: 215,
    bedrooms: 3,
    suites: 2,
    bathrooms: 4,
    parkingSpots: 2,
    featured: false,
    badge: "Excelente Preço",
    description: "Casa recém-construída em rua tranquila e de fácil acesso. Acabamento refinado em porcelanato e sancas de gesso com iluminação em LED. Possui 3 quartos amplos (sendo 2 suítes), sala ampla em conceito aberto, cozinha gourmet com churrasqueira e quintal gramado com espaço para piscina.",
    features: [
      "Espaço Gourmet com Churrasqueira",
      "Porcelanato Polido",
      "Iluminação em LED",
      "Portão Eletrônico e Interfone",
      "Quintal Espaçoso"
    ],
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3321",
    code: "ME-3321",
    title: "Mansão Comercial ou Residencial no Centro",
    type: "comercial",
    category: "comercial",
    purpose: "aluguel",
    price: 1850000,
    rentalPrice: 10000,
    condoFee: 0,
    iptu: 2800,
    neighborhood: "Centro",
    city: "Uberaba",
    state: "MG",
    address: "Próximo à Avenida Leopoldino de Oliveira",
    area: 520,
    builtArea: 440,
    bedrooms: 4,
    suites: 2,
    bathrooms: 4,
    parkingSpots: 4,
    featured: false,
    badge: "Comercial / Clínica",
    description: "Imóvel imponente ideal para clínicas médicas, escritórios de advocacia, sedes empresariais ou residência de prestígio. Ampla fachada, recepção espaçosa, 8 salas/cômodos climatizados, estacionamento interno para clientes e excelente visibilidade comercial.",
    features: [
      "Ideal para Clínicas e Empresas",
      "Estacionamento Privativo",
      "Excelente Visibilidade",
      "Ambientes Climatizados",
      "Acessibilidade Completa"
    ],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3083",
    code: "ME-3083",
    title: "Prédio Comercial Completo para Grandes Empresas",
    type: "comercial",
    category: "comercial",
    purpose: "aluguel",
    price: 4500000,
    rentalPrice: 25000,
    condoFee: 0,
    iptu: 5200,
    neighborhood: "São Benedito",
    city: "Uberaba",
    state: "MG",
    address: "Bairro São Benedito",
    area: 950,
    builtArea: 820,
    bedrooms: 0,
    suites: 0,
    bathrooms: 5,
    parkingSpots: 5,
    featured: false,
    badge: "Corporativo",
    description: "Prédio comercial moderno em 3 pavimentos com estrutura completa para call centers, sedes corporativas, instituições de ensino ou polos de tecnologia. Salões livres em vão aberto, piso elevado, cabeamento estruturado e elevador panorâmico.",
    features: [
      "3 Pavimentos com Vão Livre",
      "Piso Elevado e Cabeamento",
      "Elevador com Acessibilidade",
      "Estacionamento Frontal",
      "Gerador de Energia Próprio"
    ],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "3281",
    code: "ME-3281",
    title: "Galpão Industrial e Logístico na Univerdecidade",
    type: "comercial",
    category: "galpao",
    purpose: "aluguel",
    price: 6800000,
    rentalPrice: 40000,
    condoFee: 0,
    iptu: 4500,
    neighborhood: "Univerdecidade",
    city: "Uberaba",
    state: "MG",
    address: "Polo Logístico Univerdecidade",
    area: 3200,
    builtArea: 2400,
    bedrooms: 0,
    suites: 0,
    bathrooms: 6,
    parkingSpots: 12,
    featured: false,
    badge: "Logística Pesada",
    description: "Galpão de grande porte estratégico para distribuição e armazenagem, localizado no polo industrial da Univerdecidade em Uberaba com acesso imediato às rodovias BR-050 e BR-262. Pé-direito de 12 metros, piso industrial de alta resistência (6 ton/m²) e 4 docas niveladas.",
    features: [
      "Pé-direito de 12m",
      "Piso para 6 Toneladas/m²",
      "4 Docas com Niveladores",
      "Pátio de Manobra para Carretas",
      "Escritórios Administrativos e Vestiários"
    ],
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "2302",
    code: "ME-2302",
    title: "Terreno Plano e Exclusivo no Damha III",
    type: "terreno",
    category: "terreno",
    purpose: "venda",
    price: 490000,
    rentalPrice: 0,
    condoFee: 650,
    iptu: 1200,
    neighborhood: "Damha III",
    city: "Uberaba",
    state: "MG",
    address: "Condomínio Damha III",
    area: 450,
    builtArea: 0,
    bedrooms: 0,
    suites: 0,
    bathrooms: 0,
    parkingSpots: 0,
    featured: true,
    badge: "Lote Nobre",
    description: "Lote plano com localização privilegiada na parte alta do condomínio Damha III, próximo ao complexo esportivo e lago. Ideal para construir a casa dos seus sonhos com máxima segurança e qualidade de vida.",
    features: [
      "Topografia 100% Plana",
      "Excelente Orientação Solar",
      "Condomínio com Lago e Bosque",
      "Clube Social Completo",
      "Segurança com Câmeras Térmicas"
    ],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

const DEVELOPMENTS_DATA = [
  {
    id: "dev-turpan",
    code: "2916",
    title: "TURPAN Residencial",
    badge: "Lançamento Exclusivo",
    type: "Apartamentos de 2 e 3 Quartos",
    status: "Em Obras / Entrega 2027",
    neighborhood: "Mercês / Universitário",
    priceFrom: 289000,
    unitsDescription: "Unidades de 64m² a 88m² com varanda gourmet e lazer de resort.",
    banner: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Varanda com churrasqueira", "Piscina com raia de 25m", "Coworking integrado", "Espaço fitness climatizado", "Car wash e ponto para carro elétrico"]
  },
  {
    id: "dev-marialima",
    code: "3305",
    title: "Residencial Maria Lima",
    badge: "Sucesso de Vendas",
    type: "Casas em Condomínio Fechado",
    status: "Pronto para Morar",
    neighborhood: "Santa Marta / Damha",
    priceFrom: 460000,
    unitsDescription: "Condomínio boutique com casas térreas contemporâneas de 3 quartos (1 suíte) e quintal privativo.",
    banner: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Portaria inteligente", "Espaço gourmet privativo", "Baixa taxa de condomínio", "Próximo aos colégios Marista e Gabriel Totti"]
  },
  {
    id: "dev-jockey",
    code: "2972",
    title: "Residencial Jockey Ville",
    badge: "Últimas Unidades",
    type: "Lotes & Casas Planejadas",
    status: "Fase Final de Obras",
    neighborhood: "Jockey Park",
    priceFrom: 185000,
    unitsDescription: "Loteamento fechado com infraestrutura de alto padrão na região mais promissora de Uberaba.",
    banner: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Financiamento direto em até 180x", "Pista de caminhada arborizada", "Playground e pet place", "Monitoramento 24h"]
  },
  {
    id: "dev-barao",
    code: "2717",
    title: "Residencial Barão de Ituberaba",
    badge: "Alto Padrão",
    type: "Apartamentos Premium 180m²",
    status: "Lançamento",
    neighborhood: "São Benedito",
    priceFrom: 1150000,
    unitsDescription: "1 apartamento por andar com 4 suítes, 3 vagas e depósito individual.",
    banner: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    highlights: ["1 por andar com elevador privativo", "Piso aquecido nos banheiros", "Piscina coberta aquecida", "Adega climatizada para moradores"]
  }
];

const NEIGHBORHOODS_DATA = [
  { name: "Damha I, II e III", type: "Condomínios de Luxo", listings: 48, tag: "Alto Padrão", desc: "Referência absoluta em segurança, sofisticação e infraestrutura completa de lazer." },
  { name: "Mercês", type: "Bairro Tradicional & Residencial", listings: 62, tag: "Mais Procurado", desc: "Localização nobre, próximo a clínicas, hospitais, praças arborizadas e colégios." },
  { name: "Flamboyant", type: "Condomínios Fechados", listings: 35, tag: "Familiar", desc: "Ambiente bucólico, casas modernas e excelente valorização imobiliária constante." },
  { name: "Centro", type: "Comercial & Residencial", listings: 85, tag: "Conveniência", desc: "Praticidade de morar perto de tudo, com fácil acesso ao transporte e comércio geral." },
  { name: "São Benedito", type: "Residencial & Gastronômico", listings: 41, tag: "Charme", desc: "Bairro nobre com ruas arborizadas, restaurantes conceituados e alta qualidade de vida." },
  { name: "Univerdecidade", type: "Polo Logístico & Tecnológico", listings: 24, tag: "Investimento", desc: "Foco em grandes áreas empresariais, galpões logísticos e indústrias modernas." }
];

const BLOG_POSTS_DATA = [
  {
    id: "dica-1",
    title: "Como Financiar seu Imóvel pela Caixa em 2026: Guia Completo Passo a Passo",
    date: "18 Set 2026",
    category: "Financiamento",
    readTime: "4 min de leitura",
    summary: "Descubra como usar o FGTS, simular as melhores taxas de juros (SBPE e MCMV) e quais documentos são essenciais para aprovação rápida de crédito.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "dica-2",
    title: "Por que Contratar um Perito Avaliador Judicial de Imóveis (CNAI)?",
    date: "12 Set 2026",
    category: "Perícia & Avaliação",
    readTime: "3 min de leitura",
    summary: "Entenda a importância do Parecer Técnico de Avaliação Mercadológica (PTAM) para partilhas de herança, garantias bancárias e disputas judiciais com segurança jurídica.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "dica-3",
    title: "Mercado Imobiliário em Uberaba: Bairros que mais Valorizaram no Último Ano",
    date: "05 Set 2026",
    category: "Investimento",
    readTime: "5 min de leitura",
    summary: "Análise mercadológica sobre os vetores de crescimento de Uberaba, o boom dos condomínios fechados e as oportunidades para investidores de locação.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
  }
];

// Export to global scope
window.MERIDIONAL_DATA = {
  properties: PROPERTIES_DATA,
  developments: DEVELOPMENTS_DATA,
  neighborhoods: NEIGHBORHOODS_DATA,
  blogPosts: BLOG_POSTS_DATA,
  company: {
    name: "Imobiliária Meridional",
    legalName: "Meridional Corretores Associados",
    foundedYear: 1990,
    creci: "12.632 - 4ª Região / MG",
    founder: "Antonio Carlos Mendes (Técnico em Transações Imobiliárias & Perito Avaliador Judicial CNAI)",
    phone: "(34) 3312-6702",
    phoneClean: "553433126702",
    whatsapp: "(34) 9960-4600",
    whatsappClean: "553499604600",
    email: "meridionaluberaba@gmail.com",
    address: "Praça Dom Eduardo, 470 – Mercês, Uberaba – MG, CEP 38060-280",
    instagram: "https://www.instagram.com/meridionaluberaba/",
    facebook: "https://www.facebook.com/Meridional-178539326352585",
    caixaSimulatorUrl: "https://habitacao.caixa.gov.br/siopiweb-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
  }
};
