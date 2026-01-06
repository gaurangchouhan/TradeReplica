import { trackButton } from '../analytics.js';

export default class DepositDrawer {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        // Create drawer element specifically
        this.drawer = document.createElement('div');
        this.drawer.id = 'deposit-drawer';
        this.drawer.className = 'deposit-drawer hidden';
        document.body.appendChild(this.drawer);

        this.render();
        this.attachEvents();
    }

    render() {
        this.drawer.innerHTML = `
            <div class="drawer-header">
                <button class="currency-selector">
                    <span class="currency-icon">₹</span> INR <span class="chevron">▼</span>
                </button>
                <button class="close-drawer-btn">&times;</button>
            </div>

            <div class="drawer-content">
                <div class="drawer-section">
                    <h3 class="section-title">I don't have crypto assets</h3>
                    
                    <div class="action-card">
                        <div class="card-icon p2p-icon">👥</div>
                        <div class="card-details">
                            <div class="card-title">Buy with INR (P2P)</div>
                            <div class="card-desc">Buy directly from users. Competitive pricing. Local payments.</div>
                        </div>
                        <div class="card-arrow">›</div>
                    </div>

                    <div class="action-card">
                        <div class="card-icon card-buy-icon">💳</div>
                        <div class="card-details">
                            <div class="card-title">Buy with INR</div>
                            <div class="card-desc">Buy crypto easily via bank transfer, card, and more.</div>
                        </div>
                        <div class="card-arrow">›</div>
                    </div>
                </div>

                <div class="drawer-section">
                    <h3 class="section-title">I have crypto assets</h3>
                    
                    <div class="action-card">
                        <div class="card-icon deposit-icon">📥</div>
                        <div class="card-details">
                            <div class="card-title">Deposit Crypto</div>
                            <div class="card-desc">Send crypto to your Binance Account</div>
                        </div>
                        <div class="card-arrow">›</div>
                    </div>
                </div>

                <div class="drawer-footer-links">
                    <div class="footer-link-header flex justify-between">
                        <span>Beginner Deposit Tutorial</span>
                        <a href="#" class="more-link">More ></a>
                    </div>
                    <div class="tutorial-links">
                        <a href="#" class="tut-link"><span class="vid-icon">📹</span> How to buy Crypto with P2P Trading?</a>
                        <a href="#" class="tut-link"><span class="vid-icon">❓</span> How to buy Crypto with Credit/Debit Card?</a>
                        <a href="#" class="tut-link"><span class="vid-icon">📹</span> How to deposit crypto?</a>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        const closeBtn = this.drawer.querySelector('.close-drawer-btn');
        closeBtn.onclick = () => this.close();

        // Clicking overlay also closes
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        };

        // Add interaction to cards
        this.drawer.querySelectorAll('.action-card').forEach(card => {
            card.onclick = () => {
                const title = card.querySelector('.card-title').textContent;
                trackButton(title, 'deposit_drawer');
                alert('Redirecting to payment gateway...');
            };
        });
    }

    open() {
        this.overlay.classList.remove('hidden');
        this.drawer.classList.remove('hidden');
        // Small delay to allow CSS transition if we added one (but currently using display toggling, we can add class for animation)
        requestAnimationFrame(() => {
            this.drawer.classList.add('open');
        });
    }

    close() {
        this.drawer.classList.remove('open');
        setTimeout(() => {
            this.overlay.classList.add('hidden');
            this.drawer.classList.add('hidden');
            this.overlay.onclick = null; // Clear overlay click listener to avoid conflicts
        }, 300); // Match transition duration
    }
}
