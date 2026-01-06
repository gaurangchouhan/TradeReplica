import { store } from './data.js';
import Header from './components/Header.js';
import LoginView from './views/LoginView.js';
import DashboardView from './views/DashboardView.js';
import TraderDetailView from './views/TraderDetailView.js';
import ProfileView from './views/ProfileView.js';
import Footer from './components/Footer.js';
import Chatbot from './components/Chatbot.js?v=1';
import { trackPageView } from './analytics.js';

class App {
    constructor() {
        this.appEl = document.getElementById('app');
        this.routes = {
            'login': LoginView,
            'dashboard': DashboardView,
            'detail': TraderDetailView,
            'profile': ProfileView
        };
        this.currentRoute = null;
        
        // Router state
        this.state = {
            route: 'login', // default
            params: {}
        };

        this.init();
    }

    init() {
        // Check session (mock)
        if (sessionStorage.getItem('user')) {
            store.currentUser = JSON.parse(sessionStorage.getItem('user'));
            this.navigate('dashboard');
        } else {
            this.navigate('login');
        }

        // Global Event Listeners for Navigation
        window.addEventListener('navigate', (e) => {
            this.navigate(e.detail.route, e.detail.params);
        });
        
        // Initialize Chatbot globally
        const chatContainer = document.getElementById('chat-widget-container');
        chatContainer.appendChild(Chatbot());
    }

    navigate(route, params = {}) {
        this.state.route = route;
        this.state.params = params;
        
        // Track Virtual Page View
        trackPageView(`/${route}`);
        
        this.render();
    }

    render() {
        this.appEl.innerHTML = '';

        // Handle Chatbot Visibility
        const chatWidget = document.getElementById('chat-widget-container');
        if (chatWidget) {
            if (this.state.route === 'login') {
                chatWidget.classList.add('hidden');
            } else {
                chatWidget.classList.remove('hidden');
            }
        }
        
        // Logic to show/hide Header based on route
        if (this.state.route !== 'login') {
            this.appEl.appendChild(Header());
        }

        const ViewClass = this.routes[this.state.route];
        if (ViewClass) {
            // Instantiate view and append
            const view = new ViewClass(this.state.params);
            this.appEl.appendChild(view.render());
        } else {
            this.appEl.innerHTML = '<h1>404 - Not Found</h1>';
        }

        // Always append footer if not login
        if (this.state.route !== 'login') {
            this.appEl.appendChild(Footer());
        }
    }
}

// Global Click Handler for Interactivity
document.addEventListener('click', (e) => {
    if(e.target.matches('button') || e.target.closest('button')) {
        // If the button has no specific event stopped propagation, show feedback
        // This is a "catch-all" to ensure "No button does nothing"
        const btn = e.target.closest('button');
        if(!btn.onclick && !btn.hasAttribute('disabled') && !btn.classList.contains('tab-btn')) {
             // We won't interrupt mostly, but valid buttons usually have listeners. 
             // This is just a fallback visual feedback if needed.
             btn.style.transform = "scale(0.95)";
             setTimeout(() => btn.style.transform = "", 100);
        }
    }
});

// Start App
new App();
