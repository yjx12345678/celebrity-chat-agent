document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const clearChatButton = document.getElementById('clearChat');
    const celebrityButtons = document.querySelectorAll('.celebrity-btn');
    
    let currentCelebrity = 'jay';
    let conversationHistory = [];
    let currentWebSocket = null;
    
    // WebSocket API配置
    const SPARK_CONFIG = {
        API_KEY: "157667d9f972963adacc2bc7a506f55f",
        API_SECRET: "YWFiNDc3NmRhMDkxMjhhZDFiYjE2OWEw",
        APP_ID: "11fa6957",
        API_URL: "wss://spark-api.xf-yun.com/v1/x1"
    };
    
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
    
    // 生成WebSocket认证URL
    function generateWebSocketURL() {
        const host = "spark-api.xf-yun.com";
        const path = "/v1/x1";
        const date = new Date().toUTCString();
        
        // 生成签名
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, SPARK_CONFIG.API_SECRET);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        
        // 生成授权参数
        const authorizationOrigin = `api_key="${SPARK_CONFIG.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
        const authorization = Buffer.from(authorizationOrigin).toString('base64');
        
        // 返回WebSocket URL
        return `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
    }
    
    // 调用星火WebSocket API
    async function callSparkAPI(userMessage) {
        return new Promise((resolve, reject) => {
            const wsUrl = generateWebSocketURL();
            const ws = new WebSocket(wsUrl);
            currentWebSocket = ws;
            
            let fullResponse = "";
            let responseReceived = false;
            
            const celebrityInfo = getCelebrityInfo(currentCelebrity);
            
            ws.onopen = () => {
                console.log("WebSocket连接已建立");
                
                const requestData = {
                    header: {
                        app_id: SPARK_CONFIG.APP_ID,
                        uid: "user123"
                    },
                    parameter: {
                        chat: {
                            domain: "general",
                            temperature: 0.7,
                            max_tokens: 2048
                        }
                    },
                    payload: {
                        message: {
                            text: [
                                {
                                    role: "user",
                                    content: `请你扮演${celebrityInfo.name}，使用${celebrityInfo.style}与用户对话。保持角色一致性，模仿该明星的说话方式和特点。用户说：${userMessage}`
                                }
                            ]
                        }
                    }
                };
                
                console.log("发送请求:", JSON.stringify(requestData));
                ws.send(JSON.stringify(requestData));
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("收到消息:", data);
                    
                    if (data.payload && data.payload.choices && data.payload.choices.text) {
                        data.payload.choices.text.forEach(text => {
                            if (text.content && text.content !== "null") {
                                fullResponse += text.content;
                            }
                        });
                    }
                    
                    // 检查会话是否结束
                    if (data.header && data.header.status === 2) {
                        responseReceived = true;
                        ws.close();
                        if (fullResponse) {
                            resolve(fullResponse);
                        } else {
                            resolve("抱歉，我没有理解您的意思，可以再说一次吗？");
                        }
                    }
                } catch (error) {
                    console.error("解析消息错误:", error);
                }
            };
            
            ws.onerror = (error) => {
                console.error("WebSocket错误:", error);
                reject(new Error("网络连接失败，请检查网络设置"));
            };
            
            ws.onclose = (event) => {
                currentWebSocket = null;
                if (!responseReceived && !fullResponse) {
                    reject(new Error("连接已关闭，未收到完整响应"));
                }
            };
            
            // 设置超时
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                if (!responseReceived) {
                    reject(new Error("请求超时，请重试"));
                }
            }, 30000); // 30秒超时
        });
    }
    
    async function getAIResponse(userMessage) {
        try {
            return await callSparkAPI(userMessage);
        } catch (error) {
            console.error("API调用失败:", error);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
                return "网络连接失败，请检查您的网络设置后重试。";
            } else if (error.message.includes('timeout')) {
                return "请求超时，可能是网络较慢，请稍后重试。";
            } else if (error.message.includes('Unauthorized')) {
                return "API认证失败，请检查API密钥配置。";
            } else {
                return `抱歉，暂时无法处理您的请求: ${error.message}`;
            }
        }
    }
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // 关闭之前的连接（如果有）
        if (currentWebSocket) {
            currentWebSocket.close();
            currentWebSocket = null;
        }
        
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
