/**
 * Imobiliária Meridional - Core Application Logic
 * Single Page App Controller, Responsive Interactive Filters, Modals & Integrations
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = new MeridionalApp();
  app.init();
});

class MeridionalApp {
  constructor() {
    this.data = window.MERIDIONAL_DATA;
    this.simulator = new window.MortgageSimulator();
    this.favorites = this.loadFavorites();
    this.currentFilter = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      maxPrice: Infinity,
      keyword: ''
    };
    this.currentTheme = localStorage.getItem('meridional_theme') || 'light';
  }

  init() {
    this.setupTheme();
    this.renderFeaturedProperties();
    this.renderDevelopments();
    this.renderNeighborhoods();
    this.renderBlogPosts();
    this.renderAllProperties();
    this.setupEventListeners();
    this.setupSimulator();
    this.setupOwnerWizard();
    this.updateFavoritesCount();
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
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('meridional_theme', this.currentTheme);
    this.setupTheme();
    this.showToast(`Modo ${this.currentTheme === 'dark' ? 'Escuro' : 'Claro'} ativado`);
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
    const index = this.favorites.indexOf(propId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.showToast('Imóvel removido dos favoritos');
    } else {
      this.favorites.push(propId);
      this.showToast('Imóvel salvo nos favoritos! ❤️');
    }
    this.saveFavorites();
    this.renderAllProperties();
    this.renderFeaturedProperties();
  }

  updateFavoritesCount() {
    const badges = document.querySelectorAll('.favorites-badge-count');
    badges.forEach(b => {
      b.textContent = this.favorites.length;
      b.style.display = this.favorites.length > 0 ? 'flex' : 'none';
    });
  }

  // --- Rendering Functions ---
  renderPropertyCard(prop) {
    const isFav = this.favorites.includes(prop.id);
    const priceFormatted = prop.purpose === 'aluguel' 
      ? `R$ ${prop.rentalPrice.toLocaleString('pt-BR')}` 
      : `R$ ${prop.price.toLocaleString('pt-BR')}`;
    const period = prop.purpose === 'aluguel' ? '/mês' : '';
    
    return `
      <article class="property-card" data-id="${prop.id}">
        <div class="card-image-wrap">
          <img src="${prop.images[0]}" alt="${prop.title}" class="card-image" loading="lazy" />
          ${prop.badge ? `<span class="card-badge">${prop.badge}</span>` : ''}
          <span class="card-purpose-badge">${prop.purpose.toUpperCase()}</span>
          <button class="card-favorite-btn ${isFav ? 'favorited' : ''}" onclick="window.meridionalApp.toggleFavorite('${prop.id}', event)" title="Favoritar Imóvel">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>

        <div class="card-content">
          <div class="card-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${prop.neighborhood}, ${prop.city}</span>
          </div>

          <h3 class="card-title">${prop.title}</h3>

          <div class="card-price-row">
            <span class="card-price">${priceFormatted}</span>
            <span class="card-price-period">${period}</span>
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
            <a href="${this.getWhatsAppLink(prop)}" target="_blank" class="btn-card-whatsapp" title="Falar com Corretor">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  renderFeaturedProperties() {
    const container = document.getElementById('featuredPropertiesContainer');
    if (!container) return;
    const featured = this.data.properties.filter(p => p.featured);
    container.innerHTML = featured.map(p => this.renderPropertyCard(p)).join('');
  }

  renderAllProperties() {
    const container = document.getElementById('catalogContainer');
    if (!container) return;

    let filtered = this.data.properties.filter(p => {
      // Filter by Purpose
      if (this.currentFilter.purpose !== 'todos' && p.purpose !== this.currentFilter.purpose) return false;
      // Filter by Type
      if (this.currentFilter.type !== 'todos' && p.type !== this.currentFilter.type && p.category !== this.currentFilter.type) return false;
      // Filter by Neighborhood
      if (this.currentFilter.neighborhood !== 'todos' && p.neighborhood.toLowerCase() !== this.currentFilter.neighborhood.toLowerCase()) return false;
      // Filter by Keyword
      if (this.currentFilter.keyword) {
        const kw = this.currentFilter.keyword.toLowerCase();
        const match = p.title.toLowerCase().includes(kw) || 
                      p.neighborhood.toLowerCase().includes(kw) || 
                      p.code.toLowerCase().includes(kw) ||
                      p.description.toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });

    // Check if viewing Favorites tab
    if (this.currentFilter.onlyFavorites) {
      filtered = filtered.filter(p => this.favorites.includes(p.id));
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>Nenhum imóvel encontrado com esses filtros</h3>
          <p style="margin-top: 0.5rem; font-size: 0.95rem;">Tente ajustar o bairro, faixa de preço ou categoria para ver mais opções.</p>
          <button class="btn-header-cta" style="margin: 1.5rem auto 0 auto;" onclick="window.meridionalApp.resetFilters()">
            Limpar Filtros
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => this.renderPropertyCard(p)).join('');
  }

  renderDevelopments() {
    const container = document.getElementById('developmentsContainer');
    if (!container) return;
    container.innerHTML = this.data.developments.map(dev => `
      <div class="dev-card">
        <img src="${dev.banner}" alt="${dev.title}" class="dev-bg" />
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
              <span style="font-size: 0.75rem; opacity: 0.8; display: block;">A partir de</span>
              <span class="dev-price-val">R$ ${dev.priceFrom.toLocaleString('pt-BR')}</span>
            </div>
            <a href="https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20lan%C3%A7amento%20${encodeURIComponent(dev.title)}%20em%20Uberaba." target="_blank" class="btn-header-cta" style="padding: 0.5rem 1rem;">
              Quero Conhecer <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderNeighborhoods() {
    const container = document.getElementById('neighborhoodsContainer');
    if (!container) return;
    container.innerHTML = this.data.neighborhoods.map(n => `
      <div class="property-card" style="padding: 1.5rem; cursor: pointer;" onclick="window.meridionalApp.filterByNeighborhood('${n.name}')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <span class="card-badge" style="position: static;">${n.tag}</span>
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">${n.listings}+ imóveis</span>
        </div>
        <h4 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.35rem;">${n.name}</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">${n.desc}</p>
      </div>
    `).join('');
  }

  renderBlogPosts() {
    const container = document.getElementById('blogContainer');
    if (!container) return;
    container.innerHTML = this.data.blogPosts.map(post => `
      <article class="property-card">
        <div class="card-image-wrap" style="aspect-ratio: 16/9;">
          <img src="${post.image}" alt="${post.title}" class="card-image" />
          <span class="card-badge">${post.category}</span>
        </div>
        <div class="card-content">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            <span>${post.date}</span> • <span>${post.readTime}</span>
          </div>
          <h4 style="font-size: 1.1rem; font-weight: 700; line-height: 1.4; margin-bottom: 0.75rem;">${post.title}</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">${post.summary}</p>
          <a href="https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=Ol%C3%A1!%20Li%20a%20mat%C3%A9ria%20'${encodeURIComponent(post.title)}'%20e%20gostaria%20de%20tirar%20d%C3%BAvidas." target="_blank" style="color: var(--primary); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
            Saber mais <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `).join('');
  }

  // --- Modals & Property Details ---
  openPropertyModal(propId) {
    const prop = this.data.properties.find(p => p.id === propId);
    if (!prop) return;

    const modal = document.getElementById('propertyDetailModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    const priceFormatted = prop.purpose === 'aluguel' 
      ? `R$ ${prop.rentalPrice.toLocaleString('pt-BR')}/mês` 
      : `R$ ${prop.price.toLocaleString('pt-BR')}`;

    content.innerHTML = `
      <div style="position: relative;">
        <!-- Image Slider / Gallery -->
        <div style="position: relative; aspect-ratio: 16/9; overflow: hidden; background: #000;">
          <img id="modalMainImg" src="${prop.images[0]}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <span class="card-badge" style="position: absolute; top: 1rem; left: 1rem;">${prop.badge || prop.type.toUpperCase()}</span>
          <span class="card-purpose-badge" style="position: absolute; top: 1rem; right: 4rem;">${prop.purpose.toUpperCase()}</span>
        </div>
        
        <!-- Thumbnails -->
        <div style="display: flex; gap: 0.5rem; padding: 0.75rem 1.5rem; overflow-x: auto; background: var(--bg-card-subtle);">
          ${prop.images.map((img, idx) => `
            <img src="${img}" style="width: 70px; height: 50px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--primary)' : 'transparent'};" onclick="document.getElementById('modalMainImg').src='${img}'" />
          `).join('')}
        </div>
      </div>

      <div style="padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">Código: ${prop.code}</span>
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 0.25rem;">${prop.title}</h2>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.25rem;">
              <i class="fa-solid fa-location-dot"></i> ${prop.address}, ${prop.neighborhood}, ${prop.city} - ${prop.state}
            </p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 1.75rem; font-weight: 800; color: var(--primary); display: block;">${priceFormatted}</span>
            ${prop.condoFee ? `<span style="font-size: 0.82rem; color: var(--text-muted);">Condomínio: R$ ${prop.condoFee} | IPTU: R$ ${prop.iptu}</span>` : ''}
          </div>
        </div>

        <!-- Specs Row -->
        <div class="card-specs" style="margin: 1.5rem 0;">
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
          <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">Sobre este imóvel</h4>
          <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.6;">${prop.description}</p>
        </div>

        <!-- Features List -->
        <div style="margin-bottom: 2rem;">
          <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem;">Diferenciais e Comodidades</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem;">
            ${prop.features.map(f => `
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-main);">
                <i class="fa-solid fa-circle-check" style="color: var(--primary);"></i>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quick Mortgage CTA & Direct Contact -->
        <div style="background: var(--bg-card-subtle); border-radius: var(--radius-lg); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid var(--border-light);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 700;">Interessou-se por este imóvel?</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Atendimento imediato de nossos corretores e peritos credenciados.</p>
            </div>
            <a href="${this.getWhatsAppLink(prop)}" target="_blank" class="btn-header-cta" style="background: #25D366; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
              <i class="fa-brands fa-whatsapp"></i> Falar no WhatsApp Agora
            </a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('propertyDetailModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- Simulator Management ---
  setupSimulator() {
    const valSlider = document.getElementById('simPropertyValue');
    const downSlider = document.getElementById('simDownPayment');
    const termSelect = document.getElementById('simTermMonths');

    if (!valSlider || !downSlider || !termSelect) return;

    const updateCalc = () => {
      const propVal = parseFloat(valSlider.value);
      const downPercent = parseFloat(downSlider.value);
      const downPayment = (propVal * downPercent) / 100;
      const term = parseInt(termSelect.value);

      document.getElementById('simPropValLabel').textContent = window.MortgageSimulator.formatCurrency(propVal);
      document.getElementById('simDownLabel').textContent = `${window.MortgageSimulator.formatCurrency(downPayment)} (${downPercent}%)`;

      const result = this.simulator.calculate({
        propertyValue: propVal,
        downPayment: downPayment,
        termMonths: term,
        annualRate: 0.098,
        system: 'SAC'
      });

      document.getElementById('simFirstInstallment').textContent = window.MortgageSimulator.formatCurrency(result.firstInstallment);
      document.getElementById('simLastInstallment').textContent = window.MortgageSimulator.formatCurrency(result.lastInstallment);
      document.getElementById('simMinIncome').textContent = window.MortgageSimulator.formatCurrency(result.minIncome);
      document.getElementById('simLoanAmount').textContent = window.MortgageSimulator.formatCurrency(result.loanAmount);

      const simWhatsappBtn = document.getElementById('simWhatsappShareBtn');
      if (simWhatsappBtn) {
        const msg = `Ol%C3%A1!%20Fiz%20uma%20simula%C3%A7%C3%A3o%20de%20financiamento%20no%20site%20da%20Meridional:%0A- Im%C3%B3vel:%20${window.MortgageSimulator.formatCurrency(propVal)}%0A- Entrada:%20${window.MortgageSimulator.formatCurrency(downPayment)}%0A- Prazo:%20${term}%20meses%0A- 1%C2%AA Parcela:%20${window.MortgageSimulator.formatCurrency(result.firstInstallment)}%0AGostaria%20de%20aprovar%20meu%20cr%C3%A9dito!`;
        simWhatsappBtn.href = `https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${msg}`;
      }
    };

    valSlider.addEventListener('input', updateCalc);
    downSlider.addEventListener('input', updateCalc);
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
      
      this.showToast('Redirecionando para o corretor de plantão no WhatsApp...');
      setTimeout(() => {
        window.open(`https://api.whatsapp.com/send?phone=${this.data.company.whatsappClean}&text=${text}`, '_blank');
        wizard.reset();
      }, 800);
    });
  }

  // --- Filtering & Search ---
  setPurposeFilter(purpose) {
    this.currentFilter.purpose = purpose;
    this.currentFilter.onlyFavorites = false;
    document.querySelectorAll('.search-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-purpose') === purpose);
    });
    this.renderAllProperties();
  }

  setCategoryChip(category) {
    this.currentFilter.type = category;
    this.currentFilter.onlyFavorites = false;
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });
    this.renderAllProperties();
  }

  filterByNeighborhood(neighborhood) {
    this.currentFilter.neighborhood = neighborhood;
    this.renderAllProperties();
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
    this.showToast(`Filtrando por: ${neighborhood}`);
  }

  resetFilters() {
    this.currentFilter = {
      purpose: 'todos',
      type: 'todos',
      neighborhood: 'todos',
      maxPrice: Infinity,
      keyword: '',
      onlyFavorites: false
    };
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    const firstChip = document.querySelector('.chip-btn[data-category="todos"]');
    if (firstChip) firstChip.classList.add('active');
    
    document.querySelectorAll('.search-tab-btn').forEach(b => b.classList.remove('active'));
    const firstTab = document.querySelector('.search-tab-btn[data-purpose="todos"]');
    if (firstTab) firstTab.classList.add('active');

    const searchInput = document.getElementById('searchKeywordInput');
    if (searchInput) searchInput.value = '';
    
    this.renderAllProperties();
    this.showToast('Filtros limpos');
  }

  showFavoritesOnly() {
    this.currentFilter.onlyFavorites = true;
    this.renderAllProperties();
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
    this.showToast(`Exibindo ${this.favorites.length} imóveis favoritados`);
  }

  // --- Helper & Utility Functions ---
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
    toast.innerHTML = `<i class="fa-solid fa-bell" style="color: #14B8A6;"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  setupEventListeners() {
    // Search form submission
    const searchForm = document.getElementById('mainSearchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const kw = document.getElementById('searchKeywordInput').value;
        const neigh = document.getElementById('searchNeighborhoodSelect').value;
        const type = document.getElementById('searchTypeSelect').value;

        this.currentFilter.keyword = kw;
        this.currentFilter.neighborhood = neigh;
        this.currentFilter.type = type;
        this.renderAllProperties();

        document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Modal Close
    const closeBtn = document.getElementById('modalCloseBtn');
    const modal = document.getElementById('propertyDetailModal');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
}

// Global reference for HTML inline handlers
window.meridionalApp = new MeridionalApp();
