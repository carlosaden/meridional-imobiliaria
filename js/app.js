/**
 * Imobiliária Meridional - Core Application Controller (Multi-Page Architecture)
 * Focado 100% em visualização de imóveis, galerias, dados claros e contato direto no WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
  window.meridionalApp = new MeridionalApp();
  window.meridionalApp.init();
});

class MeridionalApp {
  constructor() {
    this.data = window.MERIDIONAL_DATA || { properties: [], company: {}, brokers: {} };
    this.properties = this.data.properties || [];
    this.favorites = this.loadFavorites();
    this.recentSearches = this.loadRecentSearches();
    this.currentTheme = localStorage.getItem('meridional_theme') || 'light';

    // Lightbox State
    this.lightboxImages = [];
    this.lightboxCurrentIndex = 0;

    // Catalog Filter State
    this.catalogFilter = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      keyword: '',
      sortBy: 'relevance'
    };
  }

  init() {
    this.registerPWA();
    this.setupTheme();
    this.updateFavoritesCount();
    this.setupScrollToTop();

    // 1. Página de Detalhes do Imóvel (imovel.html)
    if (document.getElementById('propertyDetailContainer')) {
      const params = new URLSearchParams(window.location.search);
      const propId = params.get('id') || params.get('codigo') || 'ME-3277';
      this.renderPropertyDetailPage(propId);
    }

    // 2. Catálogo de Imóveis (imoveis.html)
    if (document.getElementById('catalogPropertiesGrid')) {
      this.initCatalogPage();
    }

    // 3. Meus Favoritos (favoritos.html)
    if (document.getElementById('favoritesGrid')) {
      this.renderFavoritesPage();
    }

    // 4. Página Inicial (index.html)
    if (document.getElementById('damhaRow')) {
      this.initHomePage();
    }
  }

  // --- PWA Service Worker ---
  registerPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  // --- Feedback Tátil ---
  triggerHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }
  }

  // --- Theme Management ---
  setupTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = this.currentTheme === 'dark' 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    }
  }

  toggleTheme() {
    this.triggerHaptic();
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('meridional_theme', this.currentTheme);
    this.setupTheme();
    this.showToast(`Modo ${this.currentTheme === 'dark' ? 'Escuro' : 'Claro'} ativado`);
  }

  // --- Formatadores ---
  formatCurrency(value) {
    if (!value || isNaN(value)) return 'Consulte';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  }

  // --- Favorites Management ---
  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('meridional_favorites')) || [];
    } catch {
      return [];
    }
  }

  saveFavorites() {
    localStorage.setItem('meridional_favorites', JSON.stringify(this.favorites));
    this.updateFavoritesCount();
  }

  toggleFavorite(propId, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.triggerHaptic();
    const index = this.favorites.indexOf(propId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.showToast('Imóvel removido dos favoritos');
    } else {
      this.favorites.push(propId);
      this.showToast('Imóvel salvo nos favoritos! ❤️');
    }
    this.saveFavorites();

    // Atualiza ícones visuais em tela
    document.querySelectorAll(`.card-favorite-btn[data-id="${propId}"]`).forEach(btn => {
      btn.classList.toggle('favorited', this.favorites.includes(propId));
    });

    if (window.location.pathname.includes('favoritos.html')) {
      this.renderFavoritesPage();
    }
  }

  updateFavoritesCount() {
    const badges = document.querySelectorAll('.favorites-badge-count');
    badges.forEach(b => {
      b.textContent = this.favorites.length;
      b.style.display = this.favorites.length > 0 ? 'flex' : 'none';
    });
  }

  // --- Recent Searches ---
  loadRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem('meridional_recent_searches')) || ["Damha", "Flamboyant", "Mercês"];
    } catch {
      return ["Damha", "Flamboyant", "Mercês"];
    }
  }

  saveRecentSearch(term) {
    if (!term || term.trim() === '') return;
    const clean = term.trim();
    this.recentSearches = this.recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase());
    this.recentSearches.unshift(clean);
    if (this.recentSearches.length > 5) this.recentSearches.pop();
    localStorage.setItem('meridional_recent_searches', JSON.stringify(this.recentSearches));
    this.renderRecentSearches();
  }

  renderRecentSearches() {
    const container = document.getElementById('recentSearchesContainer');
    if (!container) return;
    container.innerHTML = `
      <span style="font-weight: 700;"><i class="fa-solid fa-clock-rotate-left"></i> Buscas:</span>
      ${this.recentSearches.map(s => `
        <span class="recent-search-pill" onclick="window.location.href='imoveis.html?q=${encodeURIComponent(s)}'">${s}</span>
      `).join('')}
    `;
  }

  // =========================================================================
  // HOME PAGE CONTROLLER (index.html)
  // =========================================================================
  initHomePage() {
    this.renderHomeSections();
    this.renderRecentSearches();
    this.renderFAQ();

    const searchInput = document.getElementById('searchKeywordInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleHomeAutocomplete(e.target.value));
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-field')) {
          const dd = document.getElementById('searchAutocompleteDropdown');
          if (dd) dd.style.display = 'none';
        }
      });
    }
  }

  setHomePurpose(purpose) {
    this.triggerHaptic();
    document.querySelectorAll('.search-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.purpose === purpose);
    });
    this.homePurpose = purpose;
  }

  handleHomeSearch(e) {
    e.preventDefault();
    const kw = document.getElementById('searchKeywordInput')?.value || '';
    const neigh = document.getElementById('searchNeighborhoodSelect')?.value || 'todos';
    const type = document.getElementById('searchTypeSelect')?.value || 'todos';
    const purpose = this.homePurpose || 'todos';

    if (kw) this.saveRecentSearch(kw);

    const params = new URLSearchParams();
    if (kw) params.set('q', kw);
    if (neigh !== 'todos') params.set('bairro', neigh);
    if (type !== 'todos') params.set('tipo', type);
    if (purpose !== 'todos') {
      if (purpose === 'damha') {
        params.set('tipo', 'damha');
      } else {
        params.set('finalidade', purpose);
      }
    }

    window.location.href = `imoveis.html?${params.toString()}`;
  }

  handleHomeAutocomplete(text) {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) return;
    if (!text || text.trim().length < 2) {
      dropdown.style.display = 'none';
      return;
    }
    const clean = text.toLowerCase().trim();
    const matches = this.properties.filter(p => 
      p.code.toLowerCase().includes(clean) ||
      p.title.toLowerCase().includes(clean) ||
      p.neighborhood.toLowerCase().includes(clean)
    ).slice(0, 5);

    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = matches.map(p => `
      <div class="autocomplete-item" onclick="window.location.href='imovel.html?id=${p.code}'">
        <div>
          <strong style="color: var(--primary);">${p.code}</strong> — ${p.title}
          <div style="font-size: 0.75rem; color: var(--text-muted);">${p.neighborhood} • ${this.formatCurrency(p.price)}</div>
        </div>
        <i class="fa-solid fa-arrow-right" style="color: var(--text-light); font-size: 0.8rem;"></i>
      </div>
    `).join('');
    dropdown.style.display = 'block';
  }

  renderHomeSections() {
    // 1. Damha e Condomínios
    const damhaProps = this.properties.filter(p => 
      p.category === 'condominio' || p.neighborhood.toLowerCase().includes('damha') || p.neighborhood.toLowerCase().includes('flamboyant')
    );
    this.renderRow('damhaRow', damhaProps);

    // 2. Casas à Venda
    const casasVenda = this.properties.filter(p => p.type === 'casa' && p.purpose === 'venda');
    this.renderRow('vendasRow', casasVenda);

    // 3. Apartamentos
    const aptos = this.properties.filter(p => p.type === 'apartamento');
    this.renderRow('apartamentosRow', aptos);

    // 4. Aluguel
    const aluguelProps = this.properties.filter(p => p.purpose === 'aluguel' || p.isRent);
    this.renderRow('aluguelRow', aluguelProps);

    // 5. Lançamentos
    this.renderLancamentos('lancamentosRow');
  }

  renderRow(containerId, list) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!list || list.length === 0) {
      el.innerHTML = `<p style="color: var(--text-muted); padding: 1rem;">Nenhum imóvel nesta categoria no momento.</p>`;
      return;
    }
    el.innerHTML = list.map(p => this.createPropertyCardHtml(p)).join('');
  }

  renderLancamentos(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const lancamentos = this.data.developments || [];
    el.innerHTML = lancamentos.map(d => `
      <div class="dev-card" onclick="window.location.href='https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=Ol%C3%A1,%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20lan%C3%A7amento%20${encodeURIComponent(d.title)}.'">
        <img src="${d.image}" alt="${d.title}" class="dev-bg" />
        <div class="dev-overlay"></div>
        <div class="dev-content">
          <span class="dev-badge">${d.badge}</span>
          <h3 class="dev-title">${d.title}</h3>
          <p class="dev-subtitle"><i class="fa-solid fa-location-dot"></i> ${d.location}</p>
          <div class="dev-highlights">
            ${d.highlights.map(h => `<span class="dev-tag">${h}</span>`).join('')}
          </div>
          <div class="dev-price-btn">
            <span class="dev-price-val">${d.priceFrom}</span>
            <span class="btn-card-details" style="background: #25D366; color: #fff; padding: 0.5rem 1rem; border-radius: var(--radius-full);">
              <i class="fa-brands fa-whatsapp"></i> Consultar
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }

  createPropertyCardHtml(p) {
    const isFav = this.favorites.includes(p.id);
    const mainImg = p.images && p.images.length > 0 ? p.images[0] : 'https://meridional.imb.br/meridional.png';
    const photosCount = p.images ? p.images.length : 1;
    const priceDisplay = p.purpose === 'aluguel' 
      ? `${this.formatCurrency(p.rentalPrice || p.price)}/mês` 
      : this.formatCurrency(p.price);

    const whatsappMsg = `Ol%C3%A1,%20tenho%20interesse%20no%20im%C3%B3vel%20${encodeURIComponent(p.title)}%20(C%C3%B3digo:%20${p.code})%20anunciado%20por%20${encodeURIComponent(priceDisplay)}.%20Gostaria%20de%20informa%C3%A7%C3%B5es.`;

    return `
      <div class="property-card-horizontal" onclick="window.location.href='imovel.html?id=${p.code}'">
        <div class="card-image-wrap">
          <img src="${mainImg}" alt="${p.title}" class="card-image" loading="lazy" />
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
          <span class="card-purpose-badge">${p.purpose === 'aluguel' ? 'Locação' : 'Venda'}</span>
          
          <button type="button" class="card-favorite-btn ${isFav ? 'favorited' : ''}" data-id="${p.id}" onclick="window.meridionalApp.toggleFavorite('${p.id}', event)" title="Favoritar" aria-label="Favoritar">
            <i class="fa-solid fa-heart"></i>
          </button>

          <span style="position: absolute; bottom: 0.75rem; left: 0.85rem; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: var(--radius-xs); z-index: 3;">
            <i class="fa-solid fa-camera"></i> ${photosCount} fotos
          </span>
        </div>

        <div class="card-content">
          <div class="card-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${p.neighborhood} — ${p.city || 'Uberaba'}</span>
          </div>

          <h3 class="card-title">${p.title}</h3>

          <div class="card-price-row">
            <span class="card-price">${priceDisplay}</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 0.15rem 0.45rem; border-radius: 4px;">${p.code}</span>
          </div>

          <div class="card-specs">
            <div class="spec-item">
              <i class="fa-solid fa-bed"></i>
              <span class="spec-value">${p.bedrooms || 0}</span>
              <span class="spec-label">Quartos</span>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-bath"></i>
              <span class="spec-value">${p.bathrooms || 0}</span>
              <span class="spec-label">Banh.</span>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-car"></i>
              <span class="spec-value">${p.parkingSpots || 0}</span>
              <span class="spec-label">Vagas</span>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-ruler-combined"></i>
              <span class="spec-value">${p.area || p.builtArea || 0}m²</span>
              <span class="spec-label">Área</span>
            </div>
          </div>

          <div class="card-actions" onclick="event.stopPropagation()">
            <a href="imovel.html?id=${p.code}" class="btn-card-details">
              Ver Detalhes
            </a>
            <a href="https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${whatsappMsg}" target="_blank" class="btn-card-whatsapp" title="Falar no WhatsApp" aria-label="Chamar WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  scrollRow(containerId, delta) {
    const el = document.getElementById(containerId);
    if (el) el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  // =========================================================================
  // DETALHES DO IMÓVEL (imovel.html)
  // =========================================================================
  renderPropertyDetailPage(codeOrId) {
    const container = document.getElementById('propertyDetailContainer');
    if (!container) return;

    if (!codeOrId) codeOrId = 'ME-3277';
    const cleanQuery = codeOrId.toString().toLowerCase().trim().replace('me-', '').replace('me', '');

    const prop = this.properties.find(p => {
      const pCode = (p.code || '').toLowerCase().trim();
      const pId = (p.id || '').toString().toLowerCase().trim();
      const pCodeNum = pCode.replace('me-', '').replace('me', '');
      return pCode === codeOrId.toString().toLowerCase().trim() ||
             pId === codeOrId.toString().toLowerCase().trim() ||
             pCodeNum === cleanQuery ||
             pId === cleanQuery;
    }) || this.properties[0];

    if (!prop) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem;">
          <h2>Imóvel não encontrado</h2>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">O código informado não corresponde a um imóvel ativo.</p>
          <a href="imoveis.html" class="btn-search-submit" style="display: inline-flex;">Ver Catálogo Completo</a>
        </div>
      `;
      return;
    }

    // Atualiza título da página e breadcrumb
    document.title = `${prop.code} - ${prop.title} | Imobiliária Meridional`;
    const breadcrumb = document.getElementById('breadcrumbTitle');
    if (breadcrumb) breadcrumb.textContent = `${prop.code} (${prop.title})`;

    // Prepara dados de galeria
    this.lightboxImages = prop.images && prop.images.length > 0 ? prop.images : ['https://meridional.imb.br/meridional.png'];
    const mainImg = this.lightboxImages[0];
    const isFav = this.favorites.includes(prop.id);

    const priceDisplay = prop.purpose === 'aluguel'
      ? `${this.formatCurrency(prop.rentalPrice || prop.price)}/mês`
      : this.formatCurrency(prop.price);

    const whatsappMsg = `Ol%C3%A1!%20Estou%20vendo%20o%20im%C3%B3vel%20${encodeURIComponent(prop.title)}%20(C%C3%B3digo:%20${prop.code})%20por%20${encodeURIComponent(priceDisplay)}%20no%20site%20da%20Meridional%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20e%20agendar%20uma%20visita.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${whatsappMsg}`;

    // Atualiza Sticky Mobile Bar
    const stickyPriceVal = document.getElementById('stickyPriceVal');
    const stickyPriceLabel = document.getElementById('stickyPriceLabel');
    const stickyWhatsappBtn = document.getElementById('stickyWhatsappBtn');
    if (stickyPriceVal) stickyPriceVal.textContent = priceDisplay;
    if (stickyPriceLabel) stickyPriceLabel.textContent = prop.purpose === 'aluguel' ? 'Aluguel' : 'Valor de Venda';
    if (stickyWhatsappBtn) stickyWhatsappBtn.href = whatsappUrl;

    // Corretor especialista
    const broker = this.data.brokers?.[prop.neighborhood] || this.data.brokers?.default || {
      name: "Plantão de Vendas & Locação",
      role: "Especialista em Imóveis em Uberaba",
      phone: "(34) 9960-4600",
      creci: "CRECI 12.632",
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80"
    };

    container.innerHTML = `
      <div class="property-detail-layout">
        <!-- Coluna Esquerda: Fotos, Especificações e Descrição -->
        <div>
          <!-- Galeria de Fotos -->
          <div class="property-gallery-box">
            <div class="gallery-main-img-wrap" onclick="window.meridionalApp.openLightbox(0)">
              <img id="detailMainImage" src="${mainImg}" alt="${prop.title}" class="gallery-main-img" />
              <button type="button" class="gallery-btn-expand" onclick="event.stopPropagation(); window.meridionalApp.openLightbox(0)">
                <i class="fa-solid fa-expand"></i> Ver ${this.lightboxImages.length} fotos em tela cheia
              </button>
            </div>
            <div class="gallery-thumbs-row">
              ${this.lightboxImages.map((img, idx) => `
                <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" onclick="window.meridionalApp.selectDetailThumb('${img}', this, ${idx})">
                  <img src="${img}" alt="Foto ${idx + 1}" />
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Informações Principais do Imóvel -->
          <div class="property-info-card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
              <div class="property-code-badge" onclick="window.meridionalApp.copyPropertyCode('${prop.code}')" title="Clique para copiar o código">
                <i class="fa-solid fa-copy"></i> Código: <strong>${prop.code}</strong> (Copiar)
              </div>
              <button type="button" class="chip-btn" onclick="window.meridionalApp.toggleFavorite('${prop.id}', event)">
                <i class="fa-solid fa-heart" style="color: ${isFav ? '#EF4444' : 'var(--text-muted)'};"></i> ${isFav ? 'Imóvel Favoritado' : 'Salvar nos Favoritos'}
              </button>
            </div>

            <h1 class="property-main-title">${prop.title}</h1>
            <div class="property-location-tag">
              <i class="fa-solid fa-location-dot"></i>
              <span>${prop.address || prop.neighborhood}, Uberaba - MG</span>
            </div>

            <!-- Preço e Condomínio -->
            <div class="property-price-box">
              <div class="property-price-main">${priceDisplay}</div>
              <div class="property-fees-row">
                ${prop.condoFee ? `<span><i class="fa-solid fa-building"></i> Condomínio: R$ ${prop.condoFee}/mês</span>` : ''}
                ${prop.iptu ? `<span><i class="fa-solid fa-receipt"></i> IPTU: R$ ${prop.iptu}/ano</span>` : ''}
                <span><i class="fa-solid fa-shield-halved"></i> Documentação 100% Regular</span>
              </div>
            </div>

            <!-- Grid de Características -->
            <div class="property-specs-grid-lg">
              <div class="spec-box-item">
                <i class="fa-solid fa-bed"></i>
                <span class="spec-box-val">${prop.bedrooms || 0} Quartos</span>
                <span class="spec-box-lbl">${prop.suites ? `${prop.suites} Suíte(s)` : 'Sem suíte'}</span>
              </div>
              <div class="spec-box-item">
                <i class="fa-solid fa-bath"></i>
                <span class="spec-box-val">${prop.bathrooms || 0} Banheiros</span>
                <span class="spec-box-lbl">Completos</span>
              </div>
              <div class="spec-box-item">
                <i class="fa-solid fa-car"></i>
                <span class="spec-box-val">${prop.parkingSpots || 0} Vagas</span>
                <span class="spec-box-lbl">Garagem</span>
              </div>
              <div class="spec-box-item">
                <i class="fa-solid fa-ruler-combined"></i>
                <span class="spec-box-val">${prop.area || prop.builtArea || 0} m²</span>
                <span class="spec-box-lbl">Área Construída</span>
              </div>
            </div>

            <!-- Diferenciais & Comodidades -->
            <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem;">Diferenciais do Imóvel</h3>
            <div class="property-features-list">
              ${(prop.features || ["Excelente Localização", "Acabamento Nobre", "Segurança"]).map(f => `
                <div class="feature-pill-item">
                  <i class="fa-solid fa-circle-check"></i>
                  <span>${f}</span>
                </div>
              `).join('')}
            </div>

            <!-- Descrição Completa -->
            <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.75rem;">Sobre Este Imóvel</h3>
            <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.8; margin-bottom: 1.5rem; white-space: pre-line;">
              ${prop.description || 'Excelente imóvel em localização privilegiada em Uberaba - MG. Agende uma visita com nossos corretores credenciados para conhecer de perto todos os detalhes.'}
            </p>
          </div>
        </div>

        <!-- Coluna Direita: Contato Direto & Agendamento de Visita -->
        <div>
          <div class="agent-contact-card">
            <span class="section-tag" style="display: block; margin-bottom: 0.5rem;">Atendimento Exclusivo</span>
            <div class="agent-profile-row">
              <img src="${broker.photo}" alt="${broker.name}" class="agent-avatar" />
              <div>
                <h4 class="agent-name">${broker.name}</h4>
                <p class="agent-role">${broker.role}</p>
                <span class="agent-creci">${broker.creci}</span>
              </div>
            </div>

            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
              Tire dúvidas agora, receba a localização exata ou agende uma visita presencial para este imóvel.
            </p>

            <a href="${whatsappUrl}" target="_blank" class="btn-agent-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> Chamar Corretor no WhatsApp
            </a>

            <a href="tel:3433126702" class="btn-agent-call">
              <i class="fa-solid fa-phone"></i> Ligar para (34) 3312-6702
            </a>

            <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light); font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-clock" style="color: var(--primary);"></i>
              <span>Plantão disponível para atendimento hoje.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Renderiza Imóveis Relacionados
    this.renderRelatedProperties(prop);
  }

  selectDetailThumb(imgSrc, thumbEl, idx) {
    const main = document.getElementById('detailMainImage');
    if (main) main.src = imgSrc;
    document.querySelectorAll('.gallery-thumb-item').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  }

  copyPropertyCode(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.showToast(`Código ${code} copiado com sucesso!`);
      });
    } else {
      this.showToast(`Código do imóvel: ${code}`);
    }
  }

  renderRelatedProperties(currentProp) {
    const section = document.getElementById('relatedPropertiesSection');
    const grid = document.getElementById('relatedPropertiesGrid');
    if (!section || !grid) return;

    const related = this.properties.filter(p => 
      p.code !== currentProp.code && (p.neighborhood === currentProp.neighborhood || p.type === currentProp.type)
    ).slice(0, 4);

    if (related.length > 0) {
      section.style.display = 'block';
      grid.innerHTML = related.map(p => this.createPropertyCardHtml(p)).join('');
    } else {
      section.style.display = 'none';
    }
  }

  // --- Lightbox de Fotos Fullscreen ---
  openLightbox(index = 0) {
    const lb = document.getElementById('photoLightbox');
    if (!lb || !this.lightboxImages || this.lightboxImages.length === 0) return;
    this.lightboxCurrentIndex = index;
    this.updateLightboxImage();
    lb.classList.add('active');
  }

  closeLightbox() {
    const lb = document.getElementById('photoLightbox');
    if (lb) lb.classList.remove('active');
  }

  nextLightboxImage() {
    if (!this.lightboxImages || this.lightboxImages.length === 0) return;
    this.lightboxCurrentIndex = (this.lightboxCurrentIndex + 1) % this.lightboxImages.length;
    this.updateLightboxImage();
  }

  prevLightboxImage() {
    if (!this.lightboxImages || this.lightboxImages.length === 0) return;
    this.lightboxCurrentIndex = (this.lightboxCurrentIndex - 1 + this.lightboxImages.length) % this.lightboxImages.length;
    this.updateLightboxImage();
  }

  updateLightboxImage() {
    const imgEl = document.getElementById('lightboxImage');
    const counterEl = document.getElementById('lightboxCounter');
    if (imgEl && this.lightboxImages[this.lightboxCurrentIndex]) {
      imgEl.src = this.lightboxImages[this.lightboxCurrentIndex];
    }
    if (counterEl) {
      counterEl.textContent = `${this.lightboxCurrentIndex + 1} / ${this.lightboxImages.length}`;
    }
  }

  // =========================================================================
  // CATÁLOGO DE IMÓVEIS (imoveis.html)
  // =========================================================================
  initCatalogPage() {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const bairro = params.get('bairro') || 'todos';
    const tipo = params.get('tipo') || 'todos';
    const finalidade = params.get('finalidade') || 'todos';

    this.catalogFilter.keyword = q;
    this.catalogFilter.neighborhood = bairro;
    this.catalogFilter.type = tipo;
    this.catalogFilter.purpose = finalidade;

    const input = document.getElementById('catalogSearchInput');
    const neighSelect = document.getElementById('catalogNeighborhoodFilter');
    if (input && q) input.value = q;
    if (neighSelect && bairro !== 'todos') neighSelect.value = bairro;

    this.renderCatalogList();
  }

  setCatalogFilter(field, value) {
    this.triggerHaptic();
    if (field === 'tipo') {
      this.catalogFilter.type = value;
    } else if (field === 'finalidade') {
      this.catalogFilter.purpose = value;
    }
    this.renderCatalogList();
  }

  handleCatalogFilterChange() {
    const input = document.getElementById('catalogSearchInput');
    const neighSelect = document.getElementById('catalogNeighborhoodFilter');
    if (input) this.catalogFilter.keyword = input.value;
    if (neighSelect) this.catalogFilter.neighborhood = neighSelect.value;
    this.renderCatalogList();
  }

  handleCatalogSortChange() {
    const select = document.getElementById('catalogSortSelect');
    if (select) this.catalogFilter.sortBy = select.value;
    this.renderCatalogList();
  }

  resetCatalogFilters() {
    this.catalogFilter = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      keyword: '',
      sortBy: 'relevance'
    };
    const input = document.getElementById('catalogSearchInput');
    const neighSelect = document.getElementById('catalogNeighborhoodFilter');
    if (input) input.value = '';
    if (neighSelect) neighSelect.value = 'todos';
    this.renderCatalogList();
  }

  renderCatalogList() {
    const grid = document.getElementById('catalogPropertiesGrid');
    const emptyState = document.getElementById('catalogEmptyState');
    const countEl = document.getElementById('catalogResultsCount');
    if (!grid) return;

    let list = [...this.properties];

    // Filtro por Finalidade
    if (this.catalogFilter.purpose !== 'todos') {
      list = list.filter(p => p.purpose === this.catalogFilter.purpose);
    }

    // Filtro por Tipo
    if (this.catalogFilter.type !== 'todos') {
      if (this.catalogFilter.type === 'damha') {
        list = list.filter(p => p.neighborhood.toLowerCase().includes('damha') || p.category === 'condominio');
      } else {
        list = list.filter(p => p.type === this.catalogFilter.type);
      }
    }

    // Filtro por Bairro
    if (this.catalogFilter.neighborhood !== 'todos') {
      list = list.filter(p => p.neighborhood.toLowerCase().includes(this.catalogFilter.neighborhood.toLowerCase()));
    }

    // Filtro por Keyword / Código
    if (this.catalogFilter.keyword && this.catalogFilter.keyword.trim() !== '') {
      const clean = this.catalogFilter.keyword.toLowerCase().trim();
      list = list.filter(p => 
        p.code.toLowerCase().includes(clean) ||
        p.title.toLowerCase().includes(clean) ||
        p.neighborhood.toLowerCase().includes(clean) ||
        (p.description && p.description.toLowerCase().includes(clean))
      );
    }

    // Ordenação
    if (this.catalogFilter.sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.catalogFilter.sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.catalogFilter.sortBy === 'area_desc') {
      list.sort((a, b) => (b.area || 0) - (a.area || 0));
    }

    if (countEl) {
      countEl.textContent = `${list.length} ${list.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}`;
    }

    if (list.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      grid.style.display = 'grid';
      if (emptyState) emptyState.style.display = 'none';
      grid.innerHTML = list.map(p => this.createPropertyCardHtml(p)).join('');
    }
  }

  // =========================================================================
  // FAVORITOS (favoritos.html)
  // =========================================================================
  renderFavoritesPage() {
    const grid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('favoritesEmptyState');
    const actionsBar = document.getElementById('favoritesActionsBar');
    const countEl = document.getElementById('favoritesTotalCount');
    if (!grid) return;

    const favList = this.properties.filter(p => this.favorites.includes(p.id));

    if (favList.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      if (actionsBar) actionsBar.style.display = 'none';
    } else {
      grid.style.display = 'grid';
      if (emptyState) emptyState.style.display = 'none';
      if (actionsBar) actionsBar.style.display = 'flex';
      if (countEl) countEl.textContent = `${favList.length} ${favList.length === 1 ? 'imóvel salvo' : 'imóveis salvos'}`;
      grid.innerHTML = favList.map(p => this.createPropertyCardHtml(p)).join('');
    }
  }

  clearAllFavorites() {
    if (confirm('Deseja realmente limpar todos os imóveis salvos?')) {
      this.favorites = [];
      this.saveFavorites();
      this.renderFavoritesPage();
      this.showToast('Favoritos limpos');
    }
  }

  sendFavoritesToWhatsApp() {
    const favList = this.properties.filter(p => this.favorites.includes(p.id));
    if (favList.length === 0) return;

    let text = `Ol%C3%A1!%20Salvei%20os%20seguintes%20im%C3%B3veis%20no%20site%20da%20Meridional%20e%20gostaria%20de%20informa%C3%A7%C3%B5es:%0A`;
    favList.forEach((p, idx) => {
      text += `%0A${idx + 1}.%20${encodeURIComponent(p.title)}%20(C%C3%B3digo:%20${p.code})%20-%20${this.formatCurrency(p.price)}`;
    });

    window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${text}`, '_blank');
  }

  // =========================================================================
  // FAQ ACCORDION (Home)
  // =========================================================================
  renderFAQ() {
    const container = document.getElementById('faqAccordionContainer');
    if (!container) return;
    const faqs = this.data.faqs || [
      { q: "Como agendar uma visita a um imóvel?", a: "Você pode clicar no botão de WhatsApp em qualquer imóvel ou entrar em contato pelo telefone (34) 3312-6702. Nossos corretores acompanham você presencialmente no horário que for mais conveniente." },
      { q: "A Imobiliária Meridional realiza avaliação de imóveis para processos judiciais?", a: "Sim! Contamos com peritos avaliadores credenciados no CNAI (Cadastro Nacional de Avaliadores Imobiliários), emitindo laudos técnicos mercadológicos (PTAM) com validade judicial para inventários, partilhas e garantias." },
      { q: "Quais documentos são necessários para alugar um imóvel?", a: "Para pessoa física: RG, CPF, comprovante de renda atualizado e comprovante de residência. Trabalhamos com diversas modalidades de garantia locatícia rápidas e sem fiador." },
      { q: "Onde fica a sede física da Imobiliária Meridional?", a: "Nossa sede fica na Praça Dom Eduardo, 470 – Bairro Mercês, em Uberaba - MG. Atuamos com tradição e sede própria desde 1990." }
    ];

    container.innerHTML = faqs.map(f => `
      <div class="faq-item">
        <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
          <span>${f.q}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </div>
        <div class="faq-answer">${f.a}</div>
      </div>
    `).join('');
  }

  // --- Scroll to Top ---
  setupScrollToTop() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });
    btn.addEventListener('click', () => {
      this.triggerHaptic();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Toast Notification ---
  showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary);"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
