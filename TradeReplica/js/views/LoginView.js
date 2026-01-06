import { store } from '../data.js';
import { trackLogin, trackSignup, trackError } from '../analytics.js';

export default class LoginView {
    constructor() {
        this.isLogin = true;
    }

    render() {
        const el = document.createElement('div');
        el.className = 'login-page container';
        el.innerHTML = `
            <div class="auth-card">
                <h1 class="auth-title">TradeReplica</h1>
                <p class="auth-subtitle">Login to the future of social trading</p>
                
                <form id="auth-form">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" name="username" required placeholder="Enter username">
                    </div>
                    
                    <div class="form-group" id="aadhaar-group" style="display: none;">
                        <label>Aadhaar Number (12 Digits)</label>
                        <input type="text" name="aadhaar" pattern="\\d{12}" title="12 digit Aadhaar number" placeholder="XXXX XXXX XXXX">
                    </div>

                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" name="password" required placeholder="••••••••">
                    </div>

                    <div id="auth-error" class="error-msg hidden"></div>

                    <button type="submit" class="btn-primary full-width">
                        ${this.isLogin ? 'Log In' : 'Create Account'}
                    </button>
                    
                    <p class="toggle-auth">
                        ${this.isLogin ? "Don't have an account?" : "Already have an account?"} 
                        <span id="toggle-btn">${this.isLogin ? 'Sign Up' : 'Log In'}</span>
                    </p>
                </form>
            </div>
        `;

        this.attachEvents(el);
        return el;
    }



    attachEvents(el) {
        const form = el.querySelector('#auth-form');
        const toggleBtn = el.querySelector('#toggle-btn');
        const aadhaarGroup = el.querySelector('#aadhaar-group');
        const submitBtn = el.querySelector('button[type="submit"]');

        toggleBtn.addEventListener('click', () => {
             // ... existing toggle logic ...
             this.isLogin = !this.isLogin;
             aadhaarGroup.style.display = this.isLogin ? 'none' : 'block';
             submitBtn.textContent = this.isLogin ? 'Log In' : 'Create Account';
             toggleBtn.textContent = this.isLogin ? 'Sign Up' : 'Log In';
             toggleBtn.parentElement.childNodes[0].textContent = this.isLogin ? "Don't have an account? " : "Already have an account? ";
             el.querySelector('.auth-subtitle').textContent = this.isLogin ? 'Login to the future of social trading' : 'Join the TradeReplica Community';
             el.querySelector('#auth-error').classList.add('hidden');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const username = formData.get('username');
            const password = formData.get('password');
            const aadhaar = formData.get('aadhaar');
            const errorBox = el.querySelector('#auth-error');

            errorBox.classList.add('hidden');
            submitBtn.disabled = true;

            let result;
            if (this.isLogin) {
                result = await store.login(username, password);
            } else {
                result = await store.createAccount(username, password, aadhaar);
            }

            if (result.error) {
                trackError(this.isLogin ? 'login_failed' : 'signup_failed', 'LoginView');
                errorBox.textContent = result.error.message;
                errorBox.classList.remove('hidden');
                submitBtn.disabled = false;
            } else {
                // Success
                if (this.isLogin) {
                    trackLogin('password');
                } else {
                    trackSignup('password');
                }
                sessionStorage.setItem('user', JSON.stringify(result.user));
                window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'dashboard' } }));
            }
        });
    }
}
