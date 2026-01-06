import { store, generateTradeRecord } from '../data.js';

export default class ProfileView {
    constructor() {
        this.user = store.currentUser;
        // Mock user data if missing
        if(!this.user.stats) {
            this.user.stats = {
                pnl: 1250.50,
                winRate: 65,
                totalTrades: 42
            };
        }
        this.history = [];
        // Generate diverse history
        for(let i=0; i<10; i++) {
            this.history.push(generateTradeRecord('hist-'+i));
        }
        this.favorites = store.traders.filter(t => t.is_favorite);
    }

    render() {
        const el = document.createElement('div');
        el.className = 'profile-page container';
        
        el.innerHTML = `
            <button class="btn-text back-link">← Back to All Portfolios</button>

            <div class="profile-header-card">
                <div class="user-main">
                    <div class="avatar-large">${this.user.username[0]}</div>
                    <div class="user-info">
                        <h1>${this.user.username} (You)</h1>
                        <p class="text-muted">ID: 8739201 • VIP Level 1</p>
                    </div>
                </div>
                <div class="user-dashboard-stats">
                    <div class="stat-box">
                        <span class="lbl">Total Balance</span>
                        <span class="val">$${this.user.balance?.toFixed(2)}</span>
                    </div>
                    <div class="stat-box">
                        <span class="lbl">Total Profit/Loss</span>
                        <span class="val text-success">+$${this.user.stats.pnl}</span>
                    </div>
                    <div class="stat-box">
                        <span class="lbl">Win Rate</span>
                        <span class="val">${this.user.stats.winRate}%</span>
                    </div>
                </div>
            </div>

            <div class="profile-content">
                <!-- Favorites Section -->
                <div class="favorites-section">
                    <h3>My Favorite Traders</h3>
                    <div class="fav-grid">
                        ${this.favorites.length ? this.favorites.map(t => this.renderFavCard(t)).join('') : '<p class="text-muted">No favorites yet.</p>'}
                    </div>
                </div>

                <!-- History Section -->
                <div class="history-section">
                    <h3>Trade History</h3>
                    ${this.renderHistoryTable('Crypto Market', this.history.filter(t => t.market_type === 'crypto'))}
                    ${this.renderHistoryTable('Indian Stock Market', this.history.filter(t => t.market_type === 'stock'))}
                    ${this.renderHistoryTable('Forex Market', this.history.filter(t => t.market_type === 'forex'))}
                </div>
            </div>
        `;

        el.querySelector('.back-link').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'dashboard' } }));
        });

        return el;
    }

    renderHistoryTable(title, trades) {
        if(trades.length === 0) return '';
        return `
            <div class="market-history-block">
                <h4 class="market-title">${title}</h4>
                <table class="data-table">
                         <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Type</th>
                                <th>Side</th>
                                <th>Price</th>
                                <th>PnL</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trades.map(t => `
                                <tr>
                                    <td>${t.symbol || 'BTC/USDT'}</td>
                                    <td>${t.market_type}</td>
                                    <td class="mode-${t.position_mode}">${t.position_mode.toUpperCase()}</td>
                                    <td>${t.entry_price}</td>
                                    <td class="${t.closing_pnl >= 0 ? 'text-success' : 'text-danger'}">${t.closing_pnl}</td>
                                    <td><span class="badge">${t.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
            </div>
        `;
    }

    renderFavCard(t) {
        return `
            <div class="fav-card" onclick="window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'detail', params: { id: '${t.trader_id}' } } }))">
                <img src="${t.avatar_url}" class="fav-avatar">
                <div>
                    <h4>${t.name}</h4>
                    <div class="${t.pnl_last_30_days >= 0 ? 'text-success' : 'text-danger'}">
                        ${t.pnl_last_30_days >= 0 ? '+' : ''}$${t.pnl_last_30_days}
                    </div>
                </div>
            </div>
        `;
    }
}
