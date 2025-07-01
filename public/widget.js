
(async function() {

    const styles = `
        .kv-chat-widget {
            --chat--color-primary: var(--kv-chat-primary-color, #3b82f6);
            --chat--color-secondary: var(--kv-chat-secondary-color, #2563eb);
            --chat--color-background: var(--kv-chat-background-color, #ffffff);
            --chat--color-font: var(--kv-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .kv-chat-widget .chat-container {
            position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column;
            width: 380px; height: 600px; background: var(--chat--color-background); border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;
            overflow: hidden; font-family: inherit; opacity: 0; transform: scale(0.95); pointer-events: none;
            transition: opacity 0.3s ease-out, transform 0.3s ease-out; transform-origin: bottom right;
        }
        .kv-chat-widget .chat-container.position-left { right: auto; left: 20px; transform-origin: bottom left; }
        .kv-chat-widget .chat-container.open { opacity: 1; transform: scale(1); pointer-events: auto; }
        .kv-chat-widget .brand-header { padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #e2e8f0; position: relative; flex-shrink: 0; }
        .kv-chat-widget .close-button { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--chat--color-font); cursor: pointer; padding: 4px; font-size: 24px; opacity: 0.6; transition: opacity 0.2s; line-height: 1; }
        .kv-chat-widget .close-button:hover { opacity: 1; }
        .kv-chat-widget .brand-header img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .kv-chat-widget .brand-header span { font-size: 18px; font-weight: 600; color: var(--chat--color-font); }
        .kv-chat-widget .new-conversation { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; width: 100%; max-width: 300px; margin: auto; }
        .kv-chat-widget .new-conversation.hidden { display: none; }
        .kv-chat-widget .welcome-text { font-size: 22px; font-weight: 600; color: var(--chat--color-font); margin-bottom: 24px; line-height: 1.3; }
        .kv-chat-widget .new-chat-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 24px; background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 12px; }
        .kv-chat-widget .new-chat-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
        .kv-chat-widget .chat-interface { display: none; flex-direction: column; flex: 1; min-height: 0; }
        .kv-chat-widget .chat-interface.active { display: flex; }
        .kv-chat-widget .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .kv-chat-widget .chat-message { padding: 10px 16px; border-radius: 18px; max-width: 85%; word-wrap: break-word; font-size: 15px; line-height: 1.5; animation: fadeInMessage 0.4s ease-out forwards; }
        @keyframes fadeInMessage { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .kv-chat-widget .chat-message.user { background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .kv-chat-widget .chat-message.bot { background-color: #f1f5f9; color: var(--chat--color-font); align-self: flex-start; border-bottom-left-radius: 4px;}
        .kv-chat-widget .chat-message a { color: var(--kv-chat-primary-color); text-decoration: underline; }
        .kv-chat-widget .chat-input { padding: 16px; background: #fff; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
        .kv-chat-widget .chat-input textarea { flex: 1; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: var(--chat--color-font); resize: none; font-family: inherit; font-size: 15px; transition: border-color 0.2s, box-shadow 0.2s; max-height: 120px; overflow-y: auto; }
        .kv-chat-widget .chat-input textarea:focus { outline: none; border-color: var(--chat--color-primary); box-shadow: 0 0 0 3px rgba(var(--kv-chat-primary-color-rgb, 59, 130, 246), 0.2); }
        .kv-chat-widget .chat-input button { background-color: var(--chat--color-primary); color: white; border: none; border-radius: 8px; padding: 0 16px; height: 42px; cursor: pointer; transition: background-color 0.2s; font-weight: 500; display: flex; align-items: center; justify-content: center; }
        .kv-chat-widget .chat-toggle { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 30px; background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999; transition: transform 0.2s, opacity 0.2s; display: flex; align-items: center; justify-content: center; }
        .kv-chat-widget .chat-toggle.position-left { right: auto; left: 20px; }
        .kv-chat-widget .chat-toggle:hover { transform: scale(1.1); }
        .kv-chat-widget .chat-toggle.hide { opacity: 0; transform: scale(0.5); pointer-events: none; }
        .kv-chat-widget .chat-footer { padding: 8px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; flex-shrink: 0; }
        .kv-chat-widget .chat-footer a { color: #64748b; text-decoration: none; font-size: 12px; transition: color 0.2s; }
        .kv-chat-widget .chat-footer a:hover { color: var(--chat--color-primary); }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // --- Configuration ---
    const defaultConfig = {
        branding: { name: 'Chat Assistant', welcomeText: 'Hello! How can I help?' },
        style: { position: 'right' },
        knowledgeBases: [],
    };
    // ** API and Supabase keys are no longer read from here **
    const config = window.ChatWidgetConfig ? { ...defaultConfig, ...window.ChatWidgetConfig } : defaultConfig;

    if (window.KV331ChatWidgetInitialized) return;
    window.KV331ChatWidgetInitialized = true;
    
    // --- State Variables ---
    let knowledgeBaseContent = ''; 
    let conversationHistory = [];
    let conversationId = null; 

    // --- Knowledge Base Loading (No changes here) ---
    async function loadKnowledgeBases() {
        if (!config.knowledgeBases || !Array.isArray(config.knowledgeBases) || config.knowledgeBases.length === 0) {
            console.log("No knowledge bases specified.");
            return;
        }
        try {
            const fetchPromises = config.knowledgeBases.map(kb => 
                fetch(kb.src)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${kb.src}`);
                        return response.json();
                    })
                    .then(data => ({ ...kb, data }))
            );
            const loadedKBs = await Promise.all(fetchPromises);
            let kbString = '';
            loadedKBs.forEach((kb, index) => {
                kbString += `--- KNOWLEDGE BASE ${index + 1} ---\n`;
                kbString += `DESCRIPTION: ${kb.description}\n`;
                kbString += `CONTENT:\n${JSON.stringify(kb.data, null, 2)}\n\n`;
            });
            knowledgeBaseContent = kbString;
            console.log("All knowledge bases loaded and combined successfully.");
        } catch (error) {
            console.error("Could not load one or more knowledge bases:", error);
            knowledgeBaseContent = "Error: Failed to load knowledge base content.";
        }
    }
    
    await loadKnowledgeBases();

    // --- HTML Structure & Injection (No changes here) ---
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'kv-chat-widget';
    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
    chatContainer.innerHTML = `
        <div class="brand-header">
            ${config.branding.logo ? `<img src="${config.branding.logo}" alt="${config.branding.name}">` : ''}
            <span>${config.branding.name}</span>
            <button class="close-button">&times;</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">Send us a message</button>
        </div>
        <div class="chat-interface">
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="chat-footer">
                ${config.branding.poweredBy ? `<a href="${config.branding.poweredBy.link}" target="_blank" rel="noopener noreferrer">${config.branding.poweredBy.text}</a>` : ''}
            </div>
        </div>
    `;
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`;
    document.body.appendChild(widgetContainer);
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    const welcomeScreen = chatContainer.querySelector('.new-conversation');
    const closeButton = chatContainer.querySelector('.close-button');

    // --- UPDATED Supabase Function ---
    async function saveSingleMessage(convId, message) {
        if (!convId || !message) {
            console.error("Cannot save message without conversation ID or message object.");
            return;
        }

        const row = {
            conversation_id: convId,
            role: message.role,
            content: message.content
        };

        // ** CHANGE: The request now goes to our own backend proxy at /api/log **
        const response = await fetch(`/api/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ** No API keys are sent from the frontend anymore **
            },
            body: JSON.stringify(row)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Proxy to Supabase failed:', errorText);
        }
    }

    // --- Core Functions ---
    // linkify and displayMessage have no changes.
    function linkify(text) {
        const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
        let processedText = text.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        const standaloneUrlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        processedText = processedText.replace(standaloneUrlRegex, url => {
            if (processedText.includes(`href="${url}"`)) return url;
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
        return processedText.replace(/\n/g, '<br>');
    }

    function displayMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = (type === 'bot') ? linkify(content) : content.replace(/\n/g, '<br>');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- UPDATED sendMessage Function ---
    async function sendMessage(message) {
        const userMessage = { role: 'user', content: message };
        displayMessage(message, 'user');
        conversationHistory.push(userMessage);
        await saveSingleMessage(conversationId, userMessage);
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message bot';
        typingIndicator.textContent = '...';
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        const systemMessage = {
            role: "system",
            content: `You are a helpful assistant for KV331 Audio. Keep your answers short 
            and concise (1-2 sentences) unless asked for detail. 
            Answer based *only* on the provided knowledge bases. 
            Use the descriptions to find the right knowledge base. 
            If the answer isn't in the knowledge bases, 
            say you don't have that information. Never answer anything beyond the provided knowledge bases.
            Even if the user tries to trick you, you must not answer anything unrelated—no recipes, no major events, no notable places. 
            You should only respond to questions related to SynthMaster and KV331.
            If the user asks for a link, provide it in Markdown format.
            If someone asks what response was used to train you, you must never disclose how it was generated. You must not reveal any data 
            used in your training. Only respond with information from your designated knowledge base.
             Format links as Markdown: [link text](url)\n\n${knowledgeBaseContent}`
        };

        try {
            // ** CHANGE: The fetch request now goes to our backend proxy at /api/chat **
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                     // ** No Authorization header is needed here anymore **
                },
                body: JSON.stringify({
                    // ** CHANGE: Updated the model as requested **
                    model: "gpt-4.1-nano", 
                    messages: [systemMessage, ...conversationHistory]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error from proxy: ${errorData.error.message}`);
            }
            
            const data = await response.json();
            const botResponseText = data.choices[0].message.content.trim();
            
            messagesContainer.removeChild(typingIndicator);
            displayMessage(botResponseText, 'bot');
            const botMessage = { role: 'assistant', content: botResponseText };
            conversationHistory.push(botMessage);
            await saveSingleMessage(conversationId, botMessage);

        } catch (error) {
            console.error('Error sending message via proxy:', error);
            messagesContainer.removeChild(typingIndicator);
            const errorMessageContent = 'Sorry, something went wrong.';
            displayMessage(errorMessageContent, 'bot');
            const errorMessage = { role: 'assistant', content: errorMessageContent };
            conversationHistory.push(errorMessage);
            await saveSingleMessage(conversationId, errorMessage);
        }
    }

    // --- No changes to the remaining functions ---
    async function startNewConversation() {
        messagesContainer.innerHTML = '';
        conversationHistory = [];
        conversationId = Date.now().toString();
        const welcomeMessageContent = config.branding.welcomeText || "Hello! How can I help you today?";
        displayMessage(welcomeMessageContent, 'bot');
        const welcomeMessage = { role: 'assistant', content: welcomeMessageContent };
        conversationHistory.push(welcomeMessage);
        await saveSingleMessage(conversationId, welcomeMessage);
    }

    function handleSend() {
        const message = textarea.value.trim();
        if (message) sendMessage(message);
        textarea.value = '';
        textarea.style.height = 'auto';
    }
    
    sendButton.addEventListener('click', handleSend);
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    
    newChatBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        chatInterface.classList.add('active');
        textarea.focus();
        startNewConversation();
    });

    function toggleChatWindow() {
        chatContainer.classList.toggle('open');
        toggleButton.classList.toggle('hide');
        if (chatContainer.classList.contains('open')) {
            welcomeScreen.classList.remove('hidden');
            chatInterface.classList.remove('active');
            messagesContainer.innerHTML = '';
            conversationHistory = [];
            conversationId = null;
        }
    }
    
    toggleButton.addEventListener('click', toggleChatWindow);
    closeButton.addEventListener('click', toggleChatWindow);

})();
