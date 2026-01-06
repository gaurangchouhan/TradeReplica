import { store, generateTradeRecord } from '../data.js';
import { trackButton } from '../analytics.js';

export default class TraderDetailView {
    constructor(params) {
        this.traderId = params.id;
        this.trader = store.traders.find(t => t.trader_id === this.traderId);

        // Generate mock trade records for this view specifically, MATCHING THE TRADER'S MARKET
        this.trades = Array.from({ length: 8 }, () => generateTradeRecord(this.traderId, this.trader.market_type));
        this.activeTab = 'positions'; // positions, history, copiers
    }

    render() {
        if (!this.trader) {
            return `<div>Trader not found</div>`; 
        }

        const el = document.createElement('div');
        el.className = 'detail-page container';
        
        el.innerHTML = `
            <button class="btn-text back-link">← Back to All Portfolios</button>
            <div class="detail-header">
                <!-- 5.1 Header -->
                <div class="profile-section">
                    <img src="${this.trader.avatar_url}" class="profile-lg">
                    <div>
                        <div class="flex items-center gap-2">
                            <h1>${this.trader.name}</h1>
                            <span class="risk-tag">Low Risk</span>
                        </div>
                        <p class="trader-bio">
                            Systematic trend follower targeting consistent compounding. 
                            <span class="translate-link">View Translation</span>
                        </p>
                        <div class="header-stats">
                            <div class="h-stat"><span>Days Trading</span> <strong>452</strong></div>
                            <div class="h-stat"><span>Copiers</span> <strong>${this.trader.current_followers} / ${this.trader.max_followers}</strong></div>
                            <div class="h-stat"><span>Total Copiers</span> <strong>2351</strong></div>
                            <div class="h-stat"><span>Mock Copiers</span> <strong>412</strong></div>
                            <div class="h-stat"><span>Closed Portfolios</span> <strong>12</strong></div>
                        </div>
                    </div>
                </div>

                <!-- 5.2 Header Actions -->
                <div class="header-actions">
                    <button class="btn-primary" ${!this.trader.can_copy ? 'disabled' : ''}>Copy Now</button>
                    <button class="btn-secondary">Mock Copy</button>
                    <button class="btn-secondary" id="compare-btn">Compare</button>
                </div>
            </div>

            <div class="detail-grid">
                <!-- 5.3 Performance Summary -->
                <div class="perf-summary card">
                    <div class="card-title">Performance (30D)</div>
                    <div class="summary-grid">
                        <div class="s-item">
                            <span class="label">ROI</span>
                            <span class="val text-success">${this.trader.roi}%</span>
                        </div>
                        <div class="s-item">
                            <span class="label">PnL</span>
                            <span class="val text-success">+$${this.trader.pnl_last_30_days}</span>
                        </div>
                        <div class="s-item">
                            <span class="label">Copier PnL</span>
                            <span class="val text-success">+$45,200</span>
                        </div>
                        <div class="s-item">
                            <span class="label">Sharpe Ratio</span>
                            <span class="val">${this.trader.sharpe_ratio}</span>
                        </div>
                        <div class="s-item">
                            <span class="label">Max Drawdown</span>
                            <span class="val text-danger">${this.trader.mdd}%</span>
                        </div>
                        <div class="s-item">
                            <span class="label">Win Rate</span>
                            <span class="val">68.4%</span>
                        </div>
                        <div class="s-item">
                            <span class="label">Win Positions</span>
                            <span class="val">98</span>
                        </div>
                         <div class="s-item">
                            <span class="label">Total Positions</span>
                            <span class="val">142</span>
                        </div>
                    </div>
                </div>

                 <!-- 5.4 Main Chart -->
                <div class="main-chart-card card">
                    <div class="chart-header">
                        <div class="card-title">Cumulative PnL %</div>
                        <div class="time-toggles">
                            <button class="active">30D</button>
                            <button>90D</button>
                            <button>1Y</button>
                        </div>
                    </div>
                    <div style="height: 300px;">
                        <canvas id="detail-chart"></canvas>
                    </div>
                </div>

                <!-- 5.5 Lead Trader Overview -->
                <div class="overview-card card">
                    <div class="card-title">Account Overview</div>
                    <ul class="overview-list">
                        <li><span>AUM</span> <strong>$${this.trader.aum.toLocaleString()}</strong></li>
                        <li><span>Profit Share</span> <strong>10%</strong></li>
                        <li><span>Min Copy</span> <strong>$100</strong></li>
                        <li><span>Margin Balance</span> <strong>$12,450.00</strong></li>
                    </ul>
                </div>

                <!-- 5.6 Asset Preferences -->
                <div class="assets-card card">
                    <div class="card-title">Asset Allocation</div>
                    <div style="height: 200px; position:relative;">
                        <canvas id="asset-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- 5.7 & 5.9 Tabs & Table -->
            <div class="records-section">
                <div class="tabs-nav">
                    <button class="tab-link ${this.activeTab === 'positions' ? 'active' : ''}" data-tab="positions">Positions (3)</button>
                    <button class="tab-link ${this.activeTab === 'history' ? 'active' : ''}" data-tab="history">History</button>
                    <button class="tab-link ${this.activeTab === 'copiers' ? 'active' : ''}" data-tab="copiers">Copiers</button>
                </div>
                
                <div class="table-container" id="tab-content">
                    ${this.renderTabContent()}
                </div>
            </div>


        `;
        
        this.attachEvents(el);
        
        // Defer Chart rendering
        setTimeout(() => {
            this.initCharts();

        }, 0);

        return el;
    }

    attachEvents(el) {
        // Back navigation
        el.querySelector('.back-link').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'dashboard' } }));
        });

        // Tabs
        el.querySelectorAll('.tab-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.activeTab = e.target.dataset.tab;
                
                // Update UI classes
                el.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                trackButton(`tab_${this.activeTab}`, 'TraderDetail');
                
                // Update Content
                el.querySelector('#tab-content').innerHTML = this.renderTabContent();
            });
        });

        // Action Buttons
        const copyBtn = el.querySelector('.btn-primary');
        if(copyBtn && !copyBtn.disabled) {
            copyBtn.addEventListener('click', () => {
                trackButton('copy_trader_detail', 'TraderDetail');
            });
        }

        const mockBtn = el.querySelector('.header-actions .btn-secondary'); // First secondary button
        if(mockBtn && mockBtn.textContent.includes('Mock')) {
            mockBtn.addEventListener('click', () => {
                trackButton('mock_copy_trader_detail', 'TraderDetail');
            });
        }

        // Compare Button
        const compareBtn = el.querySelector('#compare-btn');
        if(compareBtn) {
            compareBtn.addEventListener('click', () => {
                trackButton('compare_traders', 'TraderDetail');
                this.showCompareModal()
            });
        }
    }

    renderTabContent() {
        if (this.activeTab === 'positions') {
             return `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Type</th>
                            <th>Mode</th>
                            <th>Entry Price</th>
                            <th>Avg Close</th>
                            <th>Max OI</th>
                            <th>Vol</th>
                            <th>Time</th>
                            <th>PnL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderTrades()}
                    </tbody>
                </table>
             `;
        } else if (this.activeTab === 'history') {
             return `
                <table class="data-table">
                    <thead>
                         <tr>
                            <th>Symbol</th>
                            <th>Close Time</th>
                            <th>Type</th>
                            <th>Entry</th>
                            <th>Exit</th>
                            <th>Volume</th>
                            <th>Net PnL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderHistory()}
                    </tbody>
                </table>
             `;
        } else if (this.activeTab === 'copiers') {
            return `
                <table class="data-table">
                    <thead>
                         <tr>
                            <th>Copier</th>
                            <th>Copied Amount</th>
                            <th>PnL</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderCopiers()}
                    </tbody>
                </table>
            `;
        }
    }

    showCompareModal() {
        // Mock Comparison Feature
        const modal = document.createElement('div');
        modal.className = 'map-modal-container open'; // Reuse container style
        
        // Get 2 other random traders
        const others = store.traders.filter(t => t.trader_id !== this.traderId)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 2);
        
        const renderCompCol = (t) => `
            <div class="comp-col">
                <img src="${t.avatar_url}" class="comp-avatar">
                <h4>${t.name}</h4>
                <div class="comp-stat">
                    <span>30D PnL</span>
                    <strong class="${t.pnl_last_30_days >= 0 ? 'text-success' : 'text-danger'}">
                        ${t.currency}${t.pnl_last_30_days}
                    </strong>
                </div>
                <div class="comp-stat"><span>AUM</span> <strong>${t.currency}${(t.aum/1000).toFixed(1)}k</strong></div>
                <div class="comp-stat"><span>Sharpe</span> <strong>${t.sharpe_ratio}</strong></div>
                <div class="comp-stat"><span>Win Rate</span> <strong>${Math.floor(Math.random()*20+60)}%</strong></div>
                <div class="comp-stat"><span>MDD</span> <strong>${t.mdd}%</strong></div>
            </div>
        `;

        modal.innerHTML = `
            <div class="map-modal" style="max-width: 900px;">
                <div class="map-header">
                    <h3>Compare Traders</h3>
                    <button class="close-map">✕</button>
                </div>
                <div class="map-body" style="background: var(--color-bg-primary); padding: 20px;">
                    <div class="compare-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                         ${renderCompCol(this.trader)}
                         ${renderCompCol(others[0])}
                         ${renderCompCol(others[1])}
                    </div>
                </div>
            </div>
            <div class="map-backdrop"></div>
        `;
        
        document.body.appendChild(modal);
        const close = () => modal.remove();
        modal.querySelector('.close-map').addEventListener('click', close);
        modal.querySelector('.map-backdrop').addEventListener('click', close);
    }

    renderTrades() {
        return this.trades.map(t => `
            <tr>
                <td><span class="symbol-icon">BTC</span> ${t.symbol}</td>
                <td><span class="badge">${t.market_type}</span></td>
                <td><span class="mode-${t.position_mode}">${t.position_mode.toUpperCase()}</span> ${t.cross_margin ? '(X)' : ''}</td>
                <td>${t.entry_price}</td>
                <td>${t.average_close_price ? t.average_close_price : '-'}</td>
                <td>${t.max_open_interest}</td>
                <td>${t.closed_volume}</td>
                <td class="text-muted text-sm">
                    <div>Open: ${t.opened_time.split('T')[0]}</div>
                    ${t.closed_time ? `<div>Close: ${t.closed_time.split('T')[0]}</div>` : ''}
                </td>
                <td class="${t.closing_pnl >= 0 ? 'text-success' : 'text-danger'}">
                    ${t.closing_pnl >= 0 ? '+' : ''}${t.closing_pnl}
                </td>
            </tr>
        `).join('');
    }

    renderHistory() {
        // Mock History Data (Closed Trades)
        return Array.from({length: 5}).map((_, i) => {
             const pnl = (Math.random() * 200 - 50).toFixed(2);
             return `
                <tr>
                    <td><span class="symbol-icon">ETH</span> ETH/USDT</td>
                    <td class="text-muted">2024-05-${10+i}</td>
                    <td><span class="badge">futures</span></td>
                    <td>2850.50</td>
                    <td>2910.00</td>
                    <td>15.2</td>
                    <td class="${pnl >= 0 ? 'text-success' : 'text-danger'}">${pnl >= 0 ? '+' : ''}${pnl}</td>
                </tr>
             `;
        }).join('');
    }

    renderCopiers() {
        // Mock Copiers Data
        const names = ["User123", "CryptoKing", "SafeTrader", "HODLer_99", "AlphaSeeker"];
        return names.map(n => `
            <tr>
                <td style="display:flex; align-items:center; gap:8px;">
                     <div style="width:24px; height:24px; background:#333; border-radius:50%;"></div>
                     ${n}
                </td>
                <td>$${(Math.random() * 5000 + 100).toFixed(2)}</td>
                <td class="text-success">+$${(Math.random() * 500).toFixed(2)}</td>
                <td>${Math.floor(Math.random() * 100)} Days</td>
            </tr>
        `).join('');
    }

    initCharts() {
        // Main PnL Chart
        const ctx = document.getElementById('detail-chart');
        const data = this.trader.performance_graph;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'ROI %',
                    data: data.map(d => (d.value / 100)), // Mock percentage
                    borderColor: '#5865f2',
                    backgroundColor: 'rgba(88, 101, 242, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#718096' } },
                    y: { grid: { color: '#2a2e45' }, ticks: { color: '#718096' } }
                }
            }
        });

        // Asset Donut Chart
        const ctx2 = document.getElementById('asset-chart');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['BTC', 'ETH', 'SOL', 'USDT'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#f6b93b', '#6c5ce7', '#00cec9', '#2dfe54'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: '#a0aec0' } }
                }
            }
        });
    }


}
