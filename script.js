document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearChatButton = document.getElementById('clearChat');
    const celebrityButtons = document.querySelectorAll('.celebrity-btn');
    
    let currentCelebrity = 'jay';
    let apiKey = '';
    let conversationHistory = [];
    
    // 星火大模型API配置 - 请替换为您的实际值
    const SPARK_CONFIG = {
        API_SECRET: "YWFiNDc3NmRhMDkxMjhhZDFiYjE2OWEw", // 替换为您的API_SECRET
        APP_ID: "11fa6957", // 替换为您的APP_ID
        HOST: "spark-api.xf-yun.com",
        PATH: "/v1.1/chat"
    };
    
    // 从localStorage加载数据
    function loadFromStorage() {
        const savedApiKey = localStorage.getItem('celebrityChatApiKey');
        const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
        const savedCelebrity = localStorage.getItem('currentCelebrity');
        
        if (savedApiKey) {
            apiKey = savedApiKey;
            apiKeyInput.value = '••••••••••••••••';
        }
        
        if (savedCelebrity) {
            currentCelebrity = savedCelebrity;
            document.querySelectorAll('.celebrity-btn').forEach(btn => {
                if (btn.dataset.celebrity === currentCelebrity) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            renderConversationHistory();
        } else {
            // 添加初始欢迎消息
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity));
        }
    }
    
    // 渲染对话历史
    function renderConversationHistory() {
        chatMessages.innerHTML = '';
        conversationHistory.forEach(msg => {
            addMessage(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
        });
    }
    
    // 保存到localStorage
    function saveToStorage() {
        localStorage.setItem('celebrityChatApiKey', apiKey);
        localStorage.setItem(`celebrityChatHistory_${currentCelebrity}`, JSON.stringify(conversationHistory));
        localStorage.setItem('currentCelebrity', currentCelebrity);
    }
    
    // 获取明星欢迎消息
    function getCelebrityWelcomeMessage(celebrity) {
        const welcomeMessages = {
            jay: "嗨！哎呦不错哦～我是Jay Chou的AI分身，今天有什么想聊的吗？音乐、电影还是生活？😎",
            taylor: "Hi! I'm Taylor Swift's AI. Ready to chat about music, cats, or life in general? 🌟",
            jackie: "大家好！我是成龙AI，很高兴和你聊天！想聊聊电影、动作特技还是慈善？😊",
            kris: "Yo! 我是Kris Wu的AI分身，你想聊音乐、时尚还是篮球？🆒"
        };
        return welcomeMessages[celebrity] || "你好！我是明星AI分身，很高兴和你聊天！";
    }
    
    // 获取明星信息
    function getCelebrityInfo(celebrity) {
        const celebrities = {
            jay: {
                name: "周杰伦AI",
                style: "以周杰伦的方式回应，使用中文，略带台湾口音，喜欢说'哎呦不错哦'、'超diao的'等口头禅，涉及音乐、电影、家庭话题"
            },
            taylor: {
                name: "泰勒AI",
                style: "以泰勒·斯威夫特的方式回应，使用英语，友好且善于表达，经常提及音乐创作、猫咪、女权主义等话题"
            },
            jackie: {
                name: "成龙AI",
                style: "以成龙的方式回应，使用中文，热情友好，喜欢分享电影拍摄趣事、动作特技和慈善工作"
            },
            kris: {
                name: "吴亦凡AI",
                style: "以吴亦凡的方式回应，使用中英文混合，酷炫风格，涉及音乐、时尚、篮球等话题"
            }
        };
        return celebrities[celebrity] || {name: "明星AI", style: "以友好且热情的方式回应"};
    }
    
    // 添加消息到聊天窗口
    function addMessage(sender, text, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        
        const celebrityInfo = getCelebrityInfo(currentCelebrity);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23${sender === 'user' ? '66a6ff' : 'ff7e5f'}'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23${sender === 'user' ? '89f7fe' : 'feb47b'}'/%3E%3C/svg%3E" class="avatar" alt="Avatar">
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
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 生成WebSocket所需的鉴权参数
    function getAuthParams(apiKey, apiSecret) {
        const host = SPARK_CONFIG.HOST;
        const path = SPARK_CONFIG.PATH;
        const date = new Date().toUTCString();
        
        // 生成签名
        const algorithm = 'hmac-sha256';
        const headers = 'host date request-line';
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        
        // 生成 authorization 参数
        const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
        
        // 使用更安全的方式编码，避免Latin1字符限制
        const authorization = btoa(unescape(encodeURIComponent(authorizationOrigin)));
        
        // 生成请求URL
        const url = `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
        
        return url;
    }
    
    // 调用星火大模型API
    async function callSparkAPI(userMessage) {
        return new Promise((resolve, reject) => {
            if (!apiKey) {
                reject("请先设置API密钥");
                return;
            }
            
            // 检查API密钥是否已配置
            if (!SPARK_CONFIG.API_SECRET || SPARK_CONFIG.API_SECRET === "您的API_SECRET" || 
                !SPARK_CONFIG.APP_ID || SPARK_CONFIG.APP_ID === "您的APP_ID") {
                reject("请先配置API_SECRET和APP_ID");
                return;
            }
            
            try {
                const url = getAuthParams(apiKey, SPARK_CONFIG.API_SECRET);
                const socket = new WebSocket(url);
                
                socket.onopen = () => {
                    // 构建请求数据
                    const celebrityInfo = getCelebrityInfo(currentCelebrity);
                    const requestData = {
                        header: {
                            app_id: SPARK_CONFIG.APP_ID,
                            uid: "user123"
                        },
                        parameter: {
                            chat: {
                                domain: "general",
                                temperature: 0.5,
                                max_tokens: 1024
                            }
                        },
                        payload: {
                            message: {
                                text: [
                                    {
                                        role: "user",
                                        content: `请你扮演${celebrityInfo.name}，${celebrityInfo.style}。请用这种风格回答以下问题：${userMessage}`
                                    }
                                ]
                            }
                        }
                    };
                    
                    socket.send(JSON.stringify(requestData));
                };
                
                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log("API响应:", data);
                        
                        if (data.header.code !== 0) {
                            reject(`API错误: ${data.header.message}`);
                            socket.close();
                            return;
                        }
                        
                        // 确保有文本内容
                        if (data.payload && data.payload.choices && data.payload.choices.text && data.payload.choices.text[0] && data.payload.choices.text[0].content) {
                            const text = data.payload.choices.text[0].content;
                            resolve(text);
                        } else {
                            reject("API响应格式不正确");
                        }
                        
                        // 如果状态为2，则表示所有数据接收完毕，可以关闭连接
                        if (data.header.status === 2) {
                            socket.close();
                        }
                    } catch (e) {
                        reject(`解析API响应时出错: ${e.message}`);
                    }
                };
                
                socket.onerror = (error) => {
                    // 更详细的错误信息
                    console.error("WebSocket错误详情:", error);
                    reject(`WebSocket连接错误: 请检查API密钥和网络连接`);
                };
                
                // 设置超时
                setTimeout(() => {
                    if (socket.readyState !== WebSocket.CLOSED) {
                        reject("API调用超时");
                        socket.close();
                    }
                }, 10000);
                
            } catch (error) {
                reject(`调用API时出错: ${error.message}`);
            }
        });
    }
    
    // 获取AI响应
    async function getAIResponse(userMessage) {
        try {
            const response = await callSparkAPI(userMessage);
            return response;
        } catch (error) {
            console.error("API调用失败:", error);
            return `抱歉，调用API时出错: ${error}`;
        }
    }
    
    // 发送消息
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage('user', message);
        userInput.value = '';
        
        // 显示"正在输入"指示器
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'ai-message');
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message-header">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23ff7e5f'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23feb47b'/%3E%3C/svg%3E" class="avatar" alt="AI Avatar">
                <span>${getCelebrityInfo(currentCelebrity).name}</span>
            </div>
            <div class="typing">正在输入...</div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 获取AI响应
        const response = await getAIResponse(message);
        
        // 移除"正在输入"指示器
        document.getElementById('typingIndicator')?.remove();
        
        // 添加AI响应
        addMessage('ai', response);
    }
    
    // 事件监听器
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    saveApiKeyButton.addEventListener('click', function() {
        const key = apiKeyInput.value.trim();
        if (key) {
            apiKey = key;
            localStorage.setItem('celebrityChatApiKey', apiKey);
            apiKeyInput.value = '••••••••••••••••';
            alert('API密钥已保存！');
        } else if (apiKeyInput.value === '••••••••••••••••') {
            alert('API密钥已保存！');
        } else {
            alert('请输入有效的API密钥');
        }
    });
    
    clearChatButton.addEventListener('click', function() {
        if (confirm('确定要清空对话历史吗？')) {
            conversationHistory = [];
            localStorage.removeItem(`celebrityChatHistory_${currentCelebrity}`);
            chatMessages.innerHTML = '';
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity));
        }
    });
    
    celebrityButtons.forEach(button => {
        button.addEventListener('click', function() {
            celebrityButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 保存当前对话历史
            saveToStorage();
            
            // 切换明星
            currentCelebrity = this.dataset.celebrity;
            localStorage.setItem('currentCelebrity', currentCelebrity);
            
            // 加载新明星的对话历史
            const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
            conversationHistory = savedHistory ? JSON.parse(savedHistory) : [];
            
            // 渲染对话历史或添加欢迎消息
            if (conversationHistory.length > 0) {
                renderConversationHistory();
            } else {
                chatMessages.innerHTML = '';
                addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity));
            }
        });
    });
    
    // 初始化加载
    loadFromStorage();
});
