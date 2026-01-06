/**
 * Data Layer for TradeReplica
 * Implements strict JSON schemas and validation as requested.
 * Purpose: Central source of truth for all structured data models.
 */

// --- 1. Schemas & Types Definitions (JSDoc for structure) ---

/**
 * @typedef {Object} TraderPortfolioCard
 * @property {string} trader_id - UUID
 * @property {string} avatar_url - URL
 * @property {'online'|'offline'} status
 * @property {number} current_followers
 * @property {number} max_followers
 * @property {number} pnl_last_30_days - Float
 * @property {Array<{date: string, value: number}>} performance_graph
 * @property {number} roi - Percentage
 * @property {number} aum - Assets Under Management (USD)
 * @property {number} mdd - Maximum Drawdown (%)
 * @property {number|null} sharpe_ratio
 * @property {boolean} is_favorite
 * @property {boolean} can_copy
 * @property {boolean} can_mock
 * @property {boolean} is_full
 */

/**
 * @typedef {Object} TradeRecord
 * @property {string} trade_id - UUID
 * @property {string} market_type - 'futures'|'spot'
 * @property {'long'|'short'} position_mode
 * @property {boolean} cross_margin
 * @property {'open'|'closed'|'partial'} status
 * @property {string} opened_time - ISO8601
 * @property {string|null} closed_time - ISO8601
 * @property {number} entry_price
 * @property {number|null} average_close_price
 * @property {number} max_open_interest
 * @property {number} closed_volume
 * @property {number} closing_pnl
 */

// --- 2. Generators & Mocks ---

const NAMES_GLOBAL = ["Alex Thompson", "Sarah Chen", "Michael Rodriguez", "David Kim", "Emma Wilson", "James Smith", "Maria Garcia", "Robert Johnson"];
const NAMES_INDIAN = ["Aarav Patel", "Vihaan Sharma", "Aditya Verma", "Sai Iyer", "Reyansh Gupta", "Arjun Reddy", "Vivaan Malhotra", "Kabir Singh"];

/**
 * Generates a mock TraderPortfolioCard object adhering strictly to the schema.
 * @param {string} id 
 * @returns {TraderPortfolioCard}
 */
export function generateTraderCard(id, marketType = 'stock') {
    const isFull = Math.random() > 0.8;
    const currentFollowers = isFull ? 500 : Math.floor(Math.random() * 450);
    
    // Generate simple graph data
    const graph = [];
    let val = 10000;
    const now = new Date();
    for(let i=30; i>=0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        val = val * (1 + (Math.random() * 0.1 - 0.04)); // Random walk
        graph.push({
            date: d.toISOString().split('T')[0],
            value: parseFloat(val.toFixed(2))
        });
    }

    const cities_global = [
        { name: "New York, USA", lat: 40.7128, lng: -74.0060 },
        { name: "London, UK", lat: 51.5074, lng: -0.1278 },
        { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
        { name: "Singapore", lat: 1.3521, lng: 103.8198 },
        { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050 },
        { name: "Toronto, Canada", lat: 43.6510, lng: -79.3470 },
        { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 }
    ];

    const cities_indian = [
        { name: "Mumbai, India", lat: 19.0760, lng: 72.8777 },
        { name: "Bangalore, India", lat: 12.9716, lng: 77.5946 },
        { name: "Delhi, India", lat: 28.7041, lng: 77.1025 },
        { name: "Hyderabad, India", lat: 17.3850, lng: 78.4867 },
        { name: "Chennai, India", lat: 13.0827, lng: 80.2707 },
        { name: "Pune, India", lat: 18.5204, lng: 73.8567 },
        { name: "Kolkata, India", lat: 22.5726, lng: 88.3639 },
        { name: "Ahmedabad, India", lat: 23.0225, lng: 72.5714 }
    ];

    let namesList, citiesList, currencySymbol;
    if (marketType === 'stock') {
        namesList = NAMES_INDIAN;
        citiesList = cities_indian;
        currencySymbol = '₹';
    } else {
        // Mixed for Forex/Crypto, but let's mix both for variety or strictly global? 
        // Request says "shows the both Indian as well as foreigners name and location mixed".
        namesList = [...NAMES_GLOBAL, ...NAMES_INDIAN];
        citiesList = [...cities_global, ...cities_indian];
        currencySymbol = '$';
    }

    const city = citiesList[Math.floor(Math.random() * citiesList.length)];

    return {
        trader_id: id,
        name: namesList[Math.floor(Math.random() * namesList.length)], 
        location: city.name,
        coordinates: { lat: city.lat, lng: city.lng },
        currency: currencySymbol,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        status: Math.random() > 0.3 ? "online" : "offline",
        current_followers: currentFollowers,
        max_followers: 500,
        pnl_last_30_days: parseFloat((Math.random() * 10000 - 2000).toFixed(2)),
        performance_graph: graph,
        roi: parseFloat((Math.random() * 100 - 10).toFixed(2)),
        aum: parseFloat((Math.random() * 500000 + 10000).toFixed(2)),
        mdd: parseFloat((Math.random() * -20).toFixed(2)),
        sharpe_ratio: parseFloat((Math.random() * 3).toFixed(2)),
        is_favorite: Math.random() > 0.8,
        can_copy: true, // Always allow copy, no "Full" state requested
        can_mock: true,
        market_type: marketType
    };
}

export function generateTradeRecord(id, forcedMarket) {
    const isOpen = Math.random() > 0.5;
    // Use the forced market if provided, otherwise random
    const market = forcedMarket || (Math.random() > 0.6 ? 'crypto' : (Math.random() > 0.5 ? 'forex' : 'stock'));
    
    let type = 'futures';
    let symbol = 'BTC/USDT';
    
    if(market === 'stock') { 
        const indian_stocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'TATAMOTORS', 'ADANIENT'];
        symbol = indian_stocks[Math.floor(Math.random() * indian_stocks.length)];
        type = 'stock'; 
    }
    else if(market === 'forex') { 
        const forex_pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'EUR/GBP'];
        symbol = forex_pairs[Math.floor(Math.random() * forex_pairs.length)];
        type = 'forex'; 
    }
    else if(market === 'crypto') {
        const crypto_pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'DOGE/USDT', 'XRP/USDT'];
        symbol = crypto_pairs[Math.floor(Math.random() * crypto_pairs.length)];
        type = 'crypto';
    }

    return {
        trade_id: id,
        market_type: type,
        symbol: symbol,
        position_mode: Math.random() > 0.5 ? "long" : "short",
        cross_margin: true,
        status: isOpen ? "open" : "closed",
        opened_time: new Date(Date.now() - 86400000 * Math.random() * 10).toISOString(),
        closed_time: isOpen ? null : new Date().toISOString(),
        entry_price: parseFloat((Math.random() * 2000 + 100).toFixed(2)),
        average_close_price: isOpen ? null : parseFloat((Math.random() * 2000 + 100).toFixed(2)),
        max_open_interest: parseFloat((Math.random() * 5).toFixed(2)),
        closed_volume: parseFloat((Math.random() * 10).toFixed(2)),
        closing_pnl: parseFloat((Math.random() * 500 - 50).toFixed(2))
    };
}

// --- 3. Data Store ---

class DataStore {
    constructor() {
        this.traders = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        // Hydrate mock data
        const markets = ['stock', 'forex', 'crypto'];
        for(let i=0; i<60; i++) {
            this.traders.push(generateTraderCard(`trader-${i}`, markets[i % 3]));
        }
    }

    /**
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<{user: object}|{error: object}>}
     */
    async login(username, password) {
        // Simulate API
        return new Promise((resolve) => {
            setTimeout(() => {
                if(username && password) {
                    this.currentUser = { username, balance: 10000.00 };
                    resolve({ user: this.currentUser });
                } else {
                    resolve({ error: { type: "auth_error", message: "Invalid credentials" } });
                }
            }, 500);
        });
    }

    /**
     * @param {string} username 
     * @param {string} password 
     * @param {string} aadhaar 
     * @returns {Promise<{user: object}|{error: object}>}
     */
    async createAccount(username, password, aadhaar) {
        // Validate Aadhaar (12 digits)
        const aadhaarRegex = /^\d{12}$/;
        if(!aadhaarRegex.test(aadhaar)) {
            return Promise.resolve({ 
                error: { type: "validation_error", message: "Invalid Aadhaar number. Must be 12 digits." } 
            });
        }
        
        this.currentUser = { username, aadhaar, balance: 0.00 };
        return Promise.resolve({ user: this.currentUser });
    }

    async toggleFavorite(traderId) {
        const trader = this.traders.find(t => t.trader_id === traderId);
        if (trader) {
            trader.is_favorite = !trader.is_favorite;
            return Promise.resolve({ success: true, is_favorite: trader.is_favorite });
        }
        return Promise.resolve({ success: false });
    }

    getTraders(filter = {}) {
        let results = this.traders;
        if(filter.market) {
            results = results.filter(t => t.market_type === filter.market);
        }
        if(filter.search) {
            results = results.filter(t => t.name.toLowerCase().includes(filter.search.toLowerCase()));
        }
        if(filter.onlyFavorites) {
            results = results.filter(t => t.is_favorite);
        }
        // Default Sort: PnL descending
        return results.sort((a, b) => b.pnl_last_30_days - a.pnl_last_30_days);
    }
}

export const store = new DataStore();
