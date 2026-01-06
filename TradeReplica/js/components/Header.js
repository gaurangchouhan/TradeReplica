import { store } from '../data.js';
import DepositDrawer from './DepositDrawer.js';
import { trackFeature, trackButton } from '../analytics.js';
export default function Header() {
    const el = document.createElement('header');
    el.className = 'main-header';
    
    // Logic for tabs
    const currentMarket = window.sessionStorage.getItem('market_type') || 'stock';

    el.innerHTML = `
        <div class="header-content container">
            <div class="left-section">
                <div class="logo" style="cursor: pointer;">TradeReplica</div>
                <nav class="market-tabs">
                    <button class="tab-btn ${currentMarket === 'stock' ? 'active' : ''}" data-market="stock">Indian</button>
                    <button class="tab-btn ${currentMarket === 'forex' ? 'active' : ''}" data-market="forex">Forex</button>
                    <button class="tab-btn ${currentMarket === 'crypto' ? 'active' : ''}" data-market="crypto">Crypto</button>
                </nav>
            </div>
            
            <div class="right-controls">
                <button class="btn-primary small" id="deposit-btn">Deposit</button>
                <div class="control-item relative" id="wallet-container">
                    <button class="icon-btn" title="Wallet"><i class="fa-solid fa-wallet"></i></button>
                    <div class="dropdown-menu hidden" id="wallet-dropdown">
                        <div class="dropdown-header">Wallet Balance</div>
                        <div class="wallet-balance">$${store.currentUser?.balance?.toFixed(2) || '0.00'}</div>
                        <button class="btn-secondary full-width text-sm">Add Funds</button>
                    </div>
                </div>
                <div class="control-item" title="Profile" style="cursor: pointer;">
                    <div class="avatar-circle">${store.currentUser?.username?.[0] || 'U'}</div>
                </div>
                <div class="control-item relative" id="chat-container">
                    <button class="control-item icon-btn" title="Messaging"><i class="fa-regular fa-bell"></i></button>
                    <div class="dropdown-menu hidden" id="chat-dropdown" style="width: 300px;">
                        <div class="dropdown-header flex justify-between items-center">
                            <span></span>
                            <span class="text-sm cursor-pointer hover:text-white" style="font-size: 0.8rem;">View All ></span>
                        </div>
                        
                        <div class="chat-dropdown-item">
                            <div class="chat-icon-box">💬</div>
                            <div class="chat-content">
                                <div class="chat-title">Chat</div>
                                <div class="chat-subtitle">No news to report</div>
                            </div>
                        </div>

                        <div class="chat-dropdown-item">
                            <div class="chat-icon-box">📢</div>
                            <div class="chat-content">
                                <div class="chat-title">Announcement</div>
                                <div class="chat-subtitle">Binance Announces The $400 Million ...</div>
                            </div>
                            <div class="chat-date">10-16</div>
                        </div>

                        <div class="chat-dropdown-item">
                            <div class="chat-icon-box">🎁</div>
                            <div class="chat-content">
                                <div class="chat-title">Campaign</div>
                                <div class="chat-subtitle">EN-IN Shubh Referral Icon</div>
                            </div>
                        </div>

                        <div class="chat-dropdown-item">
                            <div class="chat-icon-box">👤</div>
                            <div class="chat-content">
                                <div class="chat-title">Account</div>
                            </div>
                            <div class="chat-badge">1</div>
                        </div>
                    </div>
                </div>
                <div class="control-item relative" id="lang-container">
                    <button class="icon-btn" title="Language">🌐</button>
                    <div class="dropdown-menu hidden" id="lang-dropdown">
                        <div class="dropdown-item active">English</div>
                        <div class="dropdown-item">Hindi (हिंदी)</div>
                        <div class="dropdown-item">Spanish (Español)</div>
                    </div>
                </div>
                <button class="theme-toggle icon-btn">🌙</button>
            </div>
        </div>
    `;

    // Events
    el.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const market = e.target.dataset.market;
            window.sessionStorage.setItem('market_type', market);
            // Re-render header active state
            el.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Dispatch event for dashboard to update
            window.dispatchEvent(new CustomEvent('market-change', { detail: { market } }));
        });
    });

    // Navigate to Profile on Avatar Click
    el.querySelector('.avatar-circle').parentElement.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'profile' } }));
    });

    // Logo click -> Dashboard
    el.querySelector('.logo').addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'dashboard' } }));
    });

    // Theme Toggle
    const themeBtn = el.querySelector('.theme-toggle');
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        themeBtn.textContent = isLight ? '☀️' : '🌙';
    });

    // Dropdown Toggles
    const setupDropdown = (triggerId, menuId) => {
        const trigger = el.querySelector(`#${triggerId} button`);
        const menu = el.querySelector(`#${menuId}`);
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
            if (!menu.classList.contains('hidden')) {
                trackFeature(triggerId.replace('-container', ''));
            }
        });
        // Close on click outside
        document.addEventListener('click', (e) => {
            if(!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    };

    setupDropdown('wallet-container', 'wallet-dropdown');
    setupDropdown('lang-container', 'lang-dropdown');
    setupDropdown('chat-container', 'chat-dropdown');




    // Initialize Deposit Drawer
    const depositDrawer = new DepositDrawer();
    const depositBtn = el.querySelector('#deposit-btn');
    if(depositBtn) {
        depositBtn.addEventListener('click', () => {
            trackButton('deposit_open', 'header');
            depositDrawer.open();
        });
    }

    return el;
}
