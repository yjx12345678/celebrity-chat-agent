document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const clearChatButton = document.getElementById('clearChat');
    const celebrityButtons = document.querySelectorAll('.celebrity-btn');
    
    let currentCelebrity = 'jay';
    let conversationHistory = [];
    
    // 从localStorage加载数据
    function loadFromStorage() {
        const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
        const savedCelebrity = localStorage.getItem('currentCelebrity');
        
        if (savedCelebrity) {
            currentCelebrity = savedCelebrity;
            updateCelebrityButtons();
        }
        
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            renderConversationHistory();
        } else {
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
        }
    }
    
    function updateCelebrityButtons() {
        celebrityButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.celebrity === currentCelebrity);
        });
    }
    
    function renderConversationHistory() {
        chatMessages.innerHTML = '';
        conversationHistory.forEach(msg => {
            addMessage(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
        });
    }
    
    function saveToStorage() {
        localStorage.setItem(`celebrityChatHistory_${currentCelebrity}`, JSON.stringify(conversationHistory));
        localStorage.setItem('currentCelebrity', currentCelebrity);
    }
    
    function getCelebrityWelcomeMessage(celebrity) {
        const welcomeMessages = {
            jay: "嗨！哎呦不错哦～我是Jay Chou的AI分身，今天有什么想聊的吗？音乐、电影还是生活？😎",
            taylor: "Hi! I'm Taylor Swift's AI. Ready to chat about music, cats, or life in general? 🌟",
            jackie: "大家好！我是成龙AI，很高兴和你聊天！想聊聊电影、动作特技还是慈善？😊",
            kris: "Yo! 我是Kris Wu的AI分身，你想聊音乐、时尚还是篮球？🆒"
        };
        return welcomeMessages[celebrity] || "你好！我是明星AI分身，很高兴和你聊天！";
    }
    
    function getCelebrityInfo(celebrity) {
        const celebrities = {
            jay: { name: "周杰伦AI", style: "周杰伦风格" },
            taylor: { name: "泰勒AI", style: "泰勒风格" },
            jackie: { name: "成龙AI", style: "成龙风格" },
            kris: { name: "吴亦凡AI", style: "吴亦凡风格" }
        };
        return celebrities[celebrity] || { name: "明星AI", style: "友好风格" };
    }
    
    function addMessage(sender, text, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        const celebrityInfo = getCelebrityInfo(currentCelebrity);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23${sender === 'user' ? '43cea2' : '6e8efb'}'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23${sender === 'user' ? '185a9d' : 'a777e3'}'/%3E%3C/svg%3E" class="avatar">
                <span>${sender === 'user' ? '你' : celebrityInfo.name}</span>
            </div>
            ${text}
        `;
        
        chatMessages.appendChild(messageDiv);
        
        if (saveToHistory) {
            conversationHistory.push({
                role: sender === 'user' ? 'user' : 'assistant',
                content: text
            });
            saveToStorage();
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 调用Netlify Function
    async function callSparkAPI(userMessage) {
        try {
            const celebrityInfo = getCelebrityInfo(currentCelebrity);
            
            const response = await fetch('/.netlify/functions/spark-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    celebrity: currentCelebrity,
                    history: conversationHistory.slice(-6) // 发送最近6条消息作为上下文
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
            
        } catch (error) {
            console.error("API调用失败:", error);
            throw error;
        }
    }
    
    async function getAIResponse(userMessage) {
        try {
            return await callSparkAPI(userMessage);
        } catch (error) {
            return `抱歉，API调用失败: ${error.message}`;
        }
    }
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage('user', message);
        userInput.value = '';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message ai-message">
                <div class="message-header">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%236e8efb'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23a777e3'/%3E%3C/svg%3E" class="avatar">
                    <span>${getCelebrityInfo(currentCelebrity).name}</span>
                </div>
                <div class="typing">正在思考中...</div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            const response = await getAIResponse(message);
            document.getElementById('typingIndicator')?.remove();
            addMessage('ai', response);
        } catch (error) {
            document.getElementById('typingIndicator')?.remove();
            addMessage('ai', `错误: ${error.message}`);
        }
    }
    
    // 事件监听
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
    
    clearChatButton.addEventListener('click', () => {
        if (confirm('清空对话历史？')) {
            conversationHistory = [];
            localStorage.removeItem(`celebrityChatHistory_${currentCelebrity}`);
            chatMessages.innerHTML = '';
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
        }
    });
    
    celebrityButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentCelebrity = this.dataset.celebrity;
            localStorage.setItem('currentCelebrity', currentCelebrity);
            updateCelebrityButtons();
            
            const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
            conversationHistory = savedHistory ? JSON.parse(savedHistory) : [];
            
            renderConversationHistory();
            if (conversationHistory.length === 0) {
                addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
            }
        });
    });
    
    // 初始化
    loadFromStorage();
});
