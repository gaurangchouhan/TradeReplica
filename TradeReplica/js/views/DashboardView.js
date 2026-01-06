import { store } from '../data.js';
import { trackButton, trackFeature, trackEvent } from '../analytics.js';

export default class DashboardView {
    constructor() {
        this.currentMarket = window.sessionStorage.getItem('market_type') || 'stock';
        this.currentTab = 'all'; // 'all', 'fav', 'daily'
    }

    render() {
        const el = document.createElement('div');
        el.className = 'dashboard-page container';
        
        el.innerHTML = `
            <div class="dashboard-header">
                <div>
                    <h2>Trading Dashboard</h2>
                    <p class="text-muted">No unrealized PnL</p>
                </div>
                <div class="user-stats">
                    <span class="label">Margin Balance:</span>
                    <span class="value">$${store.currentUser?.balance?.toFixed(2) || '0.00'}</span>
                    <button class="btn-primary" id="copy-overview-btn">Copy Overview</button>
                </div>
            </div>

            <div class="dashboard-controls">
                <div class="portfolio-toggle-row">
                    <div class="segment-control">
                        <button class="segment-btn active" data-tab="all">All Portfolios</button>
                        <button class="segment-btn" data-tab="fav">My Favorites</button>
                        <button class="segment-btn special-tab" data-tab="daily">Daily Picks 🔥</button>
                    </div>
                </div>

                <div class="filters-row">
                    <!-- Dropdown: Time -->
                    <div class="custom-dropdown" id="time-filter-dropdown">
                        <button class="dropdown-trigger-outline">
                            <span>Last 30 Days</span>
                            <span class="chevron">▼</span>
                        </button>
                        <div class="dropdown-menu hidden custom-opts">
                             <div class="dropdown-item active" data-val="30">Last 30 Days ✓</div>
                             <div class="dropdown-item" data-val="7">Last 7 Days</div>
                             <div class="dropdown-item" data-val="90">Last 90 Days</div>
                        </div>
                    </div>

                    <!-- Dropdown: Sort -->
                    <div class="custom-dropdown" id="sort-filter-dropdown">
                         <button class="dropdown-trigger-outline">
                            <span>PnL: High to Low</span>
                            <span class="chevron">▼</span>
                         </button>
                         <div class="dropdown-menu hidden custom-opts">
                             <div class="dropdown-item active" data-val="pnl">PnL: High to Low ✓</div>
                             <div class="dropdown-item" data-val="roi">ROI: High to Low</div>
                             <div class="dropdown-item" data-val="followers">Overview</div>
                         </div>
                    </div>

                    <!-- Smart Filter -->
                    <label class="smart-toggle-btn">
                        <input type="checkbox" id="smart-filter" onchange="import('../analytics.js').then(m=>m.trackFeature(this.checked ? 'smart_filter_on' : 'smart_filter_off'))">
                        <span class="toggle-track">
                             <span class="toggle-switch"></span>
                        </span>
                        <span class="label-text">Smart Filter</span>
                    </label>

                    <!-- Search (Expanded) -->
                    <div class="search-box-outline">
                        <span class="search-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                        <input type="text" placeholder="Search traders..." id="trader-search">
                    </div>

                    <!-- Filter Icon Button -->
                    <button class="filter-icon-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="traders-grid" id="traders-grid">
                <!-- Cards injected here -->
            </div>
        `;

        this.renderCards(el.querySelector('#traders-grid'));
        this.attachEvents(el);
        return el;
    }

    renderCards(container, searchTerm = '') {
        const traders = store.getTraders({ 
            market: this.currentMarket,
            search: searchTerm,
            onlyFavorites: this.currentTab === 'fav'
        });

        if (traders.length === 0) {
            container.innerHTML = '<div class="empty-state">No traders found matching your criteria.</div>';
            return;
        }

        container.innerHTML = traders.map(t => this.createCardHTML(t)).join('');
        
        // After inserting HTML, we need to draw charts (Chart.js needs canvas context)
        // We defer this slightly to ensure DOM is ready
        setTimeout(() => {
            traders.forEach(t => {
                this.drawMiniChart(t.trader_id, t.performance_graph);
            });
        }, 0);
    }

    createCardHTML(t) {
        return `
            <div class="trader-card" data-id="${t.trader_id}">
                <div class="card-header">
                    <img src="${t.avatar_url}" alt="${t.name}" class="card-avatar">
                    <div class="card-info">
                        <div class="name-row">
                            <h3>${t.name}</h3>
                            ${t.status === 'online' ? '<span class="status-dot online"></span>' : '<span class="status-dot offline"></span>'}
                        </div>
                        <div class="followers-count">
                            <span class="icon">👥</span> ${t.current_followers} / ${t.max_followers}
                        </div>
                        <button class="location-btn" data-loc="${t.location}" title="View Location">
                            📍 ${t.location}
                        </button>
                    </div>
                    <button class="star-btn ${t.is_favorite ? 'active' : ''}">★</button>
                </div>

                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">30D PnL</span>
                        <span class="stat-value ${t.pnl_last_30_days >= 0 ? 'text-success' : 'text-danger'}">
                            ${t.currency}${t.pnl_last_30_days.toFixed(2)}
                        </span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ROI</span>
                        <span class="stat-value ${t.roi >= 0 ? 'text-success' : 'text-danger'}">
                            ${t.roi}%
                        </span>
                    </div>
                </div>

                <div class="chart-area">
                    <canvas id="chart-${t.trader_id}" height="60"></canvas>
                </div>

                <div class="card-footer-stats">
                    <div>
                        <span class="sub-label">AUM</span>
                        <span class="sub-val">${t.currency}${(t.aum / 1000).toFixed(1)}k</span>
                    </div>
                    <div>
                        <span class="sub-label">MDD</span>
                        <span class="sub-val">${t.mdd}%</span>
                    </div>
                    <div>
                        <span class="sub-label">Sharpe</span>
                        <span class="sub-val">${t.sharpe_ratio}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn-primary copy-btn">Copy</button>
                    <button class="btn-secondary mock-btn">Mock</button>
                </div>
            </div>
        `;
    }

    drawMiniChart(id, data) {
        const ctx = document.getElementById(`chart-${id}`);
        if(!ctx) return;
        
        const isPositive = (data[data.length-1].value - data[0].value) >= 0;
        const color = isPositive ? '#00c087' : '#ff4d4d';

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    data: data.map(d => d.value),
                    borderColor: color,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
                layout: { padding: 5 }
            }
        });
    }

    attachEvents(el) {
        // Market change listener
        window.addEventListener('market-change', (e) => {
            this.currentMarket = e.detail.market;
            el.querySelector('h2').nextElementSibling.textContent = `Explore top traders in ${this.currentMarket} market`;
            this.renderCards(el.querySelector('#traders-grid'));
        });

        // Search
        let searchTimeout;
        el.querySelector('#trader-search').addEventListener('input', (e) => {
            const val = e.target.value;
            this.renderCards(el.querySelector('#traders-grid'), val);
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if(val.length > 2) {
                    trackEvent('search', { search_term: val, screen_name: 'Dashboard' });
                }
            }, 1000);
        });

        // Card clicks
        el.querySelector('#traders-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.trader-card');
            
            if (e.target.matches('.copy-btn')) {
                trackButton('copy_trader', 'Dashboard');
                e.stopPropagation();
                // Copy logic would go here
                return;
            }
            if (e.target.matches('.mock-btn')) {
                trackButton('mock_copy_trader', 'Dashboard');
                e.stopPropagation();
                 // Mock copy logic would go here
                return;
            }

            if(card && !e.target.closest('button')) {
                // Navigate to detail if not clicking a specific button
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { route: 'detail', params: { id: card.dataset.id } } 
                }));
            }
        });



        // Generic Dropdown Logic
        const dropdowns = el.querySelectorAll('.custom-dropdown');
        
        dropdowns.forEach(drop => {
            const trigger = drop.querySelector('.dropdown-trigger-outline');
            const menu = drop.querySelector('.dropdown-menu');
            const triggerText = trigger.querySelector('span:first-child');
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close others
                dropdowns.forEach(d => {
                    if(d !== drop) d.querySelector('.dropdown-menu').classList.add('hidden');
                });
                menu.classList.toggle('hidden');
            });
            
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Update Active State
                    menu.querySelectorAll('.dropdown-item').forEach(i => {
                         i.classList.remove('active');
                         // Clean text (remove checkmark)
                         i.textContent = i.textContent.replace('✓', '').trim();
                    });
                    
                    item.classList.add('active');
                    const valText = item.textContent.trim();
                    item.textContent = valText + ' ✓';
                    
                    // Update Trigger Text
                    if(triggerText) triggerText.textContent = valText;
                    
                    menu.classList.add('hidden');
                    
                    // Re-render cards if needed (e.g., sort, time) using generic refresh or specific check
                    // For now, simple re-render if search exists, or just visual update as this is a mock
                    if(drop.id === 'sort-filter-dropdown') {
                        // Sort logic placeholder
                    }
                });
            });
        });

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
             dropdowns.forEach(drop => {
                 if(!drop.contains(e.target)) {
                     drop.querySelector('.dropdown-menu').classList.add('hidden');
                 }
             });
        });

        // Copy Overview Button
        const copyOverviewBtn = el.querySelector('#copy-overview-btn');
        if(copyOverviewBtn) {
            copyOverviewBtn.addEventListener('click', () => {
                trackButton('copy_overview', 'Dashboard');
                window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'profile' } }));
            });
        }

        // Location Map Click
        el.querySelector('#traders-grid').addEventListener('click', async (e) => {
            // Star Button
            const starBtn = e.target.closest('.star-btn');
            if (starBtn) {
                e.stopPropagation();
                const card = starBtn.closest('.trader-card');
                const id = card.dataset.id;
                const result = await store.toggleFavorite(id);
                if (result.success) {
                    starBtn.classList.toggle('active', result.is_favorite);
                    // If in "My Favorites" tab and untoggled, remove card or refresh
                    if (this.currentTab === 'fav' && !result.is_favorite) {
                        this.renderCards(el.querySelector('#traders-grid'));
                    }
                }
                return;
            }

            const btn = e.target.closest('.location-btn');
            if(btn) {
                e.stopPropagation();
                this.showMapModal(btn.dataset.loc);
                return;
            }
        });

        // Segmented Control
        el.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                el.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const tab = e.target.dataset.tab;
                trackButton(`tab_${tab}`, 'Dashboard');
                
                this.currentTab = tab;
                this.renderCards(el.querySelector('#traders-grid'));
            });
        });
    }

    showMapModal(location) {
        const modal = document.createElement('div');
        modal.className = 'map-modal-container';
        modal.innerHTML = `
            <div class="map-modal">
                <div class="map-header">
                    <h3>Traders Location - ${location}</h3>
                    <button class="close-map">✕</button>
                </div>
                <div class="map-body">
                    <iframe 
                        width="100%" 
                        height="400" 
                        frameborder="0" 
                        style="border:0" 
                        src="https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed" allowfullscreen>
                    </iframe>
                </div>
            </div>
            <div class="map-backdrop"></div>
        `;
        
        document.body.appendChild(modal);
        
        // Brief animation
        setTimeout(() => modal.classList.add('open'), 10);
        
        const close = () => {
            modal.classList.remove('open');
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.querySelector('.close-map').addEventListener('click', close);
        modal.querySelector('.map-backdrop').addEventListener('click', close);
    }
}
