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
    
    // 星火大模型API配置 - 使用X1-32K版本
    const SPARK_CONFIG = {
        API_SECRET: "YWFiNDc3NmRhMDkxMjhhZDFiYjE2OWEw", // 您的APISecret
        APP_ID: "11fa6957", // 您的APPID
        HOST: "spark-api.xf-yun.com",
        PATH: "/v1/x1", // X1-32K版本的接口路径
        DOMAIN: "x1" // 修正为正确的domain值
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
            updateCelebrityButtons();
        }
        
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            renderConversationHistory();
        } else {
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
        }
    }
    
    // 更新明星按钮状态
    function updateCelebrityButtons() {
        celebrityButtons.forEach(btn => {
            if (btn.dataset.celebrity === currentCelebrity) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
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
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 验证API配置
    function validateAPIConfig() {
        if (!apiKey) {
            return "请先设置API密钥";
        }
        if (!SPARK_CONFIG.API_SECRET) {
            return "请配置正确的API_SECRET";
        }
        if (!SPARK_CONFIG.APP_ID) {
            return "请配置正确的APP_ID";
        }
        return null;
    }
    
    // 生成WebSocket所需的鉴权参数
    function getAuthParams(apiKey, apiSecret) {
        const host = SPARK_CONFIG.HOST;
        const path = SPARK_CONFIG.PATH;
        const date = new Date().toUTCString();
        
        const algorithm = 'hmac-sha256';
        const headers = 'host date request-line';
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        
        const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
        const authorization = btoa(unescape(encodeURIComponent(authorizationOrigin)));
        
        return `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
    }
    
    // 调用星火大模型API
    async function callSparkAPI(userMessage) {
        return new Promise((resolve, reject) => {
            // 验证配置
            const configError = validateAPIConfig();
            if (configError) {
                reject(configError);
                return;
            }
            
            try {
                const url = getAuthParams(apiKey, SPARK_CONFIG.API_SECRET);
                const socket = new WebSocket(url);
                
                socket.onopen = () => {
                    const celebrityInfo = getCelebrityInfo(currentCelebrity);
                    
                    // X1-32K版本的请求格式
                    const requestData = {
                        header: {
                            app_id: SPARK_CONFIG.APP_ID,
                            uid: "user123"
                        },
                        parameter: {
                            chat: {
                                domain: SPARK_CONFIG.DOMAIN, // 使用正确的domain值
                                temperature: 0.7,
                                max_tokens: 2048
                            }
                        },
                        payload: {
                            message: {
                                text: [{
                                    role: "user",
                                    content: `请你扮演${celebrityInfo.name}，${celebrityInfo.style}。请用这种风格回答：${userMessage}`
                                }]
                            }
                        }
                    };
                    
                    console.log("发送请求:", JSON.stringify(requestData, null, 2));
                    socket.send(JSON.stringify(requestData));
                };
                
                let fullResponse = "";
                
                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log("收到响应:", data);
                        
                        if (data.header.code !== 0) {
                            reject(`API错误: ${data.header.message} (代码: ${data.header.code})`);
                            socket.close();
                            return;
                        }
                        
                        // 累积响应内容
                        if (data.payload?.choices?.text?.[0]?.content) {
                            fullResponse += data.payload.choices.text[0].content;
                        }
                        
                        // 如果状态为2，则表示所有数据接收完毕
                        if (data.header.status === 2) {
                            if (fullResponse) {
                                resolve(fullResponse);
                            } else {
                                reject("API返回空响应");
                            }
                            socket.close();
                        }
                    } catch (e) {
                        reject(`解析响应出错: ${e.message}`);
                    }
                };
                
                socket.onerror = (error) => {
                    console.error("WebSocket错误:", error);
                    reject(`网络连接错误: 请检查网络设置和API配置`);
                };
                
                socket.onclose = (event) => {
                    if (event.code !== 1000 && !fullResponse) {
                        reject(`连接关闭: ${event.code} - ${event.reason}`);
                    }
                };
                
                // 设置超时
                setTimeout(() => {
                    if (socket.readyState !== WebSocket.CLOSED) {
                        reject("请求超时（15秒）");
                        socket.close();
                    }
                }, 15000);
                
            } catch (error) {
                reject(`调用API失败: ${error.message}`);
            }
        });
    }
    
    // 获取AI响应
    async function getAIResponse(userMessage) {
        try {
            return await callSparkAPI(userMessage);
        } catch (error) {
            console.error("API调用错误:", error);
            return `抱歉，调用API时出错: ${error}`;
        }
    }
    
    // 发送消息
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage('user', message);
        userInput.value = '';
        
        // 显示加载状态
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message ai-message">
                <div class="message-header">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23ff7e5f'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23feb47b'/%3E%3C/svg%3E" class="avatar">
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
            addMessage('ai', `抱歉，发生错误: ${error}`);
        }
    }
    
    // 事件监听器
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
    
    saveApiKeyButton.addEventListener('click', function() {
        const key = apiKeyInput.value.trim();
        if (key) {
            apiKey = key;
            localStorage.setItem('celebrityChatApiKey', apiKey);
            apiKeyInput.value = '••••••••••••••••';
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
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
        }
    };
    
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
