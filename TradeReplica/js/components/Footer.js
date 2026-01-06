export default function Footer() {
    const el = document.createElement('footer');
    el.className = 'main-footer';
    
    el.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <div class="footer-logo">TradeReplica</div>
                    <p class="footer-desc">
                        The world's leading social trading platform. Copy the best, learn from the pros, and grow your wealth.
                    </p>
                    <div class="social-links">
                        
                    </div>
                </div>
                
                <div class="footer-col">
                    <h4>Markets</h4>
                    <ul>
                        <li><a href="#">Indian Stocks</a></li>
                        <li><a href="#">Forex Trading</a></li>
                        <li><a href="#">Crypto Indices</a></li>
                        <li><a href="#">Commodities</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Press</a></li>
                        <li><a href="#">Blog</a></li>
                    </ul>
                </div>
                
                <div class="footer-col">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Fees & Charges</a></li>
                        <li><a href="#">Security</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 TradeReplica. All rights reserved.</p>
                <div class="legal-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Risk Disclosure</a>
                </div>
            </div>
        </div>
    `;
    
    // Add toast interaction for functionality demonstration
    el.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Simple toast 
            const toast = document.createElement('div');
            toast.className = 'toast-msg';
            toast.textContent = 'Navigating to ' + (e.target.textContent || 'Link');
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        });
    });

    return el;
}
