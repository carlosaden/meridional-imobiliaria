/**
 * Imobiliária Meridional - Core Application Controller (49 Melhorias Integradas)
 * PWA, Autocomplete, Comparador, Mapas, Agendamento, Ofertas, SAC/PRICE, FAQ e Analytics
 */

document.addEventListener('DOMContentLoaded', () => {
  window.meridionalApp = new MeridionalApp();
  window.meridionalApp.init();
});

class MeridionalApp {
  constructor() {
    this.data = window.MERIDIONAL_DATA;
    this.simulator = new window.MortgageSimulator();
    this.favorites = this.loadFavorites();
    this.recentSearches = this.loadRecentSearches();
    this.comparedProperties = [];
    this.mapInstance = null;
    this.mapInitialized = false;

    this.currentFilter = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      keyword: '',
      sortBy: 'relevance',
      activeSearch: false,
      onlyFavorites: false
    };
    this.currentTheme = localStorage.getItem('meridional_theme') || 'light';
  }

  init() {
    this.registerPWA();
    this.setupTheme();
    this.parseUrlParameters();
    this.renderAllHorizontalSections();
    this.renderRecentSearches();
    this.renderFAQ();
    this.setupEventListeners();
    this.setupSimulator();
    this.setupOwnerWizard();
    this.updateFavoritesCount();
    this.setupScrollToTop();
  }

  // --- 41. PWA Service Worker ---
  registerPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  // --- 4. Haptic Feedback ---
  triggerHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }
  }

  // --- 48. Analytics Event Tracking ---
  trackEvent(eventName, params = {}) {
    if (window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...params });
    }
  }

  // --- 6. Theme Management ---
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
    this.trackEvent('theme_change', { theme: this.currentTheme });
  }

  // --- 19. URL Search Parameters Sync ---
  parseUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const bairro = params.get('bairro');
    const tipo = params.get('tipo');
    const finalidade = params.get('finalidade');
    const busca = params.get('q');
    const codigo = params.get('codigo');

    if (codigo) {
      setTimeout(() => this.openPropertyModal(codigo), 400);
      return;
    }

    if (bairro || tipo || finalidade || busca) {
      if (bairro) this.currentFilter.neighborhood = bairro;
      if (tipo) this.currentFilter.type = tipo;
      if (finalidade) this.currentFilter.purpose = finalidade;
      if (busca) this.currentFilter.keyword = busca;
      setTimeout(() => this.executeSearch(true), 200);
    }
  }

  updateUrlParameters() {
    const params = new URLSearchParams();
    if (this.currentFilter.purpose !== 'todos') params.set('finalidade', this.currentFilter.purpose);
    if (this.currentFilter.type !== 'todos') params.set('tipo', this.currentFilter.type);
    if (this.currentFilter.neighborhood !== 'todos') params.set('bairro', this.currentFilter.neighborhood);
    if (this.currentFilter.keyword) params.set('q', this.currentFilter.keyword);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  // --- 16. Recent Searches Management ---
  loadRecentSearches() {
    try {
      return JSON.parse(localStorage.getItem('meridional_recent_searches')) || ["Damha", "Flamboyant", "Centro"];
    } catch {
      return ["Damha", "Flamboyant", "Centro"];
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
        <span class="recent-search-pill" onclick="window.meridionalApp.searchByTerm('${s}')">${s}</span>
      `).join('')}
    `;
  }

  searchByTerm(term) {
    this.triggerHaptic();
    const input = document.getElementById('searchKeywordInput');
    if (input) input.value = term;
    this.currentFilter.keyword = term;
    this.executeSearch(true);
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
    if (e) e.stopPropagation();
    this.triggerHaptic();
    const index = this.favorites.indexOf(propId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.showToast('Imóvel removido dos favoritos');
    } else {
      this.favorites.push(propId);
      this.showToast('Imóvel salvo nos favoritos! ❤️');
      this.trackEvent('favorite_add', { property_id: propId });
    }
    this.saveFavorites();
    this.renderAllHorizontalSections();
    if (this.currentFilter.activeSearch) {
      this.executeSearch(false);
    }
  }

  updateFavoritesCount() {
    const badges = document.querySelectorAll('.favorites-badge-count');
    badges.forEach(b => {
      b.textContent = this.favorites.length;
      b.style.display = this.favorites.length > 0 ? 'flex' : 'none';
    });
  }

  // --- 28. Property Comparator Engine ---
  toggleCompare(propId, e) {
    if (e) e.stopPropagation();
    this.triggerHaptic();
    const index = this.comparedProperties.indexOf(propId);
    if (index > -1) {
      this.comparedProperties.splice(index, 1);
      this.showToast('Imóvel removido da comparação');
    } else {
      if (this.comparedProperties.length >= 3) {
        this.showToast('Você pode comparar no máximo 3 imóveis por vez');
        return;
      }
      this.comparedProperties.push(propId);
      this.showToast('Imóvel adicionado para comparar!');
    }
    this.updateComparatorBar();
    this.renderAllHorizontalSections();
    if (this.currentFilter.activeSearch) this.executeSearch(false);
  }

  updateComparatorBar() {
    const bar = document.getElementById('comparatorBar');
    const count = document.getElementById('comparatorCount');
    if (!bar || !count) return;

    if (this.comparedProperties.length > 0) {
      bar.style.display = 'flex';
      count.textContent = `${this.comparedProperties.length} ${this.comparedProperties.length === 1 ? 'imóvel selecionado' : 'imóveis selecionados'}`;
    } else {
      bar.style.display = 'none';
    }
  }

  openCompareModal() {
    const modal = document.getElementById('compareModal');
    const content = document.getElementById('compareModalContent');
    if (!modal || !content || this.comparedProperties.length === 0) return;

    const props = this.data.properties.filter(p => this.comparedProperties.includes(p.id));

    content.innerHTML = `
      <div style="padding: 1.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1.25rem;">Comparador de Imóveis</h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; min-width: 600px; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-light);">
                <th style="padding: 0.75rem; color: var(--text-muted);">Característica</th>
                ${props.map(p => `
                  <th style="padding: 0.75rem; width: ${100 / props.length}%;">
                    <img src="${p.images[0]}" style="width: 100%; height: 110px; object-fit: cover; border-radius: var(--radius-sm); margin-bottom: 0.5rem;" />
                    <span style="font-size: 0.95rem; font-weight: 700; display: block;">${p.title}</span>
                    <span style="font-size: 0.8rem; color: var(--primary); font-weight: 800;">${p.code}</span>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-weight: 700;">Valor</td>
                ${props.map(p => `<td style="padding: 0.75rem; font-weight: 800; color: var(--primary);">R$ ${(p.purpose === 'aluguel' ? p.rentalPrice : p.price).toLocaleString('pt-BR')}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-weight: 700;">Bairro</td>
                ${props.map(p => `<td style="padding: 0.75rem;">${p.neighborhood}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-weight: 700;">Área Total</td>
                ${props.map(p => `<td style="padding: 0.75rem;">${p.area} m²</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-weight: 700;">Dormitórios (Suítes)</td>
                ${props.map(p => `<td style="padding: 0.75rem;">${p.bedrooms} (${p.suites} suítes)</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-weight: 700;">Vagas Garagem</td>
                ${props.map(p => `<td style="padding: 0.75rem;">${p.parkingSpots}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 0.75rem; font-weight: 700;">Condomínio / IPTU</td>
                ${props.map(p => `<td style="padding: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">Cond: R$ ${p.condoFee || 0} | IPTU: R$ ${p.iptu || 0}</td>`).join('')}
              </tr>
              <tr>
                <td style="padding: 0.75rem; font-weight: 700;">Ação</td>
                ${props.map(p => `
                  <td style="padding: 0.75rem;">
                    <a href="${this.getWhatsAppLink(p)}" target="_blank" class="btn-card-details" style="display: block; background: #25D366; color: #fff; text-align: center; padding: 0.5rem;">
                      WhatsApp
                    </a>
                  </td>
                `).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // --- Horizontal Scroll Helper ---
  scrollRow(containerId, direction) {
    this.triggerHaptic();
    const container = document.getElementById(containerId);
    if (!container) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  // --- Property Card Generator with Dot Indicators and Compare Button ---
  renderPropertyCard(prop, isHorizontal = true) {
    const isFav = this.favorites.includes(prop.id);
    const isCompared = this.comparedProperties.includes(prop.id);
    const priceFormatted = prop.purpose === 'aluguel' 
      ? `R$ ${prop.rentalPrice.toLocaleString('pt-BR')}` 
      : `R$ ${prop.price.toLocaleString('pt-BR')}`;
    const period = prop.purpose === 'aluguel' ? '/mês' : '';
    const cardClass = isHorizontal ? 'property-card-horizontal' : 'property-card';
    
    return `
      <article class="${cardClass}" data-id="${prop.id}">
        <div class="card-image-wrap">
          <img src="${prop.images[0]}" alt="${prop.title}" class="card-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'" />
          
          <!-- Dots pagination indicator -->
          <div class="card-image-dots">
            ${prop.images.map((_, i) => `<span class="card-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
          </div>

          ${prop.badge ? `<span class="card-badge">${prop.badge}</span>` : ''}
          <span class="card-purpose-badge">${prop.purpose.toUpperCase()}</span>
          <button class="card-favorite-btn ${isFav ? 'favorited' : ''}" onclick="window.meridionalApp.toggleFavorite('${prop.id}', event)" title="Favoritar Imóvel" aria-label="Favoritar">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>

        <div class="card-content">
          <div class="card-location">
            <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i>
            <span>${prop.neighborhood}, ${prop.city}</span>
          </div>

          <h3 class="card-title" title="${prop.title}">${prop.title}</h3>

          <div class="card-price-row">
            <div>
              <span class="card-price">${priceFormatted}</span>
              <span class="card-price-period">${period}</span>
            </div>
            ${prop.viewsCount ? `<span class="card-views-badge"><i class="fa-solid fa-eye"></i> ${prop.viewsCount} hoje</span>` : ''}
          </div>

          <div class="card-specs">
            <div class="spec-item">
              <i class="fa-solid fa-ruler-combined"></i>
              <span class="spec-value">${prop.area} m²</span>
              <span class="spec-label">Área</span>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-bed"></i>
              <span class="spec-value">${prop.bedrooms || '-'}</span>
              <span class="spec-label">Quartos</span>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-bath"></i>
              <span class="spec-value">${prop.bathrooms || '-'}</span>
              <span class="spec-label">Banh.</span>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-car"></i>
              <span class="spec-value">${prop.parkingSpots || '-'}</span>
              <span class="spec-label">Vagas</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-card-details" onclick="window.meridionalApp.openPropertyModal('${prop.id}')">
              Ver Detalhes
            </button>
            <button class="btn-card-compare ${isCompared ? 'active' : ''}" onclick="window.meridionalApp.toggleCompare('${prop.id}', event)" title="Comparar imóvel">
              <i class="fa-solid fa-code-compare"></i>
            </button>
            <a href="${this.getWhatsAppLink(prop)}" target="_blank" class="btn-card-whatsapp" title="Falar no WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // --- Render All Horizontal Lists ---
  renderAllHorizontalSections() {
    const vendaContainer = document.getElementById('vendaHorizontalContainer');
    if (vendaContainer) {
      const vendaProps = this.data.properties.filter(p => p.purpose === 'venda');
      vendaContainer.innerHTML = vendaProps.map(p => this.renderPropertyCard(p, true)).join('');
    }

    const aluguelContainer = document.getElementById('aluguelHorizontalContainer');
    if (aluguelContainer) {
      const aluguelProps = this.data.properties.filter(p => p.purpose === 'aluguel');
      aluguelContainer.innerHTML = aluguelProps.map(p => this.renderPropertyCard(p, true)).join('');
    }

    const condominiosContainer = document.getElementById('condominiosHorizontalContainer');
    if (condominiosContainer) {
      const condoProps = this.data.properties.filter(p => p.category === 'condominio' || p.neighborhood.toLowerCase().includes('damha') || p.neighborhood.toLowerCase().includes('flamboyant'));
      condominiosContainer.innerHTML = condoProps.map(p => this.renderPropertyCard(p, true)).join('');
    }

    const comerciaisContainer = document.getElementById('comerciaisHorizontalContainer');
    if (comerciaisContainer) {
      const comProps = this.data.properties.filter(p => p.type === 'comercial' || p.category === 'galpao');
      comerciaisContainer.innerHTML = comProps.map(p => this.renderPropertyCard(p, true)).join('');
    }

    const devContainer = document.getElementById('lancamentosHorizontalContainer');
    if (devContainer) {
      devContainer.innerHTML = this.data.developments.map(dev => `
        <div class="dev-card">
          <img src="${dev.banner}" alt="${dev.title}" class="dev-bg" onerror="this.src='https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'" />
          <div class="dev-overlay"></div>
          <div class="dev-content">
            <span class="dev-badge">${dev.badge}</span>
            <h3 class="dev-title">${dev.title}</h3>
            <p class="dev-subtitle">${dev.type} • ${dev.neighborhood}</p>
            <div class="dev-highlights">
              ${dev.highlights.slice(0, 3).map(h => `<span class="dev-tag">${h}</span>`).join('')}
            </div>
            <div class="dev-price-btn">
              <div>
                <span style="font-size: 0.72rem; opacity: 0.8; display: block;">A partir de</span>
                <span class="dev-price-val">R$ ${dev.priceFrom.toLocaleString('pt-BR')}</span>
              </div>
              <a href="https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20lan%C3%A7amento%20${encodeURIComponent(dev.title)}%20em%20Uberaba." target="_blank" class="btn-card-details" style="background: var(--primary); padding: 0.5rem 1rem; width: auto; flex: initial;">
                Quero Conhecer <i class="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
      `).join('');
    }

    const neighContainer = document.getElementById('neighborhoodsHorizontalContainer');
    if (neighContainer) {
      neighContainer.innerHTML = this.data.neighborhoods.map(n => `
        <div class="property-card-horizontal" style="padding: 1.25rem; cursor: pointer; flex: 0 0 260px;" onclick="window.meridionalApp.filterByNeighborhood('${n.name}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <span class="card-badge" style="position: static;">${n.tag}</span>
            <span style="font-size: 0.82rem; font-weight: 800; color: var(--primary);">${n.listings}+ imóveis</span>
          </div>
          <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.35rem;">${n.name}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">${n.desc}</p>
        </div>
      `).join('');
    }
  }

  // --- 40. Interactive FAQ Accordion ---
  renderFAQ() {
    const container = document.getElementById('faqContainer');
    if (!container || !this.data.faq) return;

    container.innerHTML = this.data.faq.map((item, idx) => `
      <div class="faq-item ${idx === 0 ? 'active' : ''}" onclick="this.classList.toggle('active')">
        <div class="faq-question">
          <span>${item.question}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </div>
        <div class="faq-answer">
          <p>${item.answer}</p>
        </div>
      </div>
    `).join('');
  }

  // --- 9. Interactive Map View with Leaflet ---
  toggleMapView() {
    this.triggerHaptic();
    const mapSection = document.getElementById('mapViewSection');
    const btn = document.getElementById('toggleMapBtn');
    if (!mapSection || !btn) return;

    if (mapSection.style.display === 'none' || !mapSection.style.display) {
      mapSection.style.display = 'block';
      btn.innerHTML = '<i class="fa-solid fa-list"></i> Ver em Lista';
      this.initLeafletMap();
      mapSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      mapSection.style.display = 'none';
      btn.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Ver no Mapa';
    }
  }

  initLeafletMap() {
    if (this.mapInitialized || !window.L) return;
    const mapEl = document.getElementById('mapContainer');
    if (!mapEl) return;

    // Center in Uberaba - MG
    this.mapInstance = L.map('mapContainer').setView([-19.7470, -47.9330], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.mapInstance);

    this.data.properties.forEach(p => {
      if (p.lat && p.lng) {
        const marker = L.marker([p.lat, p.lng]).addTo(this.mapInstance);
        const price = p.purpose === 'aluguel' ? `R$ ${p.rentalPrice.toLocaleString('pt-BR')}/mês` : `R$ ${p.price.toLocaleString('pt-BR')}`;
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <img src="${p.images[0]}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px;" />
            <h4 style="font-size: 13px; font-weight: bold; margin: 4px 0;">${p.title}</h4>
            <span style="color: #FF7A00; font-weight: bold; font-size: 14px;">${price}</span><br />
            <button onclick="window.meridionalApp.openPropertyModal('${p.id}')" style="background: #64A30A; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-top: 5px; cursor: pointer; width: 100%;">Ver Detalhes</button>
          </div>
        `);
      }
    });

    this.mapInitialized = true;
  }

  // --- 11. Autocomplete Logic ---
  handleAutocomplete(query) {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (!dropdown) return;

    if (!query || query.trim().length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    const q = query.toLowerCase().trim();
    const suggestions = [];

    // Search by Neighborhoods
    this.data.neighborhoods.forEach(n => {
      if (n.name.toLowerCase().includes(q)) {
        suggestions.push({ label: `Bairro: ${n.name}`, value: n.name, type: 'bairro' });
      }
    });

    // Search by Properties / Codes
    this.data.properties.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) {
        suggestions.push({ label: `${p.code} - ${p.title}`, value: p.code, id: p.id, type: 'imovel' });
      }
    });

    if (suggestions.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = suggestions.slice(0, 6).map(s => `
      <div class="autocomplete-item" onclick="window.meridionalApp.selectAutocomplete('${s.type}', '${s.value}', '${s.id || ''}')">
        <span><i class="fa-solid ${s.type === 'bairro' ? 'fa-location-dot' : 'fa-house'}"></i> ${s.label}</span>
        <span style="font-size: 0.72rem; opacity: 0.6;">Selecionar</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';
  }

  selectAutocomplete(type, value, id) {
    const dropdown = document.getElementById('searchAutocompleteDropdown');
    if (dropdown) dropdown.style.display = 'none';

    if (type === 'imovel' && id) {
      this.openPropertyModal(id);
    } else {
      this.searchByTerm(value);
    }
  }

  // --- Search Execution ---
  executeSearch(shouldScroll = true) {
    this.currentFilter.activeSearch = true;
    this.updateUrlParameters();
    if (this.currentFilter.keyword) this.saveRecentSearch(this.currentFilter.keyword);

    const resultsSection = document.getElementById('searchResultsSection');
    const resultsGrid = document.getElementById('searchResultsGrid');
    const resultsCount = document.getElementById('searchResultsCount');

    if (!resultsSection || !resultsGrid) return;

    let filtered = this.data.properties.filter(p => {
      // 1. Purpose
      if (this.currentFilter.purpose !== 'todos' && p.purpose !== this.currentFilter.purpose) return false;

      // 2. Type
      if (this.currentFilter.type !== 'todos') {
        const t = this.currentFilter.type.toLowerCase();
        const pType = (p.type || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        if (pType !== t && pCat !== t) return false;
      }

      // 3. Neighborhood
      if (this.currentFilter.neighborhood !== 'todos') {
        const targetNeigh = this.currentFilter.neighborhood.toLowerCase();
        const pNeigh = p.neighborhood.toLowerCase();
        if (!pNeigh.includes(targetNeigh) && !targetNeigh.includes(pNeigh)) return false;
      }

      // 4. Keyword / Code
      if (this.currentFilter.keyword && this.currentFilter.keyword.trim() !== '') {
        const kw = this.currentFilter.keyword.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(kw);
        const matchCode = p.code.toLowerCase().includes(kw) || p.id.includes(kw);
        const matchNeigh = p.neighborhood.toLowerCase().includes(kw);
        const matchDesc = p.description.toLowerCase().includes(kw);
        if (!matchTitle && !matchCode && !matchNeigh && !matchDesc) return false;
      }

      // 5. Only Favorites
      if (this.currentFilter.onlyFavorites) {
        if (!this.favorites.includes(p.id)) return false;
      }

      return true;
    });

    // 14. Sorting
    if (this.currentFilter.sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.purpose === 'aluguel' ? a.rentalPrice : a.price) - (b.purpose === 'aluguel' ? b.rentalPrice : b.price));
    } else if (this.currentFilter.sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.purpose === 'aluguel' ? b.rentalPrice : b.price) - (a.purpose === 'aluguel' ? a.rentalPrice : a.price));
    } else if (this.currentFilter.sortBy === 'area-desc') {
      filtered.sort((a, b) => b.area - a.area);
    }

    resultsSection.style.display = 'block';
    resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`;

    if (filtered.length === 0) {
      resultsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4; color: var(--primary);"></i>
          <h3 style="font-size: 1.35rem; color: var(--text-main);">Nenhum imóvel correspondeu aos seus critérios</h3>
          <p style="margin-top: 0.5rem; font-size: 0.95rem;">Experimente selecionar outro bairro ou buscar por termos mais amplos.</p>
          <button class="btn-search-submit" style="margin: 1.5rem auto 0 auto; width: auto; padding: 0 1.5rem;" onclick="window.meridionalApp.resetFilters()">
            Ver Todos os Imóveis
          </button>
        </div>
      `;
    } else {
      resultsGrid.innerHTML = filtered.map(p => this.renderPropertyCard(p, false)).join('');
    }

    if (shouldScroll) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this.trackEvent('search_performed', { count: filtered.length, keyword: this.currentFilter.keyword });
  }

  setPurposeFilter(purpose) {
    this.triggerHaptic();
    this.currentFilter.purpose = purpose;
    this.currentFilter.onlyFavorites = false;
    document.querySelectorAll('.search-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-purpose') === purpose);
    });
    this.executeSearch(true);
  }

  setCategoryChip(category) {
    this.triggerHaptic();
    this.currentFilter.type = category;
    this.currentFilter.onlyFavorites = false;
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });
    this.executeSearch(true);
  }

  filterByNeighborhood(neighborhood) {
    this.triggerHaptic();
    this.currentFilter.neighborhood = neighborhood;
    const select = document.getElementById('searchNeighborhoodSelect');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.toLowerCase().includes(neighborhood.toLowerCase())) {
          select.selectedIndex = i;
          break;
        }
      }
    }
    this.executeSearch(true);
  }

  showFavoritesOnly() {
    this.triggerHaptic();
    this.currentFilter.onlyFavorites = true;
    this.executeSearch(true);
  }

  setSortBy(val) {
    this.currentFilter.sortBy = val;
    this.executeSearch(false);
  }

  resetFilters() {
    this.triggerHaptic();
    this.currentFilter = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      keyword: '',
      sortBy: 'relevance',
      activeSearch: false,
      onlyFavorites: false
    };

    const searchInput = document.getElementById('searchKeywordInput');
    if (searchInput) searchInput.value = '';

    const neighSelect = document.getElementById('searchNeighborhoodSelect');
    if (neighSelect) neighSelect.value = 'todos';

    const typeSelect = document.getElementById('searchTypeSelect');
    if (typeSelect) typeSelect.value = 'todos';

    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    const firstChip = document.querySelector('.chip-btn[data-category="todos"]');
    if (firstChip) firstChip.classList.add('active');
    
    document.querySelectorAll('.search-tab-btn').forEach(b => b.classList.remove('active'));
    const firstTab = document.querySelector('.search-tab-btn[data-purpose="todos"]');
    if (firstTab) firstTab.classList.add('active');

    const resultsSection = document.getElementById('searchResultsSection');
    if (resultsSection) resultsSection.style.display = 'none';

    this.updateUrlParameters();
    this.showToast('Filtros limpos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Modals & Property Details (Complete 49-improvement version) ---
  openPropertyModal(propId) {
    this.triggerHaptic();
    const prop = this.data.properties.find(p => p.id === propId || p.code === propId);
    if (!prop) return;

    const modal = document.getElementById('propertyDetailModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    const priceFormatted = prop.purpose === 'aluguel' 
      ? `R$ ${prop.rentalPrice.toLocaleString('pt-BR')}/mês` 
      : `R$ ${prop.price.toLocaleString('pt-BR')}`;

    const totalMonthlyCost = (prop.purpose === 'aluguel' ? prop.rentalPrice : (prop.price * 0.009)) + (prop.condoFee || 0) + ((prop.iptu || 0) / 12);

    // Similar properties
    const similar = this.data.properties.filter(p => p.id !== prop.id && (p.neighborhood === prop.neighborhood || p.type === prop.type)).slice(0, 2);

    content.innerHTML = `
      <div style="position: relative;">
        <!-- Main Image -->
        <div style="position: relative; aspect-ratio: 16/9; overflow: hidden; background: #000;">
          <img id="modalMainImg" src="${prop.images[0]}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'" />
          <span class="card-badge" style="position: absolute; top: 1rem; left: 1rem;">${prop.badge || prop.type.toUpperCase()}</span>
          <span class="card-purpose-badge" style="position: absolute; top: 1rem; right: 4.5rem;">${prop.purpose.toUpperCase()}</span>
        </div>
        
        <!-- Thumbnails -->
        <div style="display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem; overflow-x: auto; background: var(--bg-card-subtle);">
          ${prop.images.map((img, idx) => `
            <img src="${img}" style="width: 70px; height: 50px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--primary)' : 'transparent'};" onclick="document.getElementById('modalMainImg').src='${img}'" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'" />
          `).join('')}
        </div>
      </div>

      <div style="padding: 1.5rem;">
        <!-- Header & Price -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <div>
            <span style="font-size: 0.85rem; font-weight: 800; color: var(--primary);">Código: ${prop.code}</span>
            <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.25rem;">${prop.title}</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
              <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> ${prop.address}, ${prop.neighborhood}, ${prop.city} - ${prop.state}
            </p>
          </div>
          <div>
            <span style="font-size: 1.65rem; font-weight: 800; color: var(--primary); display: block;">${priceFormatted}</span>
            ${prop.condoFee ? `<span style="font-size: 0.8rem; color: var(--text-muted);">Condomínio: R$ ${prop.condoFee} | IPTU: R$ ${prop.iptu}</span>` : ''}
          </div>
        </div>

        <!-- 22. Total Monthly Cost Breakdown & 29. Cap Rate -->
        <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Custo Mensal Estimado Total:</span>
            <span style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-left: 0.35rem;">R$ ${Math.round(totalMonthlyCost).toLocaleString('pt-BR')}/mês</span>
          </div>
          ${prop.capRate ? `<span style="font-size: 0.82rem; font-weight: 800; color: var(--secondary); background: var(--secondary-light); padding: 0.2rem 0.5rem; border-radius: 4px;">Rentabilidade Estimada: ${prop.capRate}</span>` : ''}
        </div>

        <!-- Specs Row -->
        <div class="card-specs" style="margin: 1.25rem 0;">
          <div class="spec-item">
            <i class="fa-solid fa-ruler-combined"></i>
            <span class="spec-value">${prop.area} m²</span>
            <span class="spec-label">Área Total</span>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-bed"></i>
            <span class="spec-value">${prop.bedrooms} (${prop.suites} suítes)</span>
            <span class="spec-label">Dormitórios</span>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-bath"></i>
            <span class="spec-value">${prop.bathrooms}</span>
            <span class="spec-label">Banheiros</span>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-car"></i>
            <span class="spec-value">${prop.parkingSpots}</span>
            <span class="spec-label">Vagas</span>
          </div>
        </div>

        <!-- Description -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.4rem;">Descrição do Imóvel</h4>
          <p style="color: var(--text-main); font-size: 0.92rem; line-height: 1.6;">${prop.description}</p>
        </div>

        <!-- Features List -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.6rem;">Características & Diferenciais</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.45rem;">
            ${prop.features.map(f => `
              <div style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.88rem;">
                <i class="fa-solid fa-circle-check" style="color: var(--secondary);"></i>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 25. Walk Score Proximities Table -->
        ${prop.walkScore ? `
          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.6rem;">Proximidades em Uberaba</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              ${prop.walkScore.map(w => `
                <div style="background: var(--bg-card-subtle); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); font-size: 0.85rem;">
                  <strong>${w.name}:</strong> <span style="color: var(--text-muted);">${w.dist}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 26, 30, 33, 39 Quick Action Bar -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
          <button class="chip-btn" onclick="window.meridionalApp.openScheduleModal('${prop.id}')">
            <i class="fa-solid fa-calendar-check" style="color: var(--primary);"></i> Agendar Visita
          </button>
          <button class="chip-btn" onclick="window.meridionalApp.openOfferModal('${prop.id}')">
            <i class="fa-solid fa-tag" style="color: var(--secondary);"></i> Fazer Proposta
          </button>
          <button class="chip-btn" onclick="window.print()">
            <i class="fa-solid fa-file-pdf"></i> Imprimir Ficha PDF
          </button>
          <button class="chip-btn" onclick="window.meridionalApp.notifyPriceDrop('${prop.id}')">
            <i class="fa-solid fa-bell"></i> Avise-me se o Preço Baixar
          </button>
        </div>

        <!-- 20. Similar Properties -->
        ${similar.length > 0 ? `
          <div style="margin-bottom: 1rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.6rem;">Imóveis Similares que Você Pode Gostar</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              ${similar.map(s => `
                <div style="background: var(--bg-card-subtle); border-radius: var(--radius-sm); padding: 0.6rem; cursor: pointer; border: 1px solid var(--border-light);" onclick="window.meridionalApp.openPropertyModal('${s.id}')">
                  <span style="font-weight: 700; font-size: 0.85rem; display: block;">${s.title}</span>
                  <span style="color: var(--primary); font-weight: 800; font-size: 0.88rem;">R$ ${(s.purpose === 'aluguel' ? s.rentalPrice : s.price).toLocaleString('pt-BR')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- 5. Mobile Sticky Bottom Action Bar -->
      <div class="modal-sticky-bottom-bar">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Valor</span>
          <span style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${priceFormatted}</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="window.meridionalApp.openScheduleModal('${prop.id}')" class="btn-card-details" style="padding: 0.65rem 1rem; width: auto;">
            Agendar Visita
          </button>
          <a href="${this.getWhatsAppLink(prop)}" target="_blank" class="btn-header-cta" style="background: #25D366; padding: 0.65rem 1.15rem;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.trackEvent('property_view', { property_id: prop.id, code: prop.code });
  }

  closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  }

  // --- 33. Agendamento Online de Visitas ---
  openScheduleModal(propId) {
    const prop = this.data.properties.find(p => p.id === propId);
    const modal = document.getElementById('actionModal');
    const content = document.getElementById('actionModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="padding: 1.5rem;">
        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem;">Agendar Visita ao Imóvel</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem;">${prop ? prop.title + ' (' + prop.code + ')' : ''}</p>
        
        <form onsubmit="window.meridionalApp.submitSchedule(event, '${prop ? prop.code : ''}')" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Seu Nome:</label>
            <input type="text" id="schName" class="search-input" required placeholder="Nome completo" />
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">WhatsApp:</label>
            <input type="tel" id="schPhone" class="search-input" required placeholder="(34) 99999-9999" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Data Preferida:</label>
              <input type="date" id="schDate" class="search-input" required />
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Turno:</label>
              <select id="schShift" class="search-select">
                <option value="Manhã (09h - 12h)">Manhã (09h - 12h)</option>
                <option value="Tarde (14h - 18h)">Tarde (14h - 18h)</option>
                <option value="Sábado de Manhã">Sábado de Manhã</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn-search-submit" style="margin-top: 0.5rem;">
            <i class="fa-solid fa-calendar-check"></i> Confirmar Agendamento no WhatsApp
          </button>
        </form>
      </div>
    `;

    modal.classList.add('active');
  }

  submitSchedule(e, code) {
    e.preventDefault();
    const name = document.getElementById('schName').value;
    const phone = document.getElementById('schPhone').value;
    const date = document.getElementById('schDate').value;
    const shift = document.getElementById('schShift').value;

    const text = `Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20visita%20ao%20im%C3%B3vel%20${encodeURIComponent(code)}:%0A- Nome:%20${encodeURIComponent(name)}%0A- Telefone:%20${encodeURIComponent(phone)}%0A- Data:%20${encodeURIComponent(date)}%0A- Turno:%20${encodeURIComponent(shift)}`;
    
    this.showToast('Encaminhando agendamento para o corretor...');
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${text}`, '_blank');
      this.closeModal();
    }, 500);
  }

  // --- 30. Proposta Direta Online ---
  openOfferModal(propId) {
    const prop = this.data.properties.find(p => p.id === propId);
    const modal = document.getElementById('actionModal');
    const content = document.getElementById('actionModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="padding: 1.5rem;">
        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem;">Fazer Proposta / Oferta Online</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem;">${prop ? prop.title + ' (' + prop.code + ')' : ''}</p>
        
        <form onsubmit="window.meridionalApp.submitOffer(event, '${prop ? prop.code : ''}')" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Seu Nome:</label>
            <input type="text" id="offName" class="search-input" required placeholder="Nome completo" />
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Valor da sua Proposta (R$):</label>
            <input type="text" id="offValue" class="search-input" required placeholder="Ex: 850.000" />
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Forma de Pagamento Pretendida:</label>
            <select id="offPayment" class="search-select">
              <option value="À Vista com Recursos Próprios">À Vista</option>
              <option value="Financiamento Bancário Caixa">Financiamento Bancário</option>
              <option value="Entrada + Parcelamento">Entrada + Parcelamento</option>
              <option value="Permuta / Imóvel como parte">Permuta de Imóvel</option>
            </select>
          </div>
          <button type="submit" class="btn-search-submit" style="margin-top: 0.5rem; background: var(--secondary);">
            <i class="fa-solid fa-paper-plane"></i> Enviar Proposta para a Diretoria
          </button>
        </form>
      </div>
    `;

    modal.classList.add('active');
  }

  submitOffer(e, code) {
    e.preventDefault();
    const name = document.getElementById('offName').value;
    const value = document.getElementById('offValue').value;
    const payment = document.getElementById('offPayment').value;

    const text = `Ol%C3%A1!%20Gostaria%20de%20apresentar%20uma%20proposta%20para%20o%20im%C3%B3vel%20${encodeURIComponent(code)}:%0A- Proponente:%20${encodeURIComponent(name)}%0A- Valor%20Ofertado:%20R$%20${encodeURIComponent(value)}%0A- Condi%C3%A7%C3%A3o:%20${encodeURIComponent(payment)}`;
    
    this.showToast('Enviando proposta para a diretoria comercial...');
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${text}`, '_blank');
      this.closeModal();
    }, 500);
  }

  // --- 39. Alerta de Redução de Preço ---
  notifyPriceDrop(propId) {
    const prop = this.data.properties.find(p => p.id === propId);
    const text = `Ol%C3%A1!%20Gostaria%20de%20ser%20avisado(a)%20caso%20o%20im%C3%B3vel%20${encodeURIComponent(prop ? prop.code : '')}%20tenha%20redu%C3%A7%C3%A3o%20de%20pre%C3%A7o%20ou%20nova%20condi%C3%A7%C3%A3o.`;
    window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${text}`, '_blank');
  }

  // --- 31, 32, 37. Simulator Management ---
  setupSimulator() {
    const valSlider = document.getElementById('simPropertyValue');
    const downSlider = document.getElementById('simDownPayment');
    const fgtsInput = document.getElementById('simFgtsAmount');
    const termSelect = document.getElementById('simTermMonths');

    if (!valSlider || !downSlider || !termSelect) return;

    const updateCalc = () => {
      const propVal = parseFloat(valSlider.value);
      const downPercent = parseFloat(downSlider.value);
      const fgts = fgtsInput ? (parseFloat(fgtsInput.value) || 0) : 0;
      const downPayment = (propVal * downPercent) / 100;
      const term = parseInt(termSelect.value);

      document.getElementById('simPropValLabel').textContent = window.MortgageSimulator.formatCurrency(propVal);
      document.getElementById('simDownLabel').textContent = `${window.MortgageSimulator.formatCurrency(downPayment)} (${downPercent}%)`;

      const result = this.simulator.calculate({
        propertyValue: propVal,
        downPayment: downPayment,
        fgtsAmount: fgts,
        termMonths: term,
        annualRate: 0.098
      });

      // 31. SAC vs PRICE
      document.getElementById('simFirstInstallment').textContent = window.MortgageSimulator.formatCurrency(result.sac.firstInstallment);
      document.getElementById('simLastInstallment').textContent = window.MortgageSimulator.formatCurrency(result.sac.lastInstallment);
      document.getElementById('simPriceInstallment').textContent = window.MortgageSimulator.formatCurrency(result.price.installment);
      document.getElementById('simMinIncome').textContent = window.MortgageSimulator.formatCurrency(result.sac.minIncome);
      document.getElementById('simLoanAmount').textContent = window.MortgageSimulator.formatCurrency(result.loanAmount);

      // 37. Closing Costs (ITBI & Cartório)
      const closing = this.simulator.calculateClosingCosts(propVal);
      const itbiEl = document.getElementById('simClosingCosts');
      if (itbiEl) {
        itbiEl.textContent = `ITBI + Escritura Estimada: ${window.MortgageSimulator.formatCurrency(closing.total)}`;
      }

      const simWhatsappBtn = document.getElementById('simWhatsappShareBtn');
      if (simWhatsappBtn) {
        const msg = `Ol%C3%A1!%20Fiz%20uma%20simula%C3%A7%C3%A3o%20de%20financiamento%20no%20site%20da%20Meridional:%0A- Im%C3%B3vel:%20${window.MortgageSimulator.formatCurrency(propVal)}%0A- Entrada:%20${window.MortgageSimulator.formatCurrency(downPayment)}%0A- FGTS:%20${window.MortgageSimulator.formatCurrency(fgts)}%0A- Prazo:%20${term}%20meses%0A- 1%C2%AA Parcela (SAC):%20${window.MortgageSimulator.formatCurrency(result.sac.firstInstallment)}%0A- Parcela Fixa (PRICE):%20${window.MortgageSimulator.formatCurrency(result.price.installment)}%0AGostaria%20de%20aprovar%20meu%20cr%C3%A9dito!`;
        simWhatsappBtn.href = `https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${msg}`;
      }
    };

    valSlider.addEventListener('input', updateCalc);
    downSlider.addEventListener('input', updateCalc);
    if (fgtsInput) fgtsInput.addEventListener('input', updateCalc);
    termSelect.addEventListener('change', updateCalc);
    updateCalc();
  }

  // --- Owner Listing Wizard ---
  setupOwnerWizard() {
    const wizard = document.getElementById('ownerWizardForm');
    if (!wizard) return;

    wizard.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('wizOwnerName').value;
      const phone = document.getElementById('wizOwnerPhone').value;
      const neighborhood = document.getElementById('wizOwnerNeighborhood').value;
      const type = document.getElementById('wizOwnerType').value;
      const purpose = document.getElementById('wizOwnerPurpose').value;
      const price = document.getElementById('wizOwnerPrice').value;

      const text = `Ol%C3%A1!%20Quero%20cadastrar%20meu%20im%C3%B3vel%20na%20Meridional:%0A- Propriet%C3%A1rio:%20${encodeURIComponent(name)}%0A- Telefone:%20${encodeURIComponent(phone)}%0A- Finalidade:%20${encodeURIComponent(purpose)}%0A- Tipo:%20${encodeURIComponent(type)}%0A- Bairro:%20${encodeURIComponent(neighborhood)}%0A- Valor:%20R$%20${encodeURIComponent(price)}`;
      
      this.showToast('Encaminhando para o corretor no WhatsApp...');
      setTimeout(() => {
        window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${text}`, '_blank');
        wizard.reset();
      }, 600);
    });
  }

  // --- 7. Scroll to Top ---
  setupScrollToTop() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    });

    btn.addEventListener('click', () => {
      this.triggerHaptic();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- WhatsApp & Toast Utilities ---
  getWhatsAppLink(prop) {
    const text = `Ol%C3%A1,%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20im%C3%B3vel%20${encodeURIComponent(prop.title)}%20(C%C3%B3digo:%20${prop.code})%20anunciado%20no%20site.`;
    return `https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${text}`;
  }

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
    }, 3200);
  }

  setupEventListeners() {
    const searchForm = document.getElementById('mainSearchForm');
    const searchInput = document.getElementById('searchKeywordInput');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleAutocomplete(e.target.value);
      });
    }

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const kw = document.getElementById('searchKeywordInput').value;
        const neigh = document.getElementById('searchNeighborhoodSelect').value;
        const type = document.getElementById('searchTypeSelect').value;

        this.currentFilter.keyword = kw;
        this.currentFilter.neighborhood = neigh;
        this.currentFilter.type = type;
        this.executeSearch(true);
      });
    }

    // Modal Close
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
}
