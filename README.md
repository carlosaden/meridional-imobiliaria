# 🏢 Imobiliária Meridional — Portal Web Moderno & Mobile-First

> Recriação completa da plataforma da **[Imobiliária Meridional](https://meridional.imb.br)** (Uberaba - MG), fundada em 1990 (CRECI 12.632 / CNAI). Desenvolvido com foco total na experiência do usuário em smartphones (*mobile-first*), performance ultrarrápida, design system refinado (*UI/UX Pro Max*) e recursos avançados de conversão.

---

## ✨ Principais Diferenciais e Funcionalidades

- 📱 **Experiência Nativa Mobile (App-like)**:
  - Barra de navegação inferior flutuante (*Bottom Nav Bar*) com Início, Buscar, Favoritos, Anunciar e Contato.
  - Otimização para a *Thumb Zone* (zona do polegar em smartphones).
  - Suporte completo a *safe-areas* em dispositivos modernos com notch.
- 🎨 **Design System & Glassmorphism (UI/UX Pro Max)**:
  - Paleta sofisticada *Teal & Emerald* com acentos *Warm Amber*.
  - Efeitos refinados de *Backdrop Blur* e sombreamento em camadas (Z-depth).
  - Tipografia de alto impacto: **Plus Jakarta Sans**, **Inter** e **Cinzel**.
  - Modo Escuro / Claro com alternância suave e persistência no navegador.
- 🔍 **Busca & Filtros em Tempo Real**:
  - Filtros instantâneos por Finalidade (*Venda, Aluguel, Lançamentos*), Bairro de Uberaba (*Damha, Flamboyant, Mercês, Centro, etc.*), Tipo de Imóvel e Faixa de Preço.
  - Chips rápidos de categorias com rolagem horizontal touch.
- 🏡 **Catálogo Enriquecido & Modal de Detalhes**:
  - Cards com badges (*Destaque, Lançamento, Exclusividade, Oportunidade*).
  - Galeria de fotos com visualização e troca rápida de imagem.
  - Especificações completas (área total m², dormitórios, suítes, banheiros, vagas).
  - Sistema de **Favoritos** persistente no `localStorage`.
- 💳 **Simulador de Financiamento Habitacional (Caixa / Bancos)**:
  - Cálculo dinâmico em tempo real de parcelas pelo Sistema de Amortização Constante (SAC).
  - Estimativa de 1ª e última parcela, renda familiar mínima recomendada e valor financiado.
  - Botão de compartilhamento direto da simulação para o corretor no WhatsApp.
- ⚖️ **Módulo Perito Avaliador Imobiliário Judicial (CNAI)**:
  - Destaque institucional para os laudos técnicos de avaliação mercadológica (PTAM) emitidos por Antonio Carlos Mendes.
- ✍️ **Wizard "Cadastre seu Imóvel"**:
  - Formulário simplificado e responsivo para proprietários enviarem dados do seu imóvel com direcionamento automático para o WhatsApp do plantão.
- 💬 **Integração Completa com WhatsApp**:
  - Mensagens personalizadas e pré-formatadas para cada imóvel e simulação.
  - Botão flutuante de atendimento com animação de pulso contínuo.

---

## 📁 Estrutura de Arquivos

```
c:\Meridional/
├── index.html            # Aplicação Web SPA principal
├── css/
│   └── styles.css        # Design System, Glassmorphism e estilos responsivos
├── js/
│   ├── data.js           # Base de dados de imóveis, lançamentos e bairros
│   ├── simulator.js      # Motor matemático de cálculo de financiamento SAC/PRICE
│   └── app.js            # Controlador central da aplicação, filtros e modais
└── README.md             # Documentação do projeto
```

---

## 🚀 Como Executar Localmente

Como o projeto é construído sobre tecnologias web modernas e nativas (Vanilla JS + Modern CSS + HTML5), não há necessidade de etapas pesadas de compilação ou instalação de pacotes:

1. **Via Navegador**: Basta abrir o arquivo `index.html` diretamente em qualquer navegador moderno.
2. **Via Servidor Local (Live Server ou Python)**:
   ```bash
   # Com Python 3
   python -m http.server 8000
   ```
   Acesse `http://localhost:8000` no seu navegador ou smartphone na mesma rede Wi-Fi.

---

## 🌐 Deploy Rápido

O portal está 100% pronto para deploy em:
- **GitHub Pages** (gratuito)
- **Vercel** / **Netlify**
- **Firebase Hosting**
- Servidores de hospedagem tradicionais (Apache, Nginx, cPanel).

---

## 🏛️ Sobre a Imobiliária Meridional
- **Sede**: Praça Dom Eduardo, 470 – Mercês, Uberaba – MG (CEP 38060-280)
- **Fundação**: 1990
- **Responsável Técnico**: Antonio Carlos Mendes (CRECI 12.632 / CNAI)
- **Telefones**: (34) 3312-6702 | Plantão: (34) 9960-4600
