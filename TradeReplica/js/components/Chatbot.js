import { geminiService } from '../services/GeminiService.js?v=1';

// Service is now a singleton
const gemini = geminiService;

export default function Chatbot() {
    const el = document.createElement('div');
    el.className = 'chat-widget closed';
    
    el.innerHTML = `
        <div class="chat-header">
            <div class="flex items-center gap-2">
                <div class="bot-avatar">✨</div>
                <div>
                    <h4>Gemini Assistant</h4>
                    <span class="status">Online</span>
                </div>
            </div>
            <button class="toggle-chat-btn">✖</button>
        </div>
        
        <div class="chat-messages" id="chat-messages">
            <div class="message bot">
                <p>Hello! I'm your AI trading assistant. Ask me anything about the markets, strategies, or how to use TradeReplica!</p>
            </div>
        </div>
        
        <div class="chat-input-area">
            <input type="text" placeholder="Ask about trading..." id="chat-input">
            <button class="send-btn">➤</button>
        </div>
        
        <button class="chat-launcher">
            <span class="icon">✨</span>
        </button>
    `;

    // Events
    const launcher = el.querySelector('.chat-launcher');
    const closeBtn = el.querySelector('.toggle-chat-btn');
    const input = el.querySelector('#chat-input');
    const sendBtn = el.querySelector('.send-btn');
    const msgs = el.querySelector('#chat-messages');

    // State 
    let isOpen = false;

    const toggle = () => {
        isOpen = !isOpen;
        if(isOpen) {
            el.classList.remove('closed');
            el.classList.add('open');
        } else {
            el.classList.remove('open');
            el.classList.add('closed');
        }
    };

    launcher.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);

    const addMessage = (text, sender) => {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = `<p>${text}</p>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    };

    const handleSend = async () => {
        const text = input.value.trim();
        if(!text) return;

        addMessage(text, 'user');
        input.value = '';
        
        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = typingId;
        typingDiv.innerHTML = `<p><i>Typing...</i></p>`;
        msgs.appendChild(typingDiv);
        msgs.scrollTop = msgs.scrollHeight;

        // Get AI Response
        try {
            const reply = await gemini.chat(text);
            
            // Remove typing indicator
            const tDiv = document.getElementById(typingId);
            if(tDiv) tDiv.remove();

            addMessage(reply, 'bot');
        } catch (err) {
            console.error(err);
             // Remove typing indicator
            const tDiv = document.getElementById(typingId);
            if(tDiv) tDiv.remove();
            
            addMessage("Sorry, I'm offline right now.", 'bot');
        }
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleSend();
    });

    return el;
}
